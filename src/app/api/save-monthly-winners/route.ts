import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // For month end capture, we want to capture the data for the month that's ending
    // If it's the last day of the month, capture current month
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    console.log(`🏆 Capturing monthly winners for ${currentMonthYear}`);

    // Get top 3 users from monthly leaderboard for the current month
    const topUsers = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: currentMonthYear,
        user: {
          isBanned: false, // Exclude banned users
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            githubUsername: true,
            avatarUrl: true,
            isBanned: true,
          },
        },
      },
      orderBy: {
        totalAura: "desc",
      },
      take: 3,
    });

    if (topUsers.length === 0) {
      console.log(
        `❌ No users found in monthly leaderboard for ${currentMonthYear}`
      );
      return NextResponse.json({
        success: false,
        message: `No users found in monthly leaderboard for ${currentMonthYear}`,
      });
    }

    const savedWinners = [];

    // Save top 3 as monthly winners
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const rank = i + 1;

      try {
        // Check if this user is already saved as a winner for this month
        const existingWinner = await prisma.monthlyWinners.findUnique({
          where: {
            userId_monthYear: {
              userId: user.userId,
              monthYear: currentMonthYear,
            },
          },
        });

        if (!existingWinner) {
          // Save the winner
          const winner = await prisma.monthlyWinners.create({
            data: {
              userId: user.userId,
              monthYear: currentMonthYear,
              rank: rank,
              totalAura: user.totalAura,
              contributionsCount: user.contributionsCount,
              badgeAwarded: false, // Will be updated when badge is awarded
            },
            include: {
              user: {
                select: {
                  displayName: true,
                  githubUsername: true,
                  avatarUrl: true,
                },
              },
            },
          });

          savedWinners.push({
            rank: rank,
            user: {
              id: user.userId,
              displayName: winner.user.displayName,
              githubUsername: winner.user.githubUsername,
              avatarUrl: winner.user.avatarUrl,
            },
            totalAura: user.totalAura,
            contributionsCount: user.contributionsCount,
          });

          console.log(
            `✅ Saved ${winner.user.githubUsername} as #${rank} winner for ${currentMonthYear}`
          );
        } else {
          console.log(
            `ℹ️ ${user.user.githubUsername} already saved as winner for ${currentMonthYear}`
          );
        }
      } catch (error) {
        console.error(`❌ Error saving winner for user ${user.userId}:`, error);
      }
    }

    // Also trigger badge awarding for these winners
    try {
      const badgeResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/award-badges`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (badgeResponse.ok) {
        // Update badge awarded status for saved winners
        for (const winner of savedWinners) {
          await prisma.monthlyWinners.updateMany({
            where: {
              userId: winner.user.id,
              monthYear: currentMonthYear,
            },
            data: {
              badgeAwarded: true,
            },
          });
        }
        console.log(`🏅 Badges awarded for ${currentMonthYear} winners`);
      }
    } catch (error) {
      console.error("❌ Error awarding badges:", error);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully captured ${savedWinners.length} monthly winners for ${currentMonthYear}`,
      monthYear: currentMonthYear,
      winners: savedWinners,
    });
  } catch (error) {
    console.error("❌ Error saving monthly winners:", error);
    return NextResponse.json(
      { error: "Failed to save monthly winners" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Monthly Winners Capture Endpoint",
    description:
      "POST to this endpoint to capture current month's top 3 users as winners",
    usage: "This endpoint is automatically called by cron job at month end",
  });
}
