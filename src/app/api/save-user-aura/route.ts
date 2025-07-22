import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateTotalAura,
  calculateStreak,
  calculateBaseAura,
  calculateStreakBonus,
  calculateQualityBonus,
  calculateMonthlyAura,
} from "@/lib/aura-calculations";
import { fetchGitHubProfile } from "@/lib/github-fetch";

interface ContributionDay {
  contributionCount: number;
  date: string;
}

export async function POST(request: Request) {
  try {
    const { userId, githubUsername, contributionDays } = await request.json();

    if (!userId || !githubUsername || !contributionDays) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch GitHub profile for quality bonus
    const githubResult = await fetchGitHubProfile(githubUsername);
    const githubProfile = githubResult.success ? githubResult.data : undefined;

    // Calculate total aura
    const totalAura = calculateTotalAura(contributionDays);
    const currentStreak = calculateStreak(contributionDays);

    // Get the longest streak (for now, use current streak, but this could be enhanced)
    const longestStreak = currentStreak;

    // Get the last contribution date
    const lastContributionDate = contributionDays
      .filter((day: ContributionDay) => day.contributionCount > 0)
      .sort(
        (a: ContributionDay, b: ContributionDay) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]?.date;

    // Update user's total aura and streak
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalAura: totalAura,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        lastContributionDate: lastContributionDate
          ? new Date(lastContributionDate)
          : null,
      },
    });

    // Create aura calculation for today
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    const dayContributions =
      contributionDays.find((day: ContributionDay) => day.date === dateString)
        ?.contributionCount || 0;

    const baseAura = calculateBaseAura(dayContributions);
    const streakBonus = calculateStreakBonus(currentStreak);
    const qualityBonus = githubProfile
      ? calculateQualityBonus(githubProfile)
      : 0;
    const consistencyBonus = 0; // Daily calculations don't need consistency bonus

    const dailyTotalAura =
      baseAura + streakBonus + qualityBonus + consistencyBonus;

    await prisma.auraCalculation.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: today,
        },
      },
      create: {
        userId: userId,
        date: today,
        contributionsCount: dayContributions,
        baseAura: baseAura,
        streakBonus: streakBonus,
        consistencyBonus: consistencyBonus,
        qualityBonus: qualityBonus,
        totalAura: dailyTotalAura,
        repositoriesData: githubProfile ? (githubProfile as any) : undefined,
      },
      update: {
        contributionsCount: dayContributions,
        baseAura: baseAura,
        streakBonus: streakBonus,
        consistencyBonus: consistencyBonus,
        qualityBonus: qualityBonus,
        totalAura: dailyTotalAura,
        repositoriesData: githubProfile ? (githubProfile as any) : undefined,
      },
    });

    // Update leaderboards
    await updateLeaderboards(userId, totalAura, contributionDays);

    return NextResponse.json({
      success: true,
      totalAura,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    console.error("Error saving user aura:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to update leaderboards
async function updateLeaderboards(
  userId: string,
  totalAura: number,
  contributionDays: ContributionDay[]
) {
  try {
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculate monthly contributions
    const monthlyContributions = contributionDays.filter(
      (day: ContributionDay) => {
        const dayDate = new Date(day.date);
        return dayDate >= monthStart && dayDate <= monthEnd;
      }
    );

    const monthlyContributionsCount = monthlyContributions.reduce(
      (sum, day: ContributionDay) => sum + day.contributionCount,
      0
    );

    const activeDays = monthlyContributions.filter(
      (day: ContributionDay) => day.contributionCount > 0
    ).length;
    const daysInMonth = monthEnd.getDate();
    const monthlyAura = calculateMonthlyAura(
      monthlyContributionsCount,
      activeDays,
      daysInMonth
    );

    // Check if monthly leaderboard entry exists and was recently updated (within last 30 seconds)
    // This prevents overwriting data from save-monthly-aura endpoint
    const existingMonthlyEntry = await prisma.monthlyLeaderboard.findUnique({
      where: {
        userId_monthYear: {
          userId: userId,
          monthYear: currentMonthYear,
        },
      },
    });

    const shouldUpdateMonthly =
      !existingMonthlyEntry ||
      new Date().getTime() - existingMonthlyEntry.createdAt.getTime() > 30000; // 30 seconds

    if (shouldUpdateMonthly) {
      console.log(
        `🔄 [save-user-aura] Updating monthly leaderboard for ${currentMonthYear}:`,
        { monthlyAura, monthlyContributionsCount, activeDays, daysInMonth }
      );

      // Update monthly leaderboard
      await prisma.monthlyLeaderboard.upsert({
        where: {
          userId_monthYear: {
            userId: userId,
            monthYear: currentMonthYear,
          },
        },
        create: {
          userId: userId,
          monthYear: currentMonthYear,
          totalAura: monthlyAura,
          contributionsCount: monthlyContributionsCount,
          rank: 999999,
        },
        update: {
          totalAura: monthlyAura,
          contributionsCount: monthlyContributionsCount,
        },
      });
    } else {
      console.log(
        `⏭️ [save-user-aura] Skipping monthly leaderboard update (recently updated by save-monthly-aura)`
      );
    }

    // Update global leaderboard
    await prisma.globalLeaderboard.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        totalAura: totalAura,
        rank: 999999,
        year: now.getFullYear().toString(),
        yearlyAura: totalAura,
      },
      update: {
        totalAura: totalAura,
        yearlyAura: totalAura,
        lastUpdated: now,
      },
    });

    // DON'T recalculate ranks during manual sync - too expensive!
    // Let cron job handle rank updates
    // await recalculateRanks(currentMonthYear);

    console.log(
      `✅ [save-user-aura] Updated leaderboards without rank calculation (cron job will handle ranks)`
    );
  } catch (error) {
    console.error("Error updating leaderboards:", error);
    throw error;
  }
}

async function recalculateRanks(monthYear: string) {
  try {
    // Recalculate monthly ranks
    const monthlyLeaderboard = await prisma.monthlyLeaderboard.findMany({
      where: { monthYear },
      orderBy: { totalAura: "desc" },
    });

    // Process monthly updates in batches
    const batchSize = 10;
    for (let i = 0; i < monthlyLeaderboard.length; i += batchSize) {
      const batch = monthlyLeaderboard.slice(i, i + batchSize);
      const monthlyUpdates = batch.map((entry, batchIndex) =>
        prisma.monthlyLeaderboard.update({
          where: { id: entry.id },
          data: { rank: i + batchIndex + 1 },
        })
      );
      await Promise.all(monthlyUpdates);
    }

    // Recalculate global ranks
    const globalLeaderboard = await prisma.globalLeaderboard.findMany({
      orderBy: { totalAura: "desc" },
    });

    // Process global updates in batches
    for (let i = 0; i < globalLeaderboard.length; i += batchSize) {
      const batch = globalLeaderboard.slice(i, i + batchSize);
      const globalUpdates = batch.map((entry, batchIndex) =>
        prisma.globalLeaderboard.update({
          where: { id: entry.id },
          data: { rank: i + batchIndex + 1 },
        })
      );
      await Promise.all(globalUpdates);
    }
  } catch (error) {
    console.error("Error recalculating ranks:", error);
    throw error;
  }
}
