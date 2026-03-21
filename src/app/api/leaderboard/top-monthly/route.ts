import { NextRequest, NextResponse } from "next/server";
import { getGitHubAvatarFallback } from "@/lib/avatar";
import { prisma } from "@/lib/prisma";
import {
  getMonthlyRankingValues,
  sortMonthlyRankedEntries,
} from "@/lib/leaderboard";
import { formatNumber } from "@/lib/utils2";

// Explicitly set runtime to nodejs to avoid edge runtime issues
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Retry function for database operations
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current month-year (YYYY-MM format)
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Fetch top 5 monthly users with proper sorting using retry logic
    const monthlyData = await withRetry(async () => {
      return await prisma.monthlyLeaderboard.findMany({
        where: {
          monthYear: currentMonthYear,
          user: {
            isBanned: false, // Exclude banned users
          },
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
              isBanned: true,
            },
          },
        },
      });
    });

    const topMonthlyData = sortMonthlyRankedEntries(
      monthlyData,
      (entry) => ({
        ...getMonthlyRankingValues(
          entry.totalAura,
          entry.contributionsCount,
          currentMonthYear,
          entry.user.githubUsername || ""
        ),
      })
    ).slice(0, 5);

    if (!topMonthlyData || topMonthlyData.length === 0) {
      return NextResponse.json({
        topUsers: [],
        monthYear: currentMonthYear,
        stats: {
          totalAuraPoints: 0,
          totalContributions: 0,
          totalParticipants: 0,
        },
      });
    }

    // Transform data for the AnimatedTooltip component
    const transformedData = topMonthlyData.map((entry, index) => {
      const normalizedAura = getMonthlyRankingValues(
        entry.totalAura,
        entry.contributionsCount,
        currentMonthYear,
        entry.user.githubUsername || ""
      ).aura;

      return {
        id: index + 1,
        name:
          entry.user.displayName ||
          entry.user.githubUsername ||
          `User ${index + 1}`,
        designation: `Aura Score: ${formatNumber(normalizedAura)}`,
        image:
          entry.user.avatarUrl ||
          getGitHubAvatarFallback(entry.user.githubUsername) ||
          "",
        githubUsername: entry.user.githubUsername,
        rank: index + 1,
        totalAura: normalizedAura,
        contributions: entry.contributionsCount,
        currentStreak: entry.user.currentStreak || 0,
      };
    });

    // Get monthly stats with retry logic
    const totalAuraPoints = monthlyData.reduce(
      (sum, entry) =>
        sum +
        getMonthlyRankingValues(
          entry.totalAura,
          entry.contributionsCount,
          currentMonthYear,
          entry.user.githubUsername || ""
        ).aura,
      0
    );
    const totalContributions = monthlyData.reduce(
      (sum, entry) => sum + entry.contributionsCount,
      0
    );

    return NextResponse.json({
      topUsers: transformedData,
      monthYear: currentMonthYear,
      stats: {
        totalAuraPoints,
        totalContributions,
        totalParticipants: monthlyData.length,
      },
    });
  } catch (error) {
    console.error("Error in top monthly users API:", error);

    // Check if it's a connection error
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database")
    ) {
      console.error(
        "Database connection failed. This might be due to: 1. DATABASE_URL not properly configured for serverless 2. Missing connection pooling configuration 3. Supabase instance not accessible"
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        topUsers: [],
        monthYear: "",
        stats: {
          totalAuraPoints: 0,
          totalContributions: 0,
          totalParticipants: 0,
        },
        fallback: true,
        debug:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
