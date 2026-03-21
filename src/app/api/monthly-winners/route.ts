import { NextRequest, NextResponse } from "next/server";
import { getGitHubAvatarFallback } from "@/lib/avatar";
import { prisma } from "@/lib/prisma";
import {
  getMonthlyRankingValues,
  LEADERBOARD_LAUNCH_MONTH,
  sortMonthlyRankedEntries,
} from "@/lib/leaderboard";

async function getResolvedMonthlyWinners(monthYear: string) {
  const [leaderboardEntries, storedWinners] = await Promise.all([
    prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear,
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
            userBadges: {
              where: {
                monthYear,
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
    }),
    prisma.monthlyWinners.findMany({
      where: {
        monthYear,
      },
    }),
  ]);

  const storedWinnerByUserId = new Map(
    storedWinners.map((winner) => [winner.userId, winner])
  );

  return sortMonthlyRankedEntries(
    leaderboardEntries,
    (entry) => ({
      ...getMonthlyRankingValues(
        entry.totalAura,
        entry.contributionsCount,
        monthYear,
        entry.user.githubUsername || ""
      ),
    })
  )
    .slice(0, 3)
    .map((winner, index) => {
      const storedWinner = storedWinnerByUserId.get(winner.userId);
      const normalizedAura = getMonthlyRankingValues(
        winner.totalAura,
        winner.contributionsCount,
        monthYear,
        winner.user.githubUsername || ""
      ).aura;

      return {
        id: storedWinner?.id || `${monthYear}-${winner.userId}`,
        rank: index + 1,
        totalAura: normalizedAura,
        contributionsCount: winner.contributionsCount,
        badgeAwarded:
          storedWinner?.badgeAwarded ||
          winner.user.userBadges.some((userBadge) => userBadge.badge?.isMonthly),
        capturedAt: storedWinner?.capturedAt || winner.createdAt,
        user: {
          id: winner.user.id,
          displayName: winner.user.displayName || winner.user.githubUsername,
          githubUsername: winner.user.githubUsername,
          avatarUrl:
            winner.user.avatarUrl ||
            getGitHubAvatarFallback(winner.user.githubUsername) ||
            "",
          badges: winner.user.userBadges.map((userBadge) => ({
            id: userBadge.badge.id,
            name: userBadge.badge.name,
            description: userBadge.badge.description,
            icon: userBadge.badge.icon,
            color: userBadge.badge.color,
            rarity: userBadge.badge.rarity,
            rank: userBadge.rank,
          })),
        },
      };
    });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get("monthYear");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (monthYear) {
      const winners = await getResolvedMonthlyWinners(monthYear);

      return NextResponse.json({
        success: true,
        monthYear,
        winners,
      });
    }

    const allMonths = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: {
          gte: LEADERBOARD_LAUNCH_MONTH,
        },
        user: {
          isBanned: false,
        },
      },
      select: {
        monthYear: true,
      },
      distinct: ["monthYear"],
      orderBy: {
        monthYear: "desc",
      },
    });

    if (allMonths.length === 0) {
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

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const startIndex = (safePage - 1) * safeLimit;
    const pagedMonths = allMonths.slice(startIndex, startIndex + safeLimit);

    const data = await Promise.all(
      pagedMonths.map(async (month) => ({
        monthYear: month.monthYear,
        winners: await getResolvedMonthlyWinners(month.monthYear),
      }))
    );

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(allMonths.length / safeLimit),
        totalMonths: allMonths.length,
        hasNextPage: safePage < Math.ceil(allMonths.length / safeLimit),
        hasPrevPage: safePage > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching monthly winners:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch monthly winners",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
