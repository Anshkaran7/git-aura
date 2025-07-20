import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get total number of users
    const totalDevelopers = await prisma.user.count();

    // Get total aura points from global leaderboard
    const totalAuraPoints = await prisma.globalLeaderboard.aggregate({
      _sum: {
        totalAura: true,
      },
    });

    // Get total number of badges earned
    const totalBadges = await prisma.userBadge.count();

    // Get current month stats
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Get monthly active users and contributions
    const monthlyStats = await prisma.monthlyLeaderboard.aggregate({
      where: {
        monthYear: currentMonthYear,
      },
      _count: {
        _all: true, // This gives us monthly active users
      },
      _sum: {
        contributionsCount: true, // This gives us total contributions
      },
    });

    // Calculate averages
    const averageAuraPerUser = totalDevelopers
      ? Math.round((totalAuraPoints._sum.totalAura || 0) / totalDevelopers)
      : 0;
    const averageBadgesPerUser = totalDevelopers
      ? Math.round(totalBadges / totalDevelopers)
      : 0;

    return NextResponse.json({
      totalDevelopers,
      totalAuraPoints: totalAuraPoints._sum.totalAura || 0,
      totalBadges,
      monthlyActive: monthlyStats._count._all,
      totalMonthlyContributions: monthlyStats._sum.contributionsCount || 0,
      averageAuraPerUser,
      averageBadgesPerUser,
      monthYear: currentMonthYear,
    });
  } catch (error) {
    console.error("Error in hero stats API:", error);

    // Return fallback data on error
    return NextResponse.json({
      totalDevelopers: 0,
      totalAuraPoints: 0,
      totalBadges: 0,
      monthlyActive: 0,
      totalMonthlyContributions: 0,
      averageAuraPerUser: 0,
      averageBadgesPerUser: 0,
      fallback: true,
    });
  }
}
