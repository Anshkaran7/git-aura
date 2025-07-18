"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Calendar,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  formatNumber,
  getBadgeColor,
  getCurrentMonthYear,
} from "../../lib/utils";
import { GitHubContributions } from "./types";

interface User {
  id: string;
  display_name: string;
  github_username: string;
  avatar_url: string;
  total_aura: number;
  current_streak: number;
}

interface LeaderboardEntry {
  rank: number;
  user: User;
  aura: number;
  contributions?: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: string;
  month_year?: string;
  rank?: number;
}

interface LeaderboardProps {
  currentUserId?: string;
  selectedTheme: {
    name: string;
    background: string;
    cardBackground: string;
    text: string;
    border: string;
  };
  contributions: GitHubContributions;
}

const Leaderboard = ({
  currentUserId,
  selectedTheme,
  contributions,
}: LeaderboardProps) => {
  const [view, setView] = useState<"monthly" | "alltime">("monthly");
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [monthlyData, setMonthlyData] = useState<{
    contributions: number;
    aura: number;
    activeDays: number;
  }>({ contributions: 0, aura: 0, activeDays: 0 });

  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const requestInProgress = useRef(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [view, currentMonth]);

  useEffect(() => {
    calculateMonthlyData();
  }, [currentMonth, contributions]);

  const calculateMonthlyData = () => {
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
  };
  const fetchLeaderboardData = async () => {
    // Prevent duplicate calls
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setLoading(true);
    try {
      let response;
      
      if (view === "monthly") {
        // Fetch monthly leaderboard via API
        const params = new URLSearchParams({
          monthYear: currentMonth,
          ...(currentUserId && { userId: currentUserId }),
        });
        
        response = await fetch(`/api/leaderboard/monthly?${params}`);
      } else {
        // Fetch all-time leaderboard via API
        const params = new URLSearchParams({
          ...(currentUserId && { userId: currentUserId }),
        });
        
        response = await fetch(`/api/leaderboard/alltime?${params}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setLeaderboardData(data.leaderboard || []);
      setUserRank(data.userRank || null);

    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">
            {rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600";
      case 2:
        return "from-gray-300 to-gray-500";
      case 3:
        return "from-amber-500 to-amber-700";
      default:
        return selectedTheme.name === "Light"
          ? "from-gray-100 to-gray-200"
          : "from-gray-700 to-gray-800";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`${selectedTheme.cardBackground} rounded-2xl p-6 border ${selectedTheme.border} shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy
              className={`w-6 h-6 ${
                selectedTheme.name === "Light"
                  ? "text-yellow-600"
                  : "text-yellow-500"
              }`}
            />
            <h2 className={`text-2xl font-bold ${selectedTheme.text}`}>
              Leaderboard
            </h2>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView("monthly")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "monthly"
                  ? "bg-blue-500 text-white"
                  : selectedTheme.name === "Light"
                  ? "text-gray-600 hover:text-gray-800"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Monthly
            </button>
            <button
              onClick={() => setView("alltime")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "alltime"
                  ? "bg-blue-500 text-white"
                  : selectedTheme.name === "Light"
                  ? "text-gray-600 hover:text-gray-800"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Globe className="w-4 h-4" />
              All-Time
            </button>
          </div>
        </div>

        {/* Month Navigation (only for monthly view) */}
        {view === "monthly" && (
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
        )}
      </div>

      {/* Current User Rank */}
      {currentUserId && userRank && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            selectedTheme.name === "Light" ? "bg-blue-50" : "bg-blue-900/20"
          } border-l-4 border-blue-500`}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${selectedTheme.text}`}>
              Your current rank: #{userRank}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        <AnimatePresence>
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={`${entry.user.id}-${view}-${currentMonth}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-xl border ${
                selectedTheme.border
              } ${
                entry.user.id === currentUserId ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Gradient Background for Top 3 */}
              {entry.rank <= 3 && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
                    entry.rank
                  )} opacity-10`}
                />
              )}

              <div className={`relative p-4 ${selectedTheme.cardBackground}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar and Info */}
                    <div className="flex items-center gap-3">
                      <a
                        href={`https://github.com/${entry.user.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={entry.user.avatar_url}
                          alt={entry.user.display_name}
                          className="w-10 h-10 rounded-full ring-2 ring-blue-500/30"
                        />
                      </a>
                      <div className="flex flex-col">
                        <a
                          href={`https://github.com/${entry.user.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-semibold ${selectedTheme.text} hover:underline`}
                        >
                          {entry.user.display_name}
                        </a>
                        <a
                          href={`https://github.com/${entry.user.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm ${
                            selectedTheme.name === "Light"
                              ? "text-gray-500 hover:text-gray-700"
                              : "text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          @{entry.user.github_username}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Badges */}
                    <div className="flex items-center gap-1">
                      {entry.badges.slice(0, 3).map((badge) => (
                        <div
                          key={`${badge.id}-${badge.month_year || ""}-${badge.rank || ""}`}
                          className={`relative group cursor-pointer`}
                          title={`${badge.name}: ${badge.description}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${getBadgeColor(
                              badge.rarity
                            )} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                          >
                            {badge.icon}
                          </div>
                          {badge.rank && badge.rank <= 3 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {badge.rank}
                            </div>
                          )}
                        </div>
                      ))}
                      {entry.badges.length > 3 && (
                        <div
                          className={`w-8 h-8 rounded-full ${
                            selectedTheme.name === "Light"
                              ? "bg-gray-200"
                              : "bg-gray-700"
                          } flex items-center justify-center text-xs font-medium ${
                            selectedTheme.text
                          }`}
                        >
                          +{entry.badges.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${selectedTheme.text}`}
                      >
                        {formatNumber(entry.aura)}Aura
                      </div>
                      {entry.contributions !== undefined && (
                        <div
                          className={`text-sm ${
                            selectedTheme.name === "Light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {formatNumber(entry.contributions)} contributions
                        </div>
                      )}
                      <div
                        className={`text-sm ${
                          selectedTheme.name === "Light"
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        🔥 {entry.user.current_streak} streak
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {leaderboardData.length === 0 && !loading && (
        <div className="text-center py-8">
          <Trophy
            className={`w-12 h-12 mx-auto mb-3 ${
              selectedTheme.name === "Light" ? "text-gray-400" : "text-gray-600"
            }`}
          />
          <p
            className={`${
              selectedTheme.name === "Light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            No data available for this {view === "monthly" ? "month" : "period"}
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
