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
      console.log(
        `🔄 [save-monthly-aura] Using complete aura calculation for ${user.githubUsername}`
      );
      console.log(`📊 [save-monthly-aura] Input data:`, {
        monthYear,
        contributionsCount,
        activeDays,
        allContributionsLength: allContributions.length,
      });

      // Calculate monthly aura using SAME logic as frontend
      const [year, month] = monthYear.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const frontendMatchingAura = Math.round(
        contributionsCount * 10 + // Base aura
          activeDays * 50 + // Active days bonus
          Math.round((activeDays / daysInMonth) * 1000) // Consistency bonus
      );

      console.log(`📊 [save-monthly-aura] Frontend-matching calculation:`, {
        contributionsCount,
        activeDays,
        daysInMonth,
        baseAura: contributionsCount * 10,
        activeDaysBonus: activeDays * 50,
        consistencyBonus: Math.round((activeDays / daysInMonth) * 1000),
        finalAura: frontendMatchingAura,
      });

      // Update monthly leaderboard FIRST with frontend-matching calculation
      console.log(
        `🔧 [save-monthly-aura] Updating monthly leaderboard with frontend calculation: ${frontendMatchingAura}`
      );
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
          totalAura: frontendMatchingAura, // Use frontend calculation
          contributionsCount: contributionsCount,
          rank: 999999, // Will be recalculated by cron
        },
        update: {
          totalAura: frontendMatchingAura, // Use frontend calculation
          contributionsCount: contributionsCount,
        },
      });

      // Then do the complete aura calculation for total/global data (without overwriting monthly)
      const auraResult = await calculateAndStoreUserAura(
        userId,
        user.githubUsername,
        allContributions
      );

      if (auraResult.success) {
        // Get the updated monthly leaderboard entry to verify
        const monthlyEntry = await prisma.monthlyLeaderboard.findUnique({
          where: {
            userId_monthYear: {
              userId: userId,
              monthYear: monthYear,
            },
          },
        });

        console.log(`✅ [save-monthly-aura] Update result:`, {
          totalAura: auraResult.totalAura,
          currentStreak: auraResult.currentStreak,
          longestStreak: auraResult.longestStreak,
          storedMonthlyEntry: monthlyEntry
            ? {
                totalAura: monthlyEntry.totalAura,
                contributionsCount: monthlyEntry.contributionsCount,
              }
            : "NOT_FOUND",
        });

        return NextResponse.json({
          success: true,
          monthlyAura: monthlyEntry?.totalAura || frontendMatchingAura,
          totalAura: auraResult.totalAura,
          currentStreak: auraResult.currentStreak,
          longestStreak: auraResult.longestStreak,
        });
      } else {
        console.error(
          `❌ [save-monthly-aura] Complete calculation failed:`,
          auraResult.error
        );
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

    // DON'T recalculate ranks during sync - too expensive!
    // Process updates in batches to avoid connection pool timeout
    // const batchSize = 10;
    // for (let i = 0; i < monthlyLeaderboard.length; i += batchSize) {
    //   const batch = monthlyLeaderboard.slice(i, i + batchSize);
    //   const monthlyRankUpdates = batch.map((entry, batchIndex) =>
    //     prisma.monthlyLeaderboard.update({
    //       where: { id: entry.id },
    //       data: { rank: i + batchIndex + 1 },
    //     })
    //   );
    //   await Promise.all(monthlyRankUpdates);
    // }

    console.log(
      `✅ [save-monthly-aura] Updated monthly data without rank calculation (cron job will handle ranks)`
    );

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
