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

    // Calculate total aura
    const totalAura = calculateTotalAura(contributionDays);
    const currentStreak = calculateStreak(contributionDays);

    // Get the longest streak (for now, use current streak, but this could be enhanced)
    const longestStreak = currentStreak;

    // Get the last contribution date
    const lastContributionDate = contributionDays
      .filter((day) => day.contributionCount > 0)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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

    // Create aura calculation for today (most recent)
    const today = new Date();
    await createAuraCalculation(userId, today, contributionDays, githubProfile);

    // Update leaderboards
    await updateLeaderboards(userId, totalAura, contributionDays);

    // Award badges to top 3 users (background process)
    try {
      await awardBadgesToTopUsers();
    } catch (badgeError) {
      console.error("❌ [Badge Award] Failed to award badges:", badgeError);
      // Don't fail the whole process if badge awarding fails
    }

    console.log(
      `✅ [Aura Calc] Completed aura calculation for ${githubUsername}: ${totalAura} total aura`
    );

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
export async function updateLeaderboards(
  userId: string,
  totalAura: number,
  contributionDays: ContributionDay[]
) {
  try {
    console.log(
      `[Leaderboard] Updating leaderboards for user: ${userId} with ${totalAura} total aura`
    );

    // Check if user is banned before updating leaderboards
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBanned: true },
    });

    if (user?.isBanned) {
      console.log(
        `[Leaderboard] Skipping leaderboard update for banned user: ${userId}`
      );
      return {
        success: true,
        message: "User is banned, skipped leaderboard update",
      };
    }

    // Get current month's contributions
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Calculate monthly aura and contributions
    const monthlyContributions = contributionDays.filter((day) => {
      const dayDate = new Date(day.date);
      return (
        dayDate.getFullYear() === now.getFullYear() &&
        dayDate.getMonth() === now.getMonth()
      );
    });

    const monthlyAura = monthlyContributions.reduce(
      (sum, day) => sum + calculateBaseAura(day.contributionCount),
      0
    );

    const monthlyContributionsCount = monthlyContributions.reduce(
      (sum, day) => sum + day.contributionCount,
      0
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
        rank: 0, // Will be updated by rank calculation
      },
      update: {
        totalAura: monthlyAura,
        contributionsCount: monthlyContributionsCount,
      },
    });

    // Update global leaderboard
    await prisma.globalLeaderboard.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        totalAura: totalAura,
        rank: 0, // Will be updated by rank calculation
        year: now.getFullYear().toString(),
        yearlyAura: totalAura,
      },
      update: {
        totalAura: totalAura,
        year: now.getFullYear().toString(),
        yearlyAura: totalAura,
      },
    });

    console.log(
      `✅ [Leaderboard] Updated leaderboards - Monthly: ${monthlyAura}, Global: ${totalAura}`
    );

    return { success: true, monthlyAura, totalAura };
  } catch (error) {
    console.error("Error updating leaderboards:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Recalculate monthly leaderboard ranks
async function recalculateMonthlyRanks(monthYear: string) {
  try {
    const leaderboard = await prisma.monthlyLeaderboard.findMany({
      where: { monthYear },
      orderBy: { totalAura: "desc" },
    });

    const updates = leaderboard.map((entry, index) =>
      prisma.monthlyLeaderboard.update({
        where: { id: entry.id },
        data: { rank: index + 1 },
      })
    );

    await Promise.all(updates);
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

    const updates = leaderboard.map((entry, index) =>
      prisma.globalLeaderboard.update({
        where: { id: entry.id },
        data: { rank: index + 1 },
      })
    );

    await Promise.all(updates);
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
