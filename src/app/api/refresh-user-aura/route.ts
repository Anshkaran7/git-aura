import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { githubUsername: username },
      select: {
        id: true,
        githubUsername: true,
        displayName: true,
        totalAura: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Fetch fresh GitHub contributions
    const contributionsResult = await fetchGitHubContributions(username);

    if (!contributionsResult.success || !contributionsResult.data) {
      return NextResponse.json(
        {
          error: "Failed to fetch GitHub contributions",
          details: contributionsResult.error,
        },
        { status: 500 }
      );
    }

    // Get old data for comparison
    const oldData = await prisma.monthlyLeaderboard.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Force recalculate and store aura
    const auraResult = await calculateAndStoreUserAura(
      user.id,
      username,
      contributionsResult.data.contributionDays
    );

    if (!auraResult.success) {
      return NextResponse.json(
        {
          error: "Failed to calculate aura",
          details: auraResult.error,
        },
        { status: 500 }
      );
    }

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        totalAura: true,
        currentStreak: true,
        longestStreak: true,
        lastContributionDate: true,
        monthlyLeaderboard: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    // Calculate current month data for display
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthDays = contributionsResult.data.contributionDays.filter(
      (day) => {
        const dayDate = new Date(day.date);
        return dayDate >= monthStart && dayDate <= monthEnd;
      }
    );

    const currentMonthContributions = currentMonthDays.reduce(
      (sum, day) => sum + day.contributionCount,
      0
    );

    return NextResponse.json({
      success: true,
      username,
      userId: user.id,
      refreshed: true,
      auraCalculation: {
        totalAura: auraResult.totalAura,
        currentStreak: auraResult.currentStreak,
        longestStreak: auraResult.longestStreak,
      },
      currentMonthData: {
        monthYear: currentMonthYear,
        contributions: currentMonthContributions,
        activeDays: currentMonthDays.filter((day) => day.contributionCount > 0)
          .length,
      },
      before: {
        totalAura: user.totalAura,
        monthlyEntries: oldData.map((entry) => ({
          monthYear: entry.monthYear,
          contributionsCount: entry.contributionsCount,
          totalAura: entry.totalAura,
        })),
      },
      after: {
        totalAura: updatedUser?.totalAura || 0,
        monthlyEntries:
          updatedUser?.monthlyLeaderboard.map((entry) => ({
            monthYear: entry.monthYear,
            contributionsCount: entry.contributionsCount,
            totalAura: entry.totalAura,
          })) || [],
      },
      githubData: {
        totalContributions: contributionsResult.data.totalContributions,
        dataFreshness: "Just fetched from GitHub API",
      },
    });
  } catch (error) {
    console.error("❌ [Refresh] Error refreshing user aura:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
