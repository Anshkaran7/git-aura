import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPagination,
  paginateEntries,
  parseLeaderboardPagination,
  parseMonthWindow,
} from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthWindow = parseMonthWindow(searchParams.get("monthYear"));
    const { page, limit } = parseLeaderboardPagination(searchParams);
    const userId = searchParams.get("userId");
    const username = searchParams.get("username")?.trim().toLowerCase();

    if (!monthWindow) {
      return NextResponse.json(
        { error: "A valid monthYear in YYYY-MM format is required." },
        { status: 400 }
      );
    }

    const [allUsers, monthlyData] = await Promise.all([
      prisma.user.findMany({
        where: {
          isBanned: false,
          createdAt: {
            lte: monthWindow.monthEnd,
          },
        },
        select: {
          id: true,
          displayName: true,
          githubUsername: true,
          avatarUrl: true,
          currentStreak: true,
          userBadges: {
            where: {
              monthYear: monthWindow.monthYear,
            },
            include: {
              badge: true,
            },
          },
        },
      }),
      prisma.monthlyLeaderboard.findMany({
        where: {
          monthYear: monthWindow.monthYear,
          user: {
            isBanned: false,
          },
        },
        select: {
          userId: true,
          totalAura: true,
          contributionsCount: true,
        },
      }),
    ]);

    const monthlyDataMap = new Map(
      monthlyData.map((entry) => [entry.userId, entry])
    );

    const rankedEntries = allUsers
      .map((user) => {
        const leaderboardEntry = monthlyDataMap.get(user.id);

        return {
          rank: 0,
          user: {
            id: user.id,
            display_name: user.displayName || user.githubUsername || "",
            github_username: user.githubUsername || "",
            avatar_url:
              user.avatarUrl || `https://github.com/${user.githubUsername}.png`,
            total_aura: leaderboardEntry?.totalAura || 0,
            current_streak: user.currentStreak || 0,
          },
          aura: leaderboardEntry?.totalAura || 0,
          contributions: leaderboardEntry?.contributionsCount || 0,
          badges: user.userBadges
            .filter((userBadge) => userBadge.badge !== null)
            .map((userBadge) => ({
              id: userBadge.badge!.id,
              name: userBadge.badge!.name,
              description: userBadge.badge!.description || "",
              icon: userBadge.badge!.icon || "",
              color: userBadge.badge!.color || "",
              rarity: (userBadge.badge!.rarity || "COMMON").toLowerCase(),
              month_year: userBadge.monthYear || undefined,
              rank: userBadge.rank || undefined,
            })),
        };
      })
      .sort((leftEntry, rightEntry) => {
        if (rightEntry.aura !== leftEntry.aura) {
          return rightEntry.aura - leftEntry.aura;
        }

        if ((rightEntry.contributions || 0) !== (leftEntry.contributions || 0)) {
          return (rightEntry.contributions || 0) - (leftEntry.contributions || 0);
        }

        return leftEntry.user.github_username.localeCompare(
          rightEntry.user.github_username
        );
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    const userRankEntry = rankedEntries.find((entry) => {
      if (userId && entry.user.id === userId) {
        return true;
      }

      if (username && entry.user.github_username.toLowerCase() === username) {
        return true;
      }

      return false;
    });

    const pagination = buildPagination(rankedEntries.length, { page, limit });
    const leaderboard = paginateEntries(rankedEntries, {
      page: pagination.currentPage,
      limit: pagination.limit,
    });

    return NextResponse.json({
      leaderboard,
      pagination,
      userRank: userRankEntry?.rank ?? null,
    });
  } catch (error) {
    console.error("Error in monthly leaderboard API:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
