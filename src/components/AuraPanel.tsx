"use client";
import React, { useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  TrendingUp,
  Zap,
  Calendar,
  GitBranch,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Theme, GitHubContributions } from "./types";
import {
  formatNumber,
  getAuraStatus,
  getStreakMessage,
  getCurrentMonthYear,
  calculateStreak,
} from "@/lib/utils2";
import { calculateTotalAura } from "@/lib/aura";
import { generateFunnyProfileMessage } from "@/lib/ai-service";
import { toast } from "sonner";

interface AuraPanelProps {
  selectedTheme: Theme;
  userAura: number;
  currentStreak: number;
  contributions: GitHubContributions;
  isCalculatingAura: boolean;
}

interface AIProfileMessage {
  funnyMessage: string;
  personality: string;
  motivation: string;
}

const AuraPanel: React.FC<AuraPanelProps> = ({
  selectedTheme,
  userAura,
  currentStreak,
  contributions,
  isCalculatingAura,
}) => {
  const { isSignedIn, user } = useUser();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [monthlyData, setMonthlyData] = useState<{
    contributions: number;
    aura: number;
    activeDays: number;
  }>({ contributions: 0, aura: 0, activeDays: 0 });
  const [isSyncingManually, setIsSyncingManually] = useState(false);
  const [aiMessage, setAiMessage] = useState<AIProfileMessage | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Calculate fallback total aura if userAura is 0 or invalid
  const fallbackTotalAura =
    userAura > 0
      ? userAura
      : calculateTotalAura(contributions.contributionDays);

  // Calculate fallback current streak if currentStreak is 0 or invalid
  const fallbackCurrentStreak =
    currentStreak > 0
      ? currentStreak
      : calculateStreak(contributions.contributionDays);

  // Generate AI message based on profile data
  const generateAIMessage = async () => {
    if (!isSignedIn || !user || isGeneratingAI) return;

    setIsGeneratingAI(true);

    try {
      const githubAccount = user.externalAccounts?.find(
        (account) => account.provider === "github"
      );

      if (!githubAccount?.username) {
        return;
      }

      // Fetch GitHub profile data
      const profileResponse = await fetch(
        `/api/github/profile/${githubAccount.username}`
      );
      let profileData = null;

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
      }

      // Prepare data for AI
      const aiProfileData = {
        username: githubAccount.username,
        displayName: profileData?.name || githubAccount.username,
        bio: profileData?.bio,
        location: profileData?.location,
        company: profileData?.company,
        publicRepos: profileData?.public_repos || 0,
        followers: profileData?.followers || 0,
        following: profileData?.following || 0,
        createdAt: profileData?.created_at || user.createdAt,
        contributions: contributions.contributionDays.reduce(
          (sum, day) => sum + day.contributionCount,
          0
        ),
        currentStreak: fallbackCurrentStreak,
        totalAura: fallbackTotalAura,
        monthlyAura: monthlyData.aura,
        activeDays: monthlyData.activeDays,
      };

      const aiResponse = await generateFunnyProfileMessage(aiProfileData);
      setAiMessage(aiResponse);
    } catch (error) {
      console.error("Error generating AI message:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate AI message when user data is available
  useEffect(() => {
    if (
      isSignedIn &&
      user &&
      contributions.contributionDays.length > 0 &&
      !isCalculatingAura
    ) {
      const timer = setTimeout(() => {
        generateAIMessage();
      }, 3000); // Delay to ensure all data is loaded

      return () => clearTimeout(timer);
    }
  }, [
    isSignedIn,
    user,
    contributions.contributionDays.length,
    isCalculatingAura,
    fallbackTotalAura,
    fallbackCurrentStreak,
    monthlyData,
  ]);

  // Function to manually sync all aura data with backend
  const handleManualSync = async () => {
    if (!isSignedIn || !user || isSyncingManually) {
      return;
    }

    setIsSyncingManually(true);

    try {
      // Sync current month data FIRST to establish correct monthly aura
      if (currentMonth === getCurrentMonthYear()) {
        const [year, month] = currentMonth.split("-").map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);

        let monthlyContributions = 0;
        let activeDays = 0;

        contributions.contributionDays.forEach((day) => {
          const dayDate = new Date(day.date);
          if (dayDate >= monthStart && dayDate <= monthEnd) {
            monthlyContributions += day.contributionCount;
            if (day.contributionCount > 0) {
              activeDays++;
            }
          }
        });

        const monthlyResponse = await fetch("/api/save-monthly-aura", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthYear: currentMonth,
            contributionsCount: monthlyContributions,
            activeDays: activeDays,
            allContributions: contributions.contributionDays,
          }),
        });

        if (monthlyResponse.ok) {
        }

        // Wait a moment to ensure monthly data is committed before total aura sync
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Then sync total aura (this will respect the monthly data set above)
      await syncTotalAuraWithBackend();

      // Regenerate AI message after sync
      await generateAIMessage();

      // toast.success("✅ Aura data synced! Ranks will update shortly.", {
      //   duration: 4000,
      // });
    } catch (error) {
      // console.error("❌ [AuraPanel] Manual sync failed:", error);
      // toast.error("❌ Failed to sync aura data. Please try again.");
    } finally {
      setIsSyncingManually(false);
    }
  };

  // Function to sync total aura data with backend
  const syncTotalAuraWithBackend = async () => {
    if (!isSignedIn || !user || contributions.contributionDays.length === 0) {
      return;
    }

    try {
      const githubAccount = user.externalAccounts?.find(
        (account) => account.provider === "github"
      );

      if (!githubAccount?.username) {
        // console.warn(
        //   "⚠️ [AuraPanel] No GitHub account found for total aura sync"
        // );
        return;
      }

      // console.log(
      //   `🔄 [AuraPanel] Auto-syncing total aura data for ${githubAccount.username}`
      // );

      const response = await fetch("/api/save-user-aura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          githubUsername: githubAccount.username,
          contributionDays: contributions.contributionDays,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // console.log(`✅ [AuraPanel] Successfully synced total aura:`, result);
      } else {
        const errorData = await response.json();
        // console.warn(`⚠️ [AuraPanel] Failed to sync total aura:`, errorData);
      }
    } catch (error) {
      // console.error("❌ [AuraPanel] Error syncing total aura:", error);
    }
  };

  // Auto-sync total aura when contributions data is available
  useEffect(() => {
    if (
      isSignedIn &&
      user &&
      contributions.contributionDays.length > 0 &&
      !isCalculatingAura
    ) {
      // Delay the sync to ensure all data is loaded
      const timer = setTimeout(() => {
        syncTotalAuraWithBackend();
      }, 2000); // Increased delay to ensure monthly data is synced first

      return () => clearTimeout(timer);
    }
  }, [
    isSignedIn,
    user,
    contributions.contributionDays.length,
    isCalculatingAura,
  ]);

  // Debug logging to understand the aura calculation issue
  useEffect(() => {
    if (contributions.contributionDays.length > 0) {
      const localCalculatedAura = calculateTotalAura(
        contributions.contributionDays
      );
      const localCalculatedStreak = calculateStreak(
        contributions.contributionDays
      );
    }
  }, [
    userAura,
    currentStreak,
    contributions,
    fallbackTotalAura,
    fallbackCurrentStreak,
    isCalculatingAura,
  ]);

  const auraStatus = getAuraStatus(fallbackTotalAura);
  const streakStatus = getStreakMessage(fallbackCurrentStreak);

  useEffect(() => {
    calculateMonthlyData();
  }, [currentMonth, contributions]);

  const calculateMonthlyData = async () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    let monthlyContributions = 0;
    let activeDays = 0;

    contributions.contributionDays.forEach((day) => {
      const dayDate = new Date(day.date);
      if (dayDate >= monthStart && dayDate <= monthEnd) {
        monthlyContributions += day.contributionCount;
        if (day.contributionCount > 0) {
          activeDays++;
        }
      }
    });

    // Calculate monthly aura using the official calculation method
    const baseAura = monthlyContributions * 10; // calculateBaseAura
    const consistencyRatio = activeDays / monthEnd.getDate();
    const consistencyBonus = Math.round(consistencyRatio * 1000); // calculateConsistencyBonus
    const monthlyAura = Math.round(
      baseAura + activeDays * 50 + consistencyBonus
    );

    setMonthlyData({
      contributions: monthlyContributions,
      aura: monthlyAura,
      activeDays: activeDays,
    });

    // Auto-sync monthly data to backend if user is signed in and it's current month
    if (isSignedIn && user && currentMonth === getCurrentMonthYear()) {
      try {
        const response = await fetch("/api/save-monthly-aura", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthYear: currentMonth,
            contributionsCount: monthlyContributions,
            activeDays: activeDays,
            allContributions: contributions.contributionDays, // Pass all contributions for complete aura calculation
          }),
        });

        if (response.ok) {
          const result = await response.json();
        } else {
          const errorData = await response.json();
          console.warn(
            `⚠️ [AuraPanel] Failed to sync monthly data:`,
            errorData
          );
        }
      } catch (error) {
        console.error("❌ [AuraPanel] Error syncing monthly data:", error);
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1);

    if (direction === "prev") {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    const newMonthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    setCurrentMonth(newMonthYear);
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getMonthlyAuraStatus = (monthlyAura: number) => {
    if (monthlyAura >= 5000)
      return { level: "🔥 Legendary", color: "text-red-500" };
    if (monthlyAura >= 3000)
      return { level: "⚡ Epic", color: "text-purple-500" };
    if (monthlyAura >= 2000)
      return { level: "💎 Elite", color: "text-blue-500" };
    if (monthlyAura >= 1000)
      return { level: "🌟 Pro", color: "text-green-500" };
    if (monthlyAura >= 500)
      return { level: "🚀 Rising", color: "text-yellow-500" };
    return { level: "🌱 Starting", color: "text-gray-500" };
  };

  const monthlyAuraStatus = getMonthlyAuraStatus(monthlyData.aura);

  return (
    <div className="bg-[#161b21] backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-[#21262d] shadow-2xl mt-4 sm:mt-6 md:mt-8 mx-1 sm:mx-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#7d8590]" />
          <span className="truncate">Aura Analysis</span>
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {isCalculatingAura && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-[#7d8590]"></div>
              <span className="text-sm text-[#7d8590]">Calculating...</span>
            </div>
          )}
          {isSignedIn && user && (
            <button
              onClick={handleManualSync}
              disabled={isSyncingManually || isCalculatingAura}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed text-[#e6edf3] rounded-md transition-all border border-[#30363d] hover:border-[#40464d]"
              title="Sync aura data with backend"
            >
              <RefreshCw
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  isSyncingManually ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {isSyncingManually ? "Syncing..." : "Sync"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* AI Generated Funny Message */}
      {isSignedIn && user && aiMessage && (
        <div className="mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-[#39d353]/30 bg-gradient-to-r from-[#0d1117] to-[#161b21] backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#39d353] mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-[#39d353] bg-[#39d353]/10 px-2 py-1 rounded-full">
                    {aiMessage.personality}
                  </span>
                  {isGeneratingAI && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#39d353]"></div>
                  )}
                </div>
                <p className="text-sm sm:text-base text-gray-200 mb-2 leading-relaxed">
                  {aiMessage.funnyMessage}
                </p>
                <p className="text-xs sm:text-sm text-[#39d353] font-medium">
                  {aiMessage.motivation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly View Toggle and Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#7d8590]" />
          <span className="text-sm font-medium text-white">
            Monthly Analysis
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1.5 sm:p-2 rounded-md touch-manipulation hover:bg-[#21262d] active:bg-[#161b21] transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#7d8590]" />
          </button>
          <span className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white whitespace-nowrap bg-[#0d1117] backdrop-blur-sm rounded border border-[#21262d]">
            {formatMonthYear(currentMonth)}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            className="p-1.5 sm:p-2 rounded-md touch-manipulation hover:bg-[#21262d] active:bg-[#161b21] transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentMonth >= getCurrentMonthYear()}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#7d8590]" />
          </button>
        </div>
      </div>

      {/* Monthly Aura Status Card */}
      <div className="mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-dashed bg-gradient-to-r from-[#0d1117] to-[#161b21] border-[#30363d] backdrop-blur-sm">
          <div className="text-center">
            <h4
              className={`text-base sm:text-lg font-bold ${monthlyAuraStatus.color} mb-2`}
            >
              {monthlyAuraStatus.level}
            </h4>
            <p className="text-sm sm:text-base md:text-lg mb-3 text-gray-200">
              {formatMonthYear(currentMonth)} Performance
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span
                className={`${monthlyAuraStatus.color} font-semibold whitespace-nowrap`}
              >
                {formatNumber(monthlyData.aura)} Monthly Aura
              </span>
              <span className="text-gray-300 font-semibold flex items-center gap-1 whitespace-nowrap">
                📊 {monthlyData.activeDays} Active Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 md:p-4 rounded-lg bg-[#0d1117] backdrop-blur-sm border border-[#21262d] hover:bg-[#161b21] transition-all">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[#7d8590] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#e6edf3] truncate">
              Monthly Aura
            </span>
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
            {formatNumber(monthlyData.aura)}
          </div>
        </div>

        <div className="p-2 sm:p-3 md:p-4 rounded-lg bg-[#0d1117] backdrop-blur-sm border border-[#21262d] hover:bg-[#161b21] transition-all">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <GitBranch className="w-3 h-3 sm:w-4 sm:h-4 text-[#7d8590] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#e6edf3] truncate">
              Contributions
            </span>
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
            {monthlyData.contributions}
          </div>
        </div>

        <div className="p-2 sm:p-3 md:p-4 rounded-lg bg-[#0d1117] backdrop-blur-sm border border-[#21262d] hover:bg-[#161b21] transition-all">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#7d8590] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#e6edf3] truncate">
              Active Days
            </span>
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
            {monthlyData.activeDays}
          </div>
        </div>

        <div className="p-2 sm:p-3 md:p-4 rounded-lg bg-[#0d1117] backdrop-blur-sm border border-[#21262d] hover:bg-[#161b21] transition-all">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#7d8590] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#e6edf3] truncate">
              Consistency
            </span>
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
            {Math.round(
              (monthlyData.activeDays /
                new Date(
                  parseInt(currentMonth.split("-")[0]),
                  parseInt(currentMonth.split("-")[1]),
                  0
                ).getDate()) *
                100
            )}
            %
          </div>
        </div>
      </div>

      {/* Overall Aura Status Card */}
      <div className="mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-[#21262d] bg-[#0d1117] backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl mb-2">
              {auraStatus.emoji}
            </div>
            <h4
              className={`text-base sm:text-lg font-bold ${auraStatus.color} mb-2`}
            >
              {auraStatus.level}
            </h4>
            <p className="text-sm sm:text-base md:text-lg mb-3 px-2 text-gray-200">
              {auraStatus.message}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span
                className={`${auraStatus.color} font-semibold whitespace-nowrap`}
              >
                {formatNumber(fallbackTotalAura)} Total Aura
              </span>
              <span
                className={`${streakStatus.color} font-semibold flex items-center gap-1 whitespace-nowrap`}
              >
                {streakStatus.emoji} {fallbackCurrentStreak} Day Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isSignedIn && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 md:p-6 rounded-lg border-2 border-dashed border-[#30363d] text-center bg-[#0d1117] backdrop-blur-sm">
          <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
            🚀
          </div>
          <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white">
            Ready to join the aura game?
          </h4>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base px-2 text-gray-400">
            Sign in to save your aura, earn epic badges, and dominate the
            leaderboard! 💪
          </p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all transform hover:scale-105 active:scale-95 font-semibold text-sm sm:text-base touch-manipulation border border-gray-600/50 shadow-lg">
              🔥 Start My Aura Journey
            </button>
          </SignInButton>
        </div>
      )}
    </div>
  );
};

export default AuraPanel;
