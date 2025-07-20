import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { monthYear, contributionsCount, activeDays, allContributions } =
      body;

    if (
      !monthYear ||
      contributionsCount === undefined ||
      activeDays === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Find user to get GitHub username
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubUsername: true },
    });

    if (!user?.githubUsername) {
      return NextResponse.json(
        { error: "User has no GitHub username" },
        { status: 400 }
      );
    }

    // If we have all contributions, calculate and store complete aura
    if (allContributions && Array.isArray(allContributions)) {
      const auraResult = await calculateAndStoreUserAura(
        userId,
        user.githubUsername,
        allContributions
      );

      if (auraResult.success) {
        return NextResponse.json({
          success: true,
          monthlyAura: 0, // This will be calculated in the function
          totalAura: auraResult.totalAura,
          currentStreak: auraResult.currentStreak,
          longestStreak: auraResult.longestStreak,
        });
      } else {
        return NextResponse.json(
          { error: auraResult.error || "Failed to calculate aura" },
          { status: 500 }
        );
      }
    }

    // Legacy path: just update monthly leaderboard with provided data
    const [year, month] = monthYear.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Calculate monthly aura using the simple formula
    const monthlyAura = Math.round(
      contributionsCount * 10 + // 10 points per contribution
        activeDays * 50 + // 50 points per active day
        (activeDays / daysInMonth) * 1000 // Consistency bonus (up to 1000 points)
    );

    // Update monthly leaderboard
    await prisma.monthlyLeaderboard.upsert({
      where: {
        userId_monthYear: {
          userId: userId,
          monthYear: monthYear,
        },
      },
      create: {
        userId: userId,
        monthYear: monthYear,
        totalAura: monthlyAura,
        contributionsCount: contributionsCount,
        rank: 999999, // Will be recalculated
      },
      update: {
        totalAura: monthlyAura,
        contributionsCount: contributionsCount,
      },
    });

    // Recalculate monthly ranks
    const monthlyLeaderboard = await prisma.monthlyLeaderboard.findMany({
      where: { monthYear },
      orderBy: { totalAura: "desc" },
    });

    const monthlyRankUpdates = monthlyLeaderboard.map((entry, index) =>
      prisma.monthlyLeaderboard.update({
        where: { id: entry.id },
        data: { rank: index + 1 },
      })
    );

    await Promise.all(monthlyRankUpdates);

    return NextResponse.json({
      success: true,
      monthlyAura,
      totalAura: 0, // Not calculated in legacy path
    });
  } catch (error) {
    console.error("Error in save-monthly-aura:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
