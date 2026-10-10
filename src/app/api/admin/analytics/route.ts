import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Real aggregates for the admin analytics page. */
export async function GET(request: NextRequest) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const now = new Date();
    const monthsBack = 12;
    const firstMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1)
    );
    const months: string[] = [];
    for (let i = 0; i < monthsBack; i += 1) {
      months.push(
        monthKey(new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + i, 1)))
      );
    }
    const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      signupRows,
      monthlyRows,
      dailyRows,
      distributionRows,
      rarityRows,
      topStreaks,
      winnerRows,
      totalUsers,
    ] = await Promise.all([
      prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
               count(*)::int AS count
        FROM users
        WHERE created_at >= ${firstMonth}
        GROUP BY 1 ORDER BY 1`,
      prisma.monthlyLeaderboard.groupBy({
        by: ["monthYear"],
        where: { monthYear: { gte: months[0] } },
        _count: { _all: true },
        _sum: { contributionsCount: true, totalAura: true },
      }),
      prisma.$queryRaw<{ day: string; contributions: number; users: number }[]>`
        SELECT to_char(date, 'YYYY-MM-DD') AS day,
               coalesce(sum(contributions_count), 0)::int AS contributions,
               count(DISTINCT user_id) FILTER (WHERE contributions_count > 0)::int AS users
        FROM aura_calculations
        WHERE date >= ${since30d}
        GROUP BY 1 ORDER BY 1`,
      prisma.$queryRaw<{ bucket: string; sort: number; count: number }[]>`
        SELECT bucket, sort, count(*)::int AS count FROM (
          SELECT CASE
            WHEN total_aura <= 0 THEN '0'
            WHEN total_aura < 1000 THEN '1–999'
            WHEN total_aura < 5000 THEN '1k–5k'
            WHEN total_aura < 10000 THEN '5k–10k'
            WHEN total_aura < 25000 THEN '10k–25k'
            WHEN total_aura < 50000 THEN '25k–50k'
            ELSE '50k+' END AS bucket,
          CASE
            WHEN total_aura <= 0 THEN 0
            WHEN total_aura < 1000 THEN 1
            WHEN total_aura < 5000 THEN 2
            WHEN total_aura < 10000 THEN 3
            WHEN total_aura < 25000 THEN 4
            WHEN total_aura < 50000 THEN 5
            ELSE 6 END AS sort
          FROM users WHERE is_banned = false
        ) t GROUP BY bucket, sort ORDER BY sort`,
      prisma.$queryRaw<{ rarity: string; badges: number; awarded: number }[]>`
        SELECT b.rarity::text AS rarity,
               count(DISTINCT b.id)::int AS badges,
               count(ub.id)::int AS awarded
        FROM badges b LEFT JOIN badge ub ON ub.badge_id = b.id
        GROUP BY b.rarity`,
      prisma.user.findMany({
        where: { isBanned: false, currentStreak: { gt: 0 } },
        orderBy: [{ currentStreak: "desc" }, { totalAura: "desc" }],
        take: 8,
        select: {
          id: true,
          githubUsername: true,
          displayName: true,
          avatarUrl: true,
          currentStreak: true,
          totalAura: true,
        },
      }),
      prisma.monthlyWinners.groupBy({
        by: ["userId"],
        _count: { _all: true },
        orderBy: { _count: { userId: "desc" } },
        take: 5,
      }),
      prisma.user.count(),
    ]);

    const winnerUsers = await prisma.user.findMany({
      where: { id: { in: winnerRows.map((row) => row.userId) } },
      select: { id: true, githubUsername: true, displayName: true, avatarUrl: true },
    });

    const signupMap = new Map(signupRows.map((row) => [row.month, row.count]));
    const monthlyMap = new Map(monthlyRows.map((row) => [row.monthYear, row]));

    // Users registered before the window, so the cumulative line is absolute.
    const inWindow = signupRows.reduce((sum, row) => sum + row.count, 0);
    let cumulative = totalUsers - inWindow;

    const monthly = months.map((month) => {
      const signups = signupMap.get(month) ?? 0;
      cumulative += signups;
      const activity = monthlyMap.get(month);
      return {
        month,
        signups,
        totalUsers: cumulative,
        participants: activity?._count._all ?? 0,
        contributions: activity?._sum.contributionsCount ?? 0,
        aura: activity?._sum.totalAura ?? 0,
      };
    });

    return NextResponse.json({
      generatedAt: now.toISOString(),
      monthly,
      daily: dailyRows,
      auraDistribution: distributionRows.map(({ bucket, count }) => ({ bucket, count })),
      badgesByRarity: rarityRows,
      topStreaks,
      topWinners: winnerRows.map((row) => ({
        user: winnerUsers.find((user) => user.id === row.userId) ?? { id: row.userId },
        wins: row._count._all,
      })),
    });
  } catch (error) {
    console.error("[admin/analytics]", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
