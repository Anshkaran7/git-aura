import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPagination,
  paginateEntries,
  parseLeaderboardPagination,
} from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = parseLeaderboardPagination(searchParams);
    const userId = searchParams.get("userId");
    const username = searchParams.get("username")?.trim().toLowerCase();

    const alltimeData = await prisma.globalLeaderboard.findMany({
      where: {
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
            currentStreak: true,
            userBadges: {
              include: {
                badge: true,
              },
            },
          },
        },
      },
      orderBy: [{ totalAura: "desc" }, { year: "desc" }],
    });

    const userBestEntries = new Map<string, (typeof alltimeData)[number]>();

    alltimeData.forEach((entry) => {
      const existingEntry = userBestEntries.get(entry.userId);

      if (!existingEntry || entry.totalAura > existingEntry.totalAura) {
        userBestEntries.set(entry.userId, entry);
      }
    });

    const rankedEntries = Array.from(userBestEntries.values())
      .sort((leftEntry, rightEntry) => {
        if (rightEntry.totalAura !== leftEntry.totalAura) {
          return rightEntry.totalAura - leftEntry.totalAura;
        }

        return (leftEntry.user.githubUsername || "").localeCompare(
          rightEntry.user.githubUsername || ""
        );
      })
      .map((entry, index) => ({
        rank: index + 1,
        user: {
          id: entry.user.id,
          display_name:
            entry.user.displayName || entry.user.githubUsername || "",
          github_username: entry.user.githubUsername || "",
          avatar_url:
            entry.user.avatarUrl ||
            `https://github.com/${entry.user.githubUsername}.png`,
          total_aura: entry.totalAura,
          current_streak: entry.user.currentStreak || 0,
        },
        aura: entry.totalAura,
        badges: entry.user.userBadges
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
    console.error("Error in all-time leaderboard API:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
