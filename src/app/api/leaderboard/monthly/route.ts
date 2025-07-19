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
        totalAura: true;
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
        { error: "monthYear parameter is required" },
        { status: 400 }
      );
    }

    // Fetch monthly leaderboard data
    const monthlyData = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            githubUsername: true,
            avatarUrl: true,
            totalAura: true,
            currentStreak: true,
            userBadges: {
              include: {
                badge: true,
              },
            },
          },
        },
      },
    });

    // Transform the data to match the frontend expectations
    const transformedData = monthlyData.map((entry) => ({
      rank: 0, // Will be calculated on frontend
      user: {
        id: entry.user.id,
        github_username: entry.user.githubUsername || "",
        display_name: entry.user.displayName || entry.user.githubUsername || "",
        avatar_url:
          entry.user.avatarUrl ||
          `https://github.com/${entry.user.githubUsername}.png`,
        total_aura: entry.user.totalAura || 0,
        current_streak: entry.user.currentStreak || 0,
      },
      aura: entry.totalAura,
      contributions: entry.contributionsCount,
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

    return NextResponse.json({
      leaderboard: transformedData,
      monthYear,
    });
  } catch (error) {
    console.error("Error in monthly leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
