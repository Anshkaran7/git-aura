import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type MonthlyLeaderboardWithRelations = Prisma.MonthlyLeaderboardGetPayload<{
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
    const monthYear = searchParams.get("monthYear");
    const userId = searchParams.get("userId");

    if (!monthYear) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 }
      );
    }

    // Parse the month and year
    const [year, month] = monthYear.split("-").map(Number);

    // Calculate the start and end of the requested month
    const monthStart = new Date(year, month - 1, 1); // month is 0-based in Date constructor
    const monthEnd = new Date(year, month, 0); // Last day of the month

    // First, get all non-banned users who joined before or during this month
    const allUsers = await prisma.user.findMany({
      where: {
        isBanned: false,
        createdAt: {
          lte: monthEnd, // User must have joined before or during this month
        },
      },
      select: {
        id: true,
        displayName: true,
        githubUsername: true,
        avatarUrl: true,
        currentStreak: true,
        createdAt: true,
        userBadges: {
          where: {
            monthYear: monthYear,
          },
          include: {
            badge: true,
          },
        },
      },
    });

    // Then, get monthly leaderboard data
    const monthlyData = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: monthYear,
        user: {
          isBanned: false,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    // Create a map of user IDs to their monthly data
    const monthlyDataMap = new Map(
      monthlyData.map((entry) => [entry.user.id, entry])
    );

    // Combine the data, using 0 for users without monthly activity
    const transformedData = allUsers.map((user) => {
      const monthlyEntry = monthlyDataMap.get(user.id);

      return {
        rank: 0, // Will be calculated after sorting
        user: {
          id: user.id,
          display_name: user.displayName || user.githubUsername || "",
          github_username: user.githubUsername || "",
          avatar_url:
            user.avatarUrl || `https://github.com/${user.githubUsername}.png`,
          current_streak: user.currentStreak || 0,
        },
        aura: monthlyEntry?.totalAura || 0,
        contributions: monthlyEntry?.contributionsCount || 0,
        badges: user.userBadges
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
      };
    });

    // Sort by aura points and assign ranks
    const sortedData = transformedData
      .sort((a, b) => b.aura - a.aura)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // Find user's rank if userId is provided
    let userRank = null;
    if (userId) {
      const userIndex = sortedData.findIndex(
        (entry) => entry.user.id === userId
      );
      userRank = userIndex !== -1 ? userIndex + 1 : null;
    }

    return NextResponse.json({
      leaderboard: sortedData,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: sortedData.length,
        hasNextPage: false,
        hasPrevPage: false,
        limit: sortedData.length,
      },
      userRank,
    });
  } catch (error) {
    console.error("Error in monthly leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
