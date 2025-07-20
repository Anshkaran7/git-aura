import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type GlobalLeaderboardWithRelations = Prisma.GlobalLeaderboardGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        displayName: true;
        githubUsername: true;
        avatarUrl: true;
        currentStreak: true;
        userBadges: {
          include: {
            badge: true;
          };
        };
      };
    };
  };
}>;

type UserBadgeWithBadge = Prisma.UserBadgeGetPayload<{
  include: {
    badge: true;
  };
}>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Fetch all leaderboard data, ordered by totalAura descending
    const alltimeData = await prisma.globalLeaderboard.findMany({
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
      orderBy: {
        totalAura: "desc",
      },
    });

    // Transform the data and add calculated ranks
    const transformedData = alltimeData.map((entry, index) => ({
      rank: index + 1, // Calculate rank based on position
      user: {
        id: entry.user.id,
        display_name: entry.user.displayName || entry.user.githubUsername || "",
        github_username: entry.user.githubUsername || "",
        avatar_url:
          entry.user.avatarUrl ||
          `https://github.com/${entry.user.githubUsername}.png`,
        current_streak: entry.user.currentStreak || 0,
      },
      aura: entry.totalAura,
      badges: entry.user.userBadges
        .filter(
          (
            ub
          ): ub is UserBadgeWithBadge & {
            badge: NonNullable<UserBadgeWithBadge["badge"]>;
          } => ub.badge !== null
        )
        .map((ub) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          description: ub.badge.description || "",
          icon: ub.badge.icon || "",
          color: ub.badge.color || "",
          rarity: (ub.badge.rarity || "COMMON").toLowerCase(),
          month_year: ub.monthYear || null,
          rank: ub.rank || null,
        })),
    }));

    // If userId is provided, find user's rank
    let userRank = null;
    if (userId) {
      const userIndex = transformedData.findIndex(
        (entry) => entry.user.id === userId
      );
      userRank = userIndex !== -1 ? userIndex + 1 : null;
    }

    return NextResponse.json({
      leaderboard: transformedData,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: transformedData.length,
        hasNextPage: false,
        hasPrevPage: false,
        limit: transformedData.length,
      },
      userRank,
    });
  } catch (error) {
    console.error("Error in all-time leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
