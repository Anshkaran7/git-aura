import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import {
  calculateBaseAura,
  calculateConsistencyBonus,
} from "@/lib/aura-calculations";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get("monthYear") || getCurrentMonthYear();

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        githubUsername: true,
        displayName: true,
      },
    });

    if (!user?.githubUsername) {
      return NextResponse.json(
        { error: "User has no GitHub username" },
        { status: 400 }
      );
    }

    // Fetch live GitHub contributions
    const contributionsResult = await fetchGitHubContributions(
      user.githubUsername
    );

    if (!contributionsResult.success || !contributionsResult.data) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub contributions" },
        { status: 500 }
      );
    }

    // Calculate frontend values
    const [year, month] = monthYear.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    let frontendMonthlyContributions = 0;
    let frontendActiveDays = 0;

    contributionsResult.data.contributionDays.forEach((day) => {
      const dayDate = new Date(day.date);
      if (dayDate >= monthStart && dayDate <= monthEnd) {
        frontendMonthlyContributions += day.contributionCount;
        if (day.contributionCount > 0) {
          frontendActiveDays++;
        }
      }
    });

    const frontendBaseAura = frontendMonthlyContributions * 10;
    const frontendConsistencyRatio = frontendActiveDays / monthEnd.getDate();
    const frontendConsistencyBonus = Math.round(
      frontendConsistencyRatio * 1000
    );
    const frontendMonthlyAura = Math.round(
      frontendBaseAura + frontendActiveDays * 50 + frontendConsistencyBonus
    );

    // Calculate backend values using backend functions
    const backendBaseAura = calculateBaseAura(frontendMonthlyContributions);
    const backendConsistencyBonus = calculateConsistencyBonus(
      frontendActiveDays,
      monthEnd.getDate()
    );
    const backendMonthlyAura = Math.round(
      backendBaseAura + frontendActiveDays * 50 + backendConsistencyBonus
    );

    // Get stored database values
    const storedMonthlyData = await prisma.monthlyLeaderboard.findUnique({
      where: {
        userId_monthYear: {
          userId: userId,
          monthYear: monthYear,
        },
      },
    });

    // Get global leaderboard data
    const storedGlobalData = await prisma.globalLeaderboard.findUnique({
      where: { userId: userId },
    });

    return NextResponse.json({
      success: true,
      username: user.githubUsername,
      monthYear,
      frontend: {
        monthlyContributions: frontendMonthlyContributions,
        activeDays: frontendActiveDays,
        daysInMonth: monthEnd.getDate(),
        baseAura: frontendBaseAura,
        consistencyRatio: frontendConsistencyRatio,
        consistencyBonus: frontendConsistencyBonus,
        finalMonthlyAura: frontendMonthlyAura,
      },
      backend: {
        monthlyContributions: frontendMonthlyContributions,
        activeDays: frontendActiveDays,
        daysInMonth: monthEnd.getDate(),
        baseAura: backendBaseAura,
        consistencyBonus: backendConsistencyBonus,
        finalMonthlyAura: backendMonthlyAura,
      },
      stored: {
        monthly: storedMonthlyData
          ? {
              totalAura: storedMonthlyData.totalAura,
              contributionsCount: storedMonthlyData.contributionsCount,
              rank: storedMonthlyData.rank,
              createdAt: storedMonthlyData.createdAt,
            }
          : null,
        global: storedGlobalData
          ? {
              totalAura: storedGlobalData.totalAura,
              rank: storedGlobalData.rank,
              lastUpdated: storedGlobalData.lastUpdated,
            }
          : null,
      },
      discrepancies: {
        frontendVsBackend: frontendMonthlyAura !== backendMonthlyAura,
        frontendVsStored: storedMonthlyData
          ? frontendMonthlyAura !== storedMonthlyData.totalAura
          : "NO_STORED_DATA",
        backendVsStored: storedMonthlyData
          ? backendMonthlyAura !== storedMonthlyData.totalAura
          : "NO_STORED_DATA",
      },
    });
  } catch (error) {
    console.error("Error in debug-monthly-aura:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
