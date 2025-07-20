import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
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
        monthlyLeaderboard: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Fetch live GitHub data
    const githubResult = await fetchGitHubContributions(username);
    const liveGithubData = githubResult.success ? githubResult.data : null;

    // Calculate current month contributions from live data
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let liveMonthlyContributions = 0;
    let liveActiveDays = 0;

    if (liveGithubData) {
      const monthlyDays = liveGithubData.contributionDays.filter((day) => {
        const dayDate = new Date(day.date);
        return dayDate >= monthStart && dayDate <= monthEnd;
      });

      liveMonthlyContributions = monthlyDays.reduce(
        (sum, day) => sum + day.contributionCount,
        0
      );
      liveActiveDays = monthlyDays.filter(
        (day) => day.contributionCount > 0
      ).length;
    }

    // Get stored monthly data
    const storedMonthlyData = await prisma.monthlyLeaderboard.findUnique({
      where: {
        userId_monthYear: {
          userId: user.id,
          monthYear: currentMonthYear,
        },
      },
    });

    // Calculate July 2025 data specifically
    const julyStart = new Date(2025, 6, 1); // July 1, 2025
    const julyEnd = new Date(2025, 6, 31); // July 31, 2025

    let julyContributions = 0;
    let julyActiveDays = 0;

    if (liveGithubData) {
      const julyDays = liveGithubData.contributionDays.filter((day) => {
        const dayDate = new Date(day.date);
        return dayDate >= julyStart && dayDate <= julyEnd;
      });

      julyContributions = julyDays.reduce(
        (sum, day) => sum + day.contributionCount,
        0
      );
      julyActiveDays = julyDays.filter(
        (day) => day.contributionCount > 0
      ).length;
    }

    return NextResponse.json({
      username,
      userId: user.id,
      currentMonth: currentMonthYear,
      liveGithubData: {
        totalContributions: liveGithubData?.totalContributions || 0,
        currentMonthContributions: liveMonthlyContributions,
        currentMonthActiveDays: liveActiveDays,
        julyContributions,
        julyActiveDays,
      },
      storedDatabaseData: {
        monthlyLeaderboard: storedMonthlyData
          ? {
              monthYear: storedMonthlyData.monthYear,
              contributionsCount: storedMonthlyData.contributionsCount,
              totalAura: storedMonthlyData.totalAura,
              rank: storedMonthlyData.rank,
              createdAt: storedMonthlyData.createdAt,
            }
          : null,
        recentEntries: user.monthlyLeaderboard.map((entry) => ({
          monthYear: entry.monthYear,
          contributionsCount: entry.contributionsCount,
          totalAura: entry.totalAura,
          createdAt: entry.createdAt,
        })),
      },
      discrepancy: {
        currentMonth: storedMonthlyData
          ? Math.abs(
              liveMonthlyContributions - storedMonthlyData.contributionsCount
            )
          : "No stored data",
        july2025: julyContributions,
        possibleCauses: [
          "Data calculated at different time",
          "Different month being compared",
          "Cache/timing issue",
          "Timezone differences",
        ],
      },
      dataFreshness: liveGithubData
        ? "Live from GitHub API"
        : "Failed to fetch live data",
    });
  } catch (error) {
    console.error("Error in debug-contributions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
