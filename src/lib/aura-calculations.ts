import { prisma } from "./prisma";
import { fetchGitHubProfile } from "./github-fetch";

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GitHubProfileData {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// Calculate base aura from contributions
export function calculateBaseAura(contributions: number): number {
  return contributions * 10; // 10 points per contribution
}

// Calculate streak bonus
export function calculateStreakBonus(streak: number): number {
  if (streak >= 100) return 2000;
  if (streak >= 50) return 1000;
  if (streak >= 30) return 500;
  if (streak >= 14) return 200;
  if (streak >= 7) return 100;
  if (streak >= 3) return 50;
  return 0;
}

// Calculate consistency bonus based on active days in month
export function calculateConsistencyBonus(
  activeDays: number,
  daysInMonth: number
): number {
  const consistencyRatio = activeDays / daysInMonth;
  return Math.round(consistencyRatio * 1000); // Up to 1000 points for perfect consistency
}

// Calculate quality bonus based on repos, followers, etc.
export function calculateQualityBonus(profile: GitHubProfileData): number {
  let bonus = 0;

  // Repository bonus
  if (profile.public_repos >= 50) bonus += 500;
  else if (profile.public_repos >= 20) bonus += 200;
  else if (profile.public_repos >= 10) bonus += 100;

  // Follower bonus
  if (profile.followers >= 1000) bonus += 500;
  else if (profile.followers >= 100) bonus += 200;
  else if (profile.followers >= 50) bonus += 100;
  else if (profile.followers >= 10) bonus += 50;

  // Bio bonus (shows engagement)
  if (profile.bio && profile.bio.length > 0) bonus += 25;

  return bonus;
}

// Calculate streak from contribution days
export function calculateStreak(contributionDays: ContributionDay[]): number {
  if (!contributionDays.length) return 0;

  // Sort by date descending
  const sortedDays = [...contributionDays].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const day of sortedDays) {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === streak && day.contributionCount > 0) {
      streak++;
    } else if (dayDiff === streak && day.contributionCount === 0) {
      // If today has no contributions, check yesterday
      if (streak === 0) {
        streak = 1; // Skip today and continue checking
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

// Calculate total aura from all contribution days
export function calculateTotalAura(
  contributionDays: ContributionDay[]
): number {
  if (!contributionDays.length) return 0;

  const totalContributions = contributionDays.reduce(
    (sum, day) => sum + day.contributionCount,
    0
  );
  const baseAura = calculateBaseAura(totalContributions);
  const streak = calculateStreak(contributionDays);
  const streakBonus = calculateStreakBonus(streak);

  return baseAura + streakBonus;
}

// Calculate monthly aura
export function calculateMonthlyAura(
  monthlyContributions: number,
  activeDays: number,
  daysInMonth: number
): number {
  const baseAura = calculateBaseAura(monthlyContributions);
  const consistencyBonus = calculateConsistencyBonus(activeDays, daysInMonth);
  return Math.round(baseAura + activeDays * 50 + consistencyBonus);
}

// Create aura calculation record for a specific date
export async function createAuraCalculation(
  userId: string,
  date: Date,
  contributionDays: ContributionDay[],
  githubProfile?: GitHubProfileData
) {
  try {
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayContributions =
      contributionDays.find((day) => day.date === dateString)
        ?.contributionCount || 0;

    const streak = calculateStreak(contributionDays);
    const baseAura = calculateBaseAura(dayContributions);
    const streakBonus = calculateStreakBonus(streak);
    const qualityBonus = githubProfile
      ? calculateQualityBonus(githubProfile)
      : 0;
    const consistencyBonus = 0; // Daily calculations don't need consistency bonus

    const totalAura = baseAura + streakBonus + qualityBonus + consistencyBonus;

    // Create or update aura calculation record
    const auraCalculation = await prisma.auraCalculation.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: date,
        },
      },
      create: {
        userId: userId,
        date: date,
        contributionsCount: dayContributions,
        baseAura: baseAura,
        streakBonus: streakBonus,
        consistencyBonus: consistencyBonus,
        qualityBonus: qualityBonus,
        totalAura: totalAura,
        repositoriesData: githubProfile ? (githubProfile as any) : undefined,
      },
      update: {
        contributionsCount: dayContributions,
        baseAura: baseAura,
        streakBonus: streakBonus,
        consistencyBonus: consistencyBonus,
        qualityBonus: qualityBonus,
        totalAura: totalAura,
        repositoriesData: githubProfile ? (githubProfile as any) : undefined,
      },
    });

    return { success: true, auraCalculation };
  } catch (error) {
    console.error("Error creating aura calculation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Calculate and store aura for all contribution days
export async function calculateAndStoreUserAura(
  userId: string,
  githubUsername: string,
  contributionDays: ContributionDay[]
) {
  try {
    console.log(
      `[Aura Calc] Starting aura calculation for user: ${userId} (${githubUsername})`
    );

    // Fetch GitHub profile for quality bonus
    const githubResult = await fetchGitHubProfile(githubUsername);
    const githubProfile = githubResult.success ? githubResult.data : undefined;

    console.log("githubProfile", githubProfile);
    // Calculate total aura
    const totalAura = calculateTotalAura(contributionDays);
    const currentStreak = calculateStreak(contributionDays);
    console.log("currentStreak", currentStreak);
    console.log("totalAura", totalAura);
    // Get the longest streak (for now, use current streak, but this could be enhanced)
    const longestStreak = currentStreak;

    console.log("contributionDays", contributionDays);
    // Get the last contribution date
    const lastContributionDate = contributionDays
      .filter((day) => day.contributionCount > 0)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]?.date;

    console.log("lastContributionDate", lastContributionDate);
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

    console.log("userId", userId);
    // Create aura calculation for today (most recent)
    const today = new Date();
    await createAuraCalculation(userId, today, contributionDays, githubProfile);

    // Update leaderboards
    await updateLeaderboards(userId, totalAura, contributionDays);

    console.log(
      `✅ [Leaderboard] Updated leaderboards for user ${userId} (ranks will be updated by cron job)`
    );

    // Return success with calculated values
    return {
      success: true,
      totalAura,
      currentStreak,
      longestStreak,
    };
  } catch (error) {
    console.error(
      `❌ [Aura Calc] Error calculating aura for ${githubUsername}:`,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update leaderboards using Prisma
async function updateLeaderboards(
  userId: string,
  totalAura: number,
  contributionDays: ContributionDay[]
) {
  try {
    // Get current month data
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculate monthly contributions
    const monthlyContributions = contributionDays.filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= monthStart && dayDate <= monthEnd;
    });

    const monthlyContributionsCount = monthlyContributions.reduce(
      (sum, day) => sum + day.contributionCount,
      0
    );

    const activeDays = monthlyContributions.filter(
      (day) => day.contributionCount > 0
    ).length;
    const daysInMonth = monthEnd.getDate();
    const monthlyAura = calculateMonthlyAura(
      monthlyContributionsCount,
      activeDays,
      daysInMonth
    );

    console.log(
      `📊 [updateLeaderboards] Monthly calculation for ${currentMonthYear}:`,
      {
        userId,
        monthlyContributionsCount,
        activeDays,
        daysInMonth,
        baseAura: calculateBaseAura(monthlyContributionsCount),
        consistencyBonus: calculateConsistencyBonus(activeDays, daysInMonth),
        finalMonthlyAura: monthlyAura,
        totalAura,
      }
    );

    // Check if monthly leaderboard entry was recently updated (within last 30 seconds)
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
        `🔄 [updateLeaderboards] Updating monthly leaderboard for ${currentMonthYear}:`,
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
          rank: 999999, // Will be recalculated
        },
        update: {
          totalAura: monthlyAura,
          contributionsCount: monthlyContributionsCount,
        },
      });
    } else {
      console.log(
        `⏭️ [updateLeaderboards] Skipping monthly leaderboard update (recently updated by save-monthly-aura)`
      );
    }

    // Update global leaderboard
    await prisma.globalLeaderboard.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        totalAura: totalAura,
        rank: 999999, // Will be recalculated
        year: now.getFullYear().toString(),
        yearlyAura: totalAura,
      },
      update: {
        totalAura: totalAura,
        yearlyAura: totalAura,
        lastUpdated: now,
      },
    });

    // DON'T recalculate ranks during sync - let cron job handle this
    // This prevents hundreds of database queries during user sync
    // await recalculateMonthlyRanks(currentMonthYear);
    // await recalculateGlobalRanks();

    console.log(
      `✅ [Leaderboard] Updated leaderboards for user ${userId} (ranks will be updated by cron job)`
    );
  } catch (error) {
    console.error("❌ [Leaderboard] Error updating leaderboards:", error);
  }
}

// Recalculate monthly leaderboard ranks
async function recalculateMonthlyRanks(monthYear: string) {
  try {
    const leaderboard = await prisma.monthlyLeaderboard.findMany({
      where: { monthYear },
      orderBy: { totalAura: "desc" },
    });

    // Process in batches to avoid connection pool timeout
    const batchSize = 10;
    for (let i = 0; i < leaderboard.length; i += batchSize) {
      const batch = leaderboard.slice(i, i + batchSize);
      const updates = batch.map((entry, batchIndex) =>
        prisma.monthlyLeaderboard.update({
          where: { id: entry.id },
          data: { rank: i + batchIndex + 1 },
        })
      );

      await Promise.all(updates);
    }
  } catch (error) {
    console.error("Error recalculating monthly ranks:", error);
  }
}

// Recalculate global leaderboard ranks
async function recalculateGlobalRanks() {
  try {
    const leaderboard = await prisma.globalLeaderboard.findMany({
      orderBy: { totalAura: "desc" },
    });

    // Process in batches to avoid connection pool timeout
    const batchSize = 10;
    for (let i = 0; i < leaderboard.length; i += batchSize) {
      const batch = leaderboard.slice(i, i + batchSize);
      const updates = batch.map((entry, batchIndex) =>
        prisma.globalLeaderboard.update({
          where: { id: entry.id },
          data: { rank: i + batchIndex + 1 },
        })
      );

      await Promise.all(updates);
    }
  } catch (error) {
    console.error("Error recalculating global ranks:", error);
  }
}

// Award badges to top 3 users (background process)
async function awardBadgesToTopUsers() {
  try {
    console.log("🏆 [Badge Award] Triggering badge awarding process...");

    // Call the badge awarding API
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/award-badges`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ [Badge Award] ${result.message}`);
      if (result.awardedBadges && result.awardedBadges.length > 0) {
        console.log(
          `🏅 [Badge Award] Awarded ${result.awardedBadges.length} new badges`
        );
      }
    } else {
      console.error(
        "❌ [Badge Award] Failed to call badge awarding API:",
        await response.text()
      );
    }
  } catch (error) {
    console.error("❌ [Badge Award] Error calling badge awarding API:", error);
  }
}
