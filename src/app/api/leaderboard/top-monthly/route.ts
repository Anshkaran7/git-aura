import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        orderBy: [
          { totalAura: "desc" },
          { contributionsCount: "desc" },
          { user: { currentStreak: "desc" } },
        ],
        take: 5,
      });
    });

    if (!monthlyData || monthlyData.length === 0) {
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
    const transformedData = monthlyData.map((entry, index) => ({
      id: index + 1,
      name:
        entry.user.displayName ||
        entry.user.githubUsername ||
        `User ${index + 1}`,
      designation: `Aura Score: ${formatNumber(entry.totalAura)}`,
      image:
        entry.user.avatarUrl ||
        `https://github.com/${entry.user.githubUsername}.png`,
      githubUsername: entry.user.githubUsername,
      rank: index + 1, // Rank based on sorted order
      totalAura: entry.totalAura,
      contributions: entry.contributionsCount,
      currentStreak: entry.user.currentStreak || 0,
    }));

    // Get monthly stats with retry logic
    const monthlyStats = await withRetry(async () => {
      return await prisma.monthlyLeaderboard.aggregate({
        where: {
          monthYear: currentMonthYear,
        },
        _count: {
          _all: true, // Total participants
        },
        _sum: {
          totalAura: true,
          contributionsCount: true,
        },
      });
    });

    return NextResponse.json({
      topUsers: transformedData,
      monthYear: currentMonthYear,
      stats: {
        totalAuraPoints: monthlyStats._sum.totalAura || 0,
        totalContributions: monthlyStats._sum.contributionsCount || 0,
        totalParticipants: monthlyStats._count._all,
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
