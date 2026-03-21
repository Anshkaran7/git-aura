import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMonthlyRankingValues, sortMonthlyRankedEntries } from "@/lib/leaderboard";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestBody: { monthYear?: string } = {};
    try {
      requestBody = await request.json();
    } catch {
      requestBody = {};
    }

    const now = new Date();
    const currentMonthYear =
      requestBody.monthYear ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const leaderboardEntries = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: currentMonthYear,
        user: {
          isBanned: false,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            githubUsername: true,
            avatarUrl: true,
          },
        },
      },
    });

    const topUsers = sortMonthlyRankedEntries(
      leaderboardEntries,
      (entry) => ({
        ...getMonthlyRankingValues(
          entry.totalAura,
          entry.contributionsCount,
          currentMonthYear,
          entry.user.githubUsername || ""
        ),
      })
    ).slice(0, 3);

    if (topUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No users found in monthly leaderboard for ${currentMonthYear}`,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.monthlyWinners.deleteMany({
        where: {
          monthYear: currentMonthYear,
        },
      });

      for (let index = 0; index < topUsers.length; index += 1) {
        const user = topUsers[index];

        await tx.monthlyWinners.create({
          data: {
            userId: user.userId,
            monthYear: currentMonthYear,
            rank: index + 1,
            totalAura: getMonthlyRankingValues(
              user.totalAura,
              user.contributionsCount,
              currentMonthYear,
              user.user.githubUsername || ""
            ).aura,
            contributionsCount: user.contributionsCount,
            badgeAwarded: false,
          },
        });
      }
    });

    const savedWinners = topUsers.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user.userId,
        displayName: user.user.displayName,
        githubUsername: user.user.githubUsername,
        avatarUrl: user.user.avatarUrl,
      },
      totalAura: getMonthlyRankingValues(
        user.totalAura,
        user.contributionsCount,
        currentMonthYear,
        user.user.githubUsername || ""
      ).aura,
      contributionsCount: user.contributionsCount,
    }));

    try {
      const isCurrentMonth =
        currentMonthYear ===
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      if (isCurrentMonth) {
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
        }
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
