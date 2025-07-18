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
} from "lucide-react";
import { Theme, GitHubContributions } from "./types";
import {
  formatNumber,
  getAuraStatus,
  getStreakMessage,
  getCurrentMonthYear,
} from "@/lib/utils2";

interface AuraPanelProps {
  selectedTheme: Theme;
  userAura: number;
  currentStreak: number;
  contributions: GitHubContributions;
  isCalculatingAura: boolean;
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

  const auraStatus = getAuraStatus(userAura);
  const streakStatus = getStreakMessage(currentStreak);

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

    // Calculate monthly aura based on contributions and activity
    const monthlyAura = Math.round(
      monthlyContributions * 10 + // 10 points per contribution
        activeDays * 50 + // 50 points per active day
        (activeDays / monthEnd.getDate()) * 1000 // Consistency bonus (up to 1000 points)
    );

    setMonthlyData({
      contributions: monthlyContributions,
      aura: monthlyAura,
      activeDays: activeDays,
    });

    // Monthly aura is now automatically saved in the background via the profile API
    // No need to make separate API calls here
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
        {isCalculatingAura && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-[#7d8590]"></div>
            <span className="text-sm text-[#7d8590]">Calculating...</span>
          </div>
        )}
      </div>

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
                {formatNumber(userAura)} Total Aura
              </span>
              <span
                className={`${streakStatus.color} font-semibold flex items-center gap-1 whitespace-nowrap`}
              >
                {streakStatus.emoji} {currentStreak} Day Streak
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
