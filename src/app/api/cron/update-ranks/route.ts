import { NextRequest, NextResponse } from "next/server";
import { authorizeCronOrAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getMonthlyRankingValues, sortMonthlyRankedEntries } from "@/lib/leaderboard";

export const runtime = "nodejs";
export const maxDuration = 300;

async function updateRanks(request: NextRequest) {
  try {
    const authResult = authorizeCronOrAdmin(request);
    if (!authResult.ok) return authResult.response;

    const now = new Date();
    const body = await request.json().catch(() => ({}));
    const monthYear = body.monthYear || `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const currentMonthYear = monthYear; // Keep original variable name to minimize diff

    // Update monthly ranks
    const monthlyEntries = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: currentMonthYear,
      },
      include: {
        user: {
          select: {
            githubUsername: true,
          },
        },
      },
    });

    const monthlyLeaderboard = sortMonthlyRankedEntries(
      monthlyEntries,
      (entry) => ({
        ...getMonthlyRankingValues(
          entry.totalAura,
          entry.contributionsCount,
          currentMonthYear,
          entry.user.githubUsername || ""
        ),
      })
    );

    // Update ranks in batches to avoid timeout
    for (let i = 0; i < monthlyLeaderboard.length; i++) {
      const entry = monthlyLeaderboard[i];
      await prisma.monthlyLeaderboard.update({
        where: {
          userId_monthYear: {
            userId: entry.userId,
            monthYear: currentMonthYear,
          },
        },
        data: {
          rank: i + 1,
        },
      });
    }

    // Update global ranks
    const globalLeaderboard = await prisma.globalLeaderboard.findMany({
      orderBy: {
        totalAura: "desc",
      },
    });

    // Update ranks in batches
    for (let i = 0; i < globalLeaderboard.length; i++) {
      const entry = globalLeaderboard[i];
      await prisma.globalLeaderboard.update({
        where: {
          userId: entry.userId,
        },
        data: {
          rank: i + 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Ranks updated successfully",
      monthlyUpdates: monthlyLeaderboard.length,
      globalUpdates: globalLeaderboard.length,
    });
  } catch (error) {
    console.error("Error updating ranks:", error);
    return NextResponse.json(
      { error: "Failed to update ranks" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return updateRanks(request);
}

export async function POST(request: NextRequest) {
  return updateRanks(request);
}
