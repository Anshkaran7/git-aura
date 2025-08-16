import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check if there are any users
    const userCount = await prisma.user.count();

    // Check if there are any global leaderboard entries
    const globalLeaderboardCount = await prisma.globalLeaderboard.count();

    // Check if there are any monthly leaderboard entries
    const monthlyLeaderboardCount = await prisma.monthlyLeaderboard.count();

    // Get a sample of global leaderboard data
    const sampleGlobalData = await prisma.globalLeaderboard.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            githubUsername: true,
            isBanned: true,
          },
        },
      },
      orderBy: {
        totalAura: "desc",
      },
    });

    // Get a sample of monthly leaderboard data
    const sampleMonthlyData = await prisma.monthlyLeaderboard.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            githubUsername: true,
            isBanned: true,
          },
        },
      },
      orderBy: {
        totalAura: "desc",
      },
    });

    return NextResponse.json({
      debug: {
        userCount,
        globalLeaderboardCount,
        monthlyLeaderboardCount,
        sampleGlobalData,
        sampleMonthlyData,
      },
    });
  } catch (error) {
    console.error("Error in debug API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
