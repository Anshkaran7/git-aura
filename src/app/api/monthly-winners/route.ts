import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get("monthYear");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    if (monthYear) {
      // Get winners for specific month
      const winners = await prisma.monthlyWinners.findMany({
        where: {
          monthYear: monthYear,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              githubUsername: true,
              avatarUrl: true,
              userBadges: {
                where: {
                  monthYear: monthYear,
                  badge: {
                    isMonthly: true,
                  },
                },
                include: {
                  badge: true,
                },
              },
            },
          },
        },
        orderBy: {
          rank: "asc",
        },
      });

      return NextResponse.json({
        success: true,
        monthYear: monthYear,
        winners: winners.map((winner) => ({
          id: winner.id,
          rank: winner.rank,
          totalAura: winner.totalAura,
          contributionsCount: winner.contributionsCount,
          badgeAwarded: winner.badgeAwarded,
          capturedAt: winner.capturedAt,
          user: {
            id: winner.user.id,
            displayName: winner.user.displayName || winner.user.githubUsername,
            githubUsername: winner.user.githubUsername,
            avatarUrl:
              winner.user.avatarUrl ||
              `https://github.com/${winner.user.githubUsername}.png`,
            badges: winner.user.userBadges.map((ub) => ({
              id: ub.badge.id,
              name: ub.badge.name,
              description: ub.badge.description,
              icon: ub.badge.icon,
              color: ub.badge.color,
              rarity: ub.badge.rarity,
              rank: ub.rank,
            })),
          },
        })),
      });
    } else {
      // Get all monthly winners with pagination
      const skip = (page - 1) * limit;

      // Get distinct months first
      const monthsData = await prisma.monthlyWinners.groupBy({
        by: ["monthYear"],
        orderBy: {
          monthYear: "desc",
        },
        skip: skip,
        take: limit,
      });

      const totalMonths = await prisma.monthlyWinners.groupBy({
        by: ["monthYear"],
      });

      // Handle case when no monthly winners exist yet
      if (monthsData.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalMonths: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }

      // Get winners for each month
      const allWinners = await Promise.all(
        monthsData.map(async (month) => {
          const winners = await prisma.monthlyWinners.findMany({
            where: {
              monthYear: month.monthYear,
            },
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  githubUsername: true,
                  avatarUrl: true,
                  userBadges: {
                    where: {
                      monthYear: month.monthYear,
                      badge: {
                        isMonthly: true,
                      },
                    },
                    include: {
                      badge: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              rank: "asc",
            },
          });

          return {
            monthYear: month.monthYear,
            winners: winners.map((winner) => ({
              id: winner.id,
              rank: winner.rank,
              totalAura: winner.totalAura,
              contributionsCount: winner.contributionsCount,
              badgeAwarded: winner.badgeAwarded,
              capturedAt: winner.capturedAt,
              user: {
                id: winner.user.id,
                displayName:
                  winner.user.displayName || winner.user.githubUsername,
                githubUsername: winner.user.githubUsername,
                avatarUrl:
                  winner.user.avatarUrl ||
                  `https://github.com/${winner.user.githubUsername}.png`,
                badges: winner.user.userBadges.map((ub) => ({
                  id: ub.badge.id,
                  name: ub.badge.name,
                  description: ub.badge.description,
                  icon: ub.badge.icon,
                  color: ub.badge.color,
                  rarity: ub.badge.rarity,
                  rank: ub.rank,
                })),
              },
            })),
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: allWinners,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMonths.length / limit),
          totalMonths: totalMonths.length,
          hasNextPage: page < Math.ceil(totalMonths.length / limit),
          hasPrevPage: page > 1,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error fetching monthly winners:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      {
        error: "Failed to fetch monthly winners",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
