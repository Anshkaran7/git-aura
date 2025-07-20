import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthYear } from "@/lib/utils2";

// Badge definitions for top 3 positions
const TOP_3_BADGES = [
  {
    name: "Monthly Champion",
    description: "Crowned #1 developer of the month! 🏆",
    icon: "🏆",
    color: "#FFD700",
    rarity: "LEGENDARY",
    position: 1,
  },
  {
    name: "Monthly Runner-up",
    description: "Amazing work! Secured #2 position! 🥈",
    icon: "🥈",
    color: "#C0C0C0",
    rarity: "EPIC",
    position: 2,
  },
  {
    name: "Monthly Bronze",
    description: "Excellent performance! Earned #3 spot! 🥉",
    icon: "🥉",
    color: "#CD7F32",
    rarity: "RARE",
    position: 3,
  },
];

export async function POST(req: NextRequest) {
  try {
    console.log("🏆 Starting badge awarding process...");

    const currentMonthYear = getCurrentMonthYear();
    console.log(`📅 Processing badges for: ${currentMonthYear}`);

    // Create or update badges in the database
    const badges = await Promise.all(
      TOP_3_BADGES.map(async (badgeData) => {
        return await prisma.badge.upsert({
          where: {
            name: `${badgeData.name} - ${currentMonthYear}`,
          },
          create: {
            name: `${badgeData.name} - ${currentMonthYear}`,
            description: badgeData.description,
            icon: badgeData.icon,
            color: badgeData.color,
            rarity: badgeData.rarity as any,
            isMonthly: true,
            isActive: true,
            criteria: {
              rank: badgeData.position,
              monthYear: currentMonthYear,
            },
          },
          update: {
            description: badgeData.description,
            icon: badgeData.icon,
            color: badgeData.color,
            isActive: true,
          },
        });
      })
    );

    console.log(`✅ Created/updated ${badges.length} badges`);

    // Get top 3 users from monthly leaderboard
    const topUsers = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: currentMonthYear,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            githubUsername: true,
          },
        },
      },
      orderBy: {
        totalAura: "desc",
      },
      take: 3,
    });

    console.log(`🔍 Found ${topUsers.length} top users for this month`);

    if (topUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users found in monthly leaderboard",
        awardedBadges: [],
      });
    }

    // Award badges to top 3 users
    const awardedBadges = [];

    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const position = i + 1;
      const badge = badges[i]; // badges array corresponds to positions 1, 2, 3

      if (!badge) continue;

      try {
        // Check if user already has this badge
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId_monthYear: {
              userId: user.userId,
              badgeId: badge.id,
              monthYear: currentMonthYear,
            },
          },
        });

        if (!existingBadge) {
          // Award the badge
          const userBadge = await prisma.userBadge.create({
            data: {
              userId: user.userId,
              badgeId: badge.id,
              monthYear: currentMonthYear,
              rank: position,
              metadata: {
                totalAura: user.totalAura,
                contributionsCount: user.contributionsCount,
                awardedAt: new Date().toISOString(),
              },
            },
            include: {
              user: {
                select: {
                  displayName: true,
                  githubUsername: true,
                },
              },
              badge: true,
            },
          });

          awardedBadges.push({
            position,
            user: {
              id: user.userId,
              displayName: userBadge.user.displayName,
              githubUsername: userBadge.user.githubUsername,
            },
            badge: {
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              rarity: badge.rarity,
            },
            aura: user.totalAura,
          });

          console.log(
            `🏅 Awarded "${badge.name}" to ${
              userBadge.user.displayName || userBadge.user.githubUsername
            } (Position #${position})`
          );
        } else {
          console.log(
            `ℹ️ User ${
              user.user.displayName || user.user.githubUsername
            } already has badge for position #${position}`
          );
        }
      } catch (error) {
        console.error(`❌ Error awarding badge to user ${user.userId}:`, error);
      }
    }

    console.log(
      `🎉 Badge awarding process completed. Awarded ${awardedBadges.length} new badges.`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully processed badges for ${currentMonthYear}`,
      monthYear: currentMonthYear,
      topUsers: topUsers.map((user, index) => ({
        position: index + 1,
        user: {
          id: user.userId,
          displayName: user.user.displayName,
          githubUsername: user.user.githubUsername,
        },
        aura: user.totalAura,
      })),
      awardedBadges,
    });
  } catch (error) {
    console.error("❌ Error in badge awarding process:", error);
    return NextResponse.json(
      {
        error: "Failed to award badges",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check current badge status
export async function GET(req: NextRequest) {
  try {
    const currentMonthYear = getCurrentMonthYear();

    // Get top 3 users and their badges for current month
    const topUsers = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: currentMonthYear,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            githubUsername: true,
            userBadges: {
              where: {
                monthYear: currentMonthYear,
              },
              include: {
                badge: true,
              },
            },
          },
        },
      },
      orderBy: {
        totalAura: "desc",
      },
      take: 3,
    });

    return NextResponse.json({
      monthYear: currentMonthYear,
      topUsers: topUsers.map((user, index) => ({
        position: index + 1,
        user: {
          id: user.userId,
          displayName: user.user.displayName,
          githubUsername: user.user.githubUsername,
        },
        aura: user.totalAura,
        badges: user.user.userBadges.map((ub) => ({
          name: ub.badge?.name,
          description: ub.badge?.description,
          icon: ub.badge?.icon,
          rarity: ub.badge?.rarity,
          rank: ub.rank,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching badge status:", error);
    return NextResponse.json(
      { error: "Failed to fetch badge status" },
      { status: 500 }
    );
  }
}
