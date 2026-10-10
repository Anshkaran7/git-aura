import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateMonthlyAuraBreakdown } from "@/lib/aura-calculations";
import { getCurrentMonthYear } from "@/lib/utils2";

const MONTH_YEAR = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Read-only: compare a user's live GitHub contributions for a month with the
 * stored monthly leaderboard row. Query: username (required), monthYear (YYYY-MM)
 */
export async function GET(request: NextRequest) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const monthYear = searchParams.get("monthYear") || getCurrentMonthYear();
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }
  if (!MONTH_YEAR.test(monthYear)) {
    return NextResponse.json({ error: "monthYear must be YYYY-MM" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { githubUsername: { equals: username, mode: "insensitive" } },
      select: { id: true, githubUsername: true, displayName: true },
    });
    if (!user?.githubUsername) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const live = await fetchGitHubContributions(user.githubUsername);
    if (!live.success || !live.data) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub contributions", details: live.error },
        { status: 502 }
      );
    }

    const [year, month] = monthYear.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    let contributions = 0;
    let activeDays = 0;
    for (const day of live.data.contributionDays) {
      if (day.date.startsWith(monthYear)) {
        contributions += day.contributionCount;
        if (day.contributionCount > 0) activeDays += 1;
      }
    }
    const breakdown = calculateMonthlyAuraBreakdown(contributions, activeDays, daysInMonth);

    const [stored, global] = await Promise.all([
      prisma.monthlyLeaderboard.findUnique({
        where: { userId_monthYear: { userId: user.id, monthYear } },
        select: { totalAura: true, contributionsCount: true, rank: true, createdAt: true },
      }),
      prisma.globalLeaderboard.findUnique({
        where: { userId: user.id },
        select: { totalAura: true, rank: true, lastUpdated: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      username: user.githubUsername,
      monthYear,
      live: {
        contributions,
        activeDays,
        daysInMonth,
        ...breakdown,
      },
      stored: { monthly: stored, global },
      inSync: stored
        ? stored.totalAura === breakdown.totalAura &&
          stored.contributionsCount === contributions
        : false,
    });
  } catch (error) {
    console.error("[admin/debug/monthly-aura]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
