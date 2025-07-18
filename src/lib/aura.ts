import { createClient } from "@supabase/supabase-js";
import { calculateStreak, getCurrentMonthYear } from "./utils";

// Initialize Supabase client with service role for server-side operations

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://vxwwzvrzeptddawwvclj.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4d3d6dnJ6ZXB0ZGRhd3d2Y2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzM4NDQsImV4cCI6MjA2ODE0OTg0NH0.95XoVV1ZByBeO7vMEJCUZSpsnP37ZOZFoe094CAVXWo"
);

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface AuraCalculation {
  date: string;
  contributionsCount: number;
  baseAura: number;
  streakBonus: number;
  consistencyBonus: number;
  qualityBonus: number;
  totalAura: number;
}

// Calculate base aura points from contributions
export function calculateBaseAura(contributionsCount: number): number {
  if (contributionsCount === 0) return -10; // Penalty for no contributions
  if (contributionsCount <= 2) return contributionsCount * 5;
  if (contributionsCount <= 5) return contributionsCount * 8;
  if (contributionsCount <= 10) return contributionsCount * 12;
  return contributionsCount * 15; // High contribution bonus
}

// Calculate streak bonus
export function calculateStreakBonus(streakCount: number): number {
  if (streakCount === 0) return 0;
  return Math.min(streakCount * 2, 100); // Max 100 bonus points
}

// Calculate consistency bonus
export function calculateConsistencyBonus(
  contributionsCount: number,
  avgDailyContributions: number
): number {
  return contributionsCount > avgDailyContributions ? 10 : 0;
}

// Calculate quality bonus based on repository activity
export function calculateQualityBonus(repositoriesData?: any): number {
  // This can be enhanced based on repository stars, forks, etc.
  // For now, return 0
  return 0;
}

// Main aura calculation function
export function calculateDailyAura(
  contributionsCount: number,
  streakCount: number,
  avgDailyContributions: number,
  repositoriesData?: any
): AuraCalculation {
  const baseAura = calculateBaseAura(contributionsCount);
  const streakBonus = calculateStreakBonus(streakCount);
  const consistencyBonus = calculateConsistencyBonus(
    contributionsCount,
    avgDailyContributions
  );
  const qualityBonus = calculateQualityBonus(repositoriesData);

  const totalAura = baseAura + streakBonus + consistencyBonus + qualityBonus;

  return {
    date: new Date().toISOString().split("T")[0],
    contributionsCount,
    baseAura,
    streakBonus,
    consistencyBonus,
    qualityBonus,
    totalAura,
  };
}

// Calculate total aura from contribution history
export function calculateTotalAura(
  contributionDays: ContributionDay[]
): number {
  const totalContributions = contributionDays.reduce(
    (sum, day) => sum + day.contributionCount,
    0
  );
  const avgDailyContributions =
    totalContributions / Math.max(contributionDays.length, 1);
  const currentStreak = calculateStreak(contributionDays);

  return contributionDays.reduce((totalAura, day) => {
    const dailyAura = calculateDailyAura(
      day.contributionCount,
      currentStreak,
      avgDailyContributions
    );
    return totalAura + dailyAura.totalAura;
  }, 0);
}

// Save user aura data to database
export async function saveUserAura(
  userId: string,
  githubData: any,
  contributionDays: ContributionDay[]
): Promise<{ success: boolean; aura: number; error?: string }> {
  try {
    const totalAura = calculateTotalAura(contributionDays);
    const currentStreak = calculateStreak(contributionDays);
    const longestStreak = Math.max(currentStreak, 0); // You might want to calculate this properly

    // Update user record
    const { error: userError } = await supabaseAdmin.from("users").upsert({
      id: userId,
      github_username: githubData.login,
      github_id: githubData.id.toString(),
      display_name: githubData.name || githubData.login,
      avatar_url: githubData.avatar_url,
      github_data: githubData,
      total_aura: totalAura,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_contribution_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    });

    if (userError) {
      console.error("Error updating user:", userError);
      return { success: false, aura: 0, error: userError.message };
    }

    // Update global leaderboard
    await updateGlobalLeaderboard(userId, totalAura);

    // Update monthly leaderboard
    await updateMonthlyLeaderboard(userId, totalAura, contributionDays);

    // Check and award badges
    await checkAndAwardBadges(
      userId,
      totalAura,
      currentStreak,
      contributionDays
    );

    return { success: true, aura: totalAura };
  } catch (error) {
    console.error("Error saving user aura:", error);
    return {
      success: false,
      aura: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update global leaderboard
async function updateGlobalLeaderboard(userId: string, totalAura: number) {
  const { error } = await supabaseAdmin.from("global_leaderboard").upsert({
    user_id: userId,
    total_aura: totalAura,
    rank: 0, // Will be calculated separately
    last_updated: new Date().toISOString(),
  });

  if (error) {
    console.error("Error updating global leaderboard:", error);
  }

  // Recalculate ranks
  await recalculateGlobalRanks();
}

// Update monthly leaderboard
async function updateMonthlyLeaderboard(
  userId: string,
  totalAura: number,
  contributionDays: ContributionDay[]
) {
  const monthYear = getCurrentMonthYear();
  const [year, month] = monthYear.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  // Filter contributions for the current month
  const monthlyContributionDays = contributionDays.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate >= monthStart && dayDate <= monthEnd;
  });

  const monthlyContributions = monthlyContributionDays.reduce(
    (sum, day) => sum + day.contributionCount,
    0
  );

  // Count active days (days with contributions > 0)
  const activeDays = monthlyContributionDays.filter(
    (day) => day.contributionCount > 0
  ).length;

  // Calculate monthly aura (same formula as AuraPanel)
  const monthlyAura = Math.round(
    monthlyContributions * 10 + // 10 points per contribution
      activeDays * 50 + // 50 points per active day
      (activeDays / monthEnd.getDate()) * 1000 // Consistency bonus (up to 1000 points)
  );

  const { error } = await supabaseAdmin.from("monthly_leaderboards").upsert({
    user_id: userId,
    month_year: monthYear,
    total_aura: monthlyAura, // Store monthly aura, not total aura
    contributions_count: monthlyContributions,
    rank: 0, // Will be calculated separately
  });

  if (error) {
    console.error("Error updating monthly leaderboard:", error);
  }

  // Recalculate monthly ranks based on monthly aura
  await recalculateMonthlyRanks(monthYear);
}

// Recalculate global ranks
async function recalculateGlobalRanks() {
  // This would typically be done with a stored procedure for better performance
  const { data: leaderboard } = await supabaseAdmin
    .from("global_leaderboard")
    .select("user_id, total_aura")
    .order("total_aura", { ascending: false });

  if (leaderboard) {
    const updates = leaderboard.map((entry, index) => ({
      user_id: entry.user_id,
      rank: index + 1,
      total_aura: entry.total_aura,
      last_updated: new Date().toISOString(),
    }));

    for (const update of updates) {
      await supabaseAdmin
        .from("global_leaderboard")
        .update({ rank: update.rank })
        .eq("user_id", update.user_id);
    }
  }
}

// Recalculate monthly ranks
async function recalculateMonthlyRanks(monthYear: string) {
  const { data: leaderboard } = await supabaseAdmin
    .from("monthly_leaderboards")
    .select("user_id, total_aura")
    .eq("month_year", monthYear)
    .order("total_aura", { ascending: false });

  if (leaderboard) {
    const updates = leaderboard.map((entry, index) => ({
      user_id: entry.user_id,
      rank: index + 1,
    }));

    for (const update of updates) {
      await supabaseAdmin
        .from("monthly_leaderboards")
        .update({ rank: update.rank })
        .eq("user_id", update.user_id)
        .eq("month_year", monthYear);
    }
  }
}

// Check and award badges
async function checkAndAwardBadges(
  userId: string,
  totalAura: number,
  currentStreak: number,
  contributionDays: ContributionDay[]
) {
  const monthYear = getCurrentMonthYear();

  // Get all available badges
  const { data: badges } = await supabaseAdmin
    .from("badges")
    .select("*")
    .eq("is_active", true);

  if (!badges) return;

  for (const badge of badges) {
    const criteria = badge.criteria as any;
    let shouldAward = false;

    // Check if user already has this badge
    const { data: existingBadge } = await supabaseAdmin
      .from("user_badges")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_id", badge.id)
      .single();

    if (existingBadge && !badge.is_monthly) continue; // User already has this badge

    // Check criteria
    if (criteria.total_aura && totalAura >= criteria.total_aura) {
      shouldAward = true;
    }

    // For monthly ranking badges, check rank
    if (badge.is_monthly && criteria.rank) {
      const { data: userRank } = await supabaseAdmin
        .from("monthly_leaderboards")
        .select("rank")
        .eq("user_id", userId)
        .eq("month_year", monthYear)
        .single();

      if (userRank && userRank.rank <= criteria.rank) {
        shouldAward = true;
      }
    }

    if (shouldAward) {
      await supabaseAdmin.from("user_badges").upsert({
        user_id: userId,
        badge_id: badge.id,
        month_year: badge.is_monthly ? monthYear : null,
        rank: badge.is_monthly ? criteria.rank : null,
        earned_at: new Date().toISOString(),
      });
    }
  }
}
