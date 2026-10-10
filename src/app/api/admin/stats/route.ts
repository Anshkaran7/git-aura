import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";
import { getCurrentMonthYear } from "@/lib/utils2";

export const dynamic = "force-dynamic";

// Headline numbers for the admin dashboard.
export async function GET(request: NextRequest) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const now = new Date();
    const monthYear = getCurrentMonthYear();
    const day = 24 * 60 * 60 * 1000;
    const since7d = new Date(now.getTime() - 7 * day);
    const since30d = new Date(now.getTime() - 30 * day);

    const [
      totalUsers,
      bannedUsers,
      newUsers7d,
      newUsers30d,
      activeUsers30d,
      auraAgg,
      totalBadges,
      activeBadges,
      badgesAwarded,
      monthlyAgg,
      winnersCaptured,
      refreshErrors,
      recentUsers,
      topMonthly,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { createdAt: { gte: since7d } } }),
      prisma.user.count({ where: { createdAt: { gte: since30d } } }),
      prisma.user.count({
        where: { lastContributionDate: { gte: since30d } },
      }),
      prisma.user.aggregate({
        _sum: { totalAura: true },
        _avg: { totalAura: true },
        _max: { longestStreak: true },
      }),
      prisma.badge.count(),
      prisma.badge.count({ where: { isActive: true } }),
      prisma.userBadge.count(),
      prisma.monthlyLeaderboard.aggregate({
        where: { monthYear },
        _count: { _all: true },
        _sum: { contributionsCount: true, totalAura: true },
      }),
      prisma.monthlyWinners.count(),
      prisma.user.count({
        where: { refreshError: { not: null }, isBanned: false },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          githubUsername: true,
          displayName: true,
          avatarUrl: true,
          totalAura: true,
          isBanned: true,
          createdAt: true,
        },
      }),
      prisma.monthlyLeaderboard.findMany({
        where: { monthYear, user: { isBanned: false } },
        orderBy: [{ totalAura: "desc" }, { contributionsCount: "desc" }],
        take: 5,
        select: {
          totalAura: true,
          contributionsCount: true,
          user: {
            select: {
              id: true,
              githubUsername: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      generatedAt: now.toISOString(),
      monthYear,
      users: {
        total: totalUsers,
        banned: bannedUsers,
        new7d: newUsers7d,
        new30d: newUsers30d,
        active30d: activeUsers30d,
        withRefreshErrors: refreshErrors,
      },
      aura: {
        total: auraAgg._sum.totalAura ?? 0,
        average: Math.round(auraAgg._avg.totalAura ?? 0),
        longestStreak: auraAgg._max.longestStreak ?? 0,
      },
      badges: {
        total: totalBadges,
        active: activeBadges,
        awarded: badgesAwarded,
      },
      month: {
        participants: monthlyAgg._count._all,
        contributions: monthlyAgg._sum.contributionsCount ?? 0,
        aura: monthlyAgg._sum.totalAura ?? 0,
      },
      winnersCaptured,
      recentUsers,
      topMonthly,
    });
  } catch (error) {
    console.error("[admin/stats]", error);
    return NextResponse.json(
      { error: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}
