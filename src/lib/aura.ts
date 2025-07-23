// Re-export functions from the new aura-calculations system
export {
  calculateTotalAura,
  calculateBaseAura,
  calculateStreakBonus,
  calculateConsistencyBonus,
  calculateQualityBonus,
  calculateMonthlyAura,
} from "./aura-calculations";

export { calculateStreak } from "./utils2";

// Client-side function to save user aura via API
export async function saveUserAura(
  userId: string,
  githubData: any,
  contributionDays: ContributionDay[]
): Promise<{ success: boolean; aura: number; error?: string }> {
  try {
    const response = await fetch("/api/save-user-aura", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        githubUsername: githubData.login,
        contributionDays,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        aura: result.totalAura || 0,
      };
    } else {
      return {
        success: false,
        aura: 0,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Error in saveUserAura:", error);
    return {
      success: false,
      aura: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export types for compatibility
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
