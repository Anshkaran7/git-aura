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
} from "../../lib/utils";

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

    // Save monthly aura to database if user is signed in
    if (isSignedIn && user?.id) {
      await saveMonthlyAura(
        currentMonth,
        monthlyAura,
        monthlyContributions,
        activeDays
      );
    }
  };

  const saveMonthlyAura = async (
    monthYear: string,
    monthlyAura: number,
    contributionsCount: number,
    activeDays: number
  ) => {
    try {
      const response = await fetch("/api/save-monthly-aura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthYear,
          monthlyAura,
          contributionsCount,
          activeDays,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save monthly aura");
      }
    } catch (error) {
      console.error("Error saving monthly aura:", error);
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
    <div
      className={`${selectedTheme.cardBackground} rounded-2xl p-6 border ${selectedTheme.border} shadow-lg mt-8`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-xl font-bold ${selectedTheme.text} flex items-center gap-2`}
        >
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Aura Analysis
        </h3>
        {isCalculatingAura && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span
              className={`text-sm ${
                selectedTheme.name === "Light"
                  ? "text-gray-600"
                  : "text-gray-400"
              }`}
            >
              Calculating...
            </span>
          </div>
        )}
      </div>

      {/* Monthly View Toggle and Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className={`text-sm font-medium ${selectedTheme.text}`}>
            Monthly Analysis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className={`p-1 rounded-md ${
              selectedTheme.name === "Light"
                ? "hover:bg-gray-100"
                : "hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span
            className={`px-3 py-1 text-sm font-medium ${selectedTheme.text}`}
          >
            {formatMonthYear(currentMonth)}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            className={`p-1 rounded-md ${
              selectedTheme.name === "Light"
                ? "hover:bg-gray-100"
                : "hover:bg-gray-700"
            }`}
            disabled={currentMonth >= getCurrentMonthYear()}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Monthly Aura Status Card */}
      <div className="mb-6">
        <div
          className={`p-6 rounded-xl border-2 border-dashed ${
            selectedTheme.name === "Light"
              ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
              : "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30"
          }`}
        >
          <div className="text-center">
            <h4 className={`text-lg font-bold ${monthlyAuraStatus.color} mb-2`}>
              {monthlyAuraStatus.level}
            </h4>
            <p
              className={`text-lg mb-3 ${
                selectedTheme.name === "Light"
                  ? "text-gray-700"
                  : "text-gray-200"
              }`}
            >
              {formatMonthYear(currentMonth)} Performance
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className={`${monthlyAuraStatus.color} font-semibold`}>
                {formatNumber(monthlyData.aura)} Monthly Aura
              </span>
              <span
                className={`text-green-500 font-semibold flex items-center gap-1`}
              >
                📊 {monthlyData.activeDays} Active Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg ${
            selectedTheme.name === "Light" ? "bg-blue-50" : "bg-blue-900/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span
              className={`text-sm font-medium ${
                selectedTheme.name === "Light"
                  ? "text-blue-700"
                  : "text-blue-300"
              }`}
            >
              Monthly Aura
            </span>
          </div>
          <div className={`text-2xl font-bold ${selectedTheme.text}`}>
            {formatNumber(monthlyData.aura)}
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            selectedTheme.name === "Light" ? "bg-green-50" : "bg-green-900/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-green-500" />
            <span
              className={`text-sm font-medium ${
                selectedTheme.name === "Light"
                  ? "text-green-700"
                  : "text-green-300"
              }`}
            >
              Contributions
            </span>
          </div>
          <div className={`text-2xl font-bold ${selectedTheme.text}`}>
            {monthlyData.contributions}
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            selectedTheme.name === "Light" ? "bg-orange-50" : "bg-orange-900/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span
              className={`text-sm font-medium ${
                selectedTheme.name === "Light"
                  ? "text-orange-700"
                  : "text-orange-300"
              }`}
            >
              Active Days
            </span>
          </div>
          <div className={`text-2xl font-bold ${selectedTheme.text}`}>
            {monthlyData.activeDays}
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            selectedTheme.name === "Light" ? "bg-purple-50" : "bg-purple-900/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span
              className={`text-sm font-medium ${
                selectedTheme.name === "Light"
                  ? "text-purple-700"
                  : "text-purple-300"
              }`}
            >
              Consistency
            </span>
          </div>
          <div className={`text-2xl font-bold ${selectedTheme.text}`}>
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
      <div className="mb-6">
        <div
          className={`p-6 rounded-xl border ${selectedTheme.border} ${
            selectedTheme.name === "Light" ? "bg-gray-50/50" : "bg-gray-900/20"
          }`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">{auraStatus.emoji}</div>
            <h4 className={`text-lg font-bold ${auraStatus.color} mb-2`}>
              {auraStatus.level}
            </h4>
            <p
              className={`text-lg mb-3 ${
                selectedTheme.name === "Light"
                  ? "text-gray-700"
                  : "text-gray-200"
              }`}
            >
              {auraStatus.message}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className={`${auraStatus.color} font-semibold`}>
                {formatNumber(userAura)} Total Aura
              </span>
              <span
                className={`${streakStatus.color} font-semibold flex items-center gap-1`}
              >
                {streakStatus.emoji} {currentStreak} Day Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isSignedIn && (
        <div
          className={`mt-6 p-6 rounded-lg border-2 border-dashed ${selectedTheme.border} text-center`}
        >
          <div className="text-4xl mb-3">🚀</div>
          <h4
            className={`text-lg font-bold mb-3 ${
              selectedTheme.name === "Light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Ready to join the aura game?
          </h4>
          <p
            className={`mb-4 ${
              selectedTheme.name === "Light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Sign in to save your aura, earn epic badges, and dominate the
            leaderboard! 💪
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold">
              🔥 Start My Aura Journey
            </button>
          </SignInButton>
        </div>
      )}
    </div>
  );
};

export default AuraPanel;
