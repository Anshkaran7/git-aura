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
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import { formatNumber, getBadgeColor, getCurrentMonthYear } from "@/lib/utils2";
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
  const [filteredData, setFilteredData] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [monthlyData, setMonthlyData] = useState<{
    contributions: number;
    aura: number;
    activeDays: number;
  }>({ contributions: 0, aura: 0, activeDays: 0 });

  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userNotInLeaderboard, setUserNotInLeaderboard] = useState(false);
  const requestInProgress = useRef(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [view, currentMonth, currentUserId]);

  useEffect(() => {
    calculateMonthlyData();
  }, [currentMonth, contributions]);

  useEffect(() => {
    filterLeaderboard();
  }, [searchQuery, leaderboardData]);

  const filterLeaderboard = () => {
    if (!searchQuery.trim()) {
      setFilteredData(leaderboardData);
      return;
    }

    const filtered = leaderboardData.filter(
      (entry) =>
        entry.user.display_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        entry.user.github_username
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  };

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
    setUserNotInLeaderboard(false);

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

      // Handle user rank - check if user exists in leaderboard
      if (currentUserId) {
        if (data.userRank && data.userRank > 0) {
          setUserRank(data.userRank);
          setUserNotInLeaderboard(false);
        } else {
          // User not found in leaderboard - they haven't participated yet
          setUserRank(null);
          setUserNotInLeaderboard(true);
        }
      } else {
        setUserRank(null);
        setUserNotInLeaderboard(false);
      }
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
      setUserRank(null);
      setUserNotInLeaderboard(false);
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
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-300">
            {rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400/20 to-yellow-600/20";
      case 2:
        return "from-gray-300/20 to-gray-500/20";
      case 3:
        return "from-amber-500/20 to-amber-700/20";
      default:
        return "from-gray-800/20 to-gray-900/20";
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-800/50 shadow-2xl mx-1 sm:mx-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Leaderboard
            </h2>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-900/60 backdrop-blur-sm rounded-lg p-1 w-full sm:w-auto border border-gray-700/50">
            <button
              onClick={() => setView("monthly")}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none touch-manipulation ${
                view === "monthly"
                  ? "bg-gray-700/80 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-200 active:text-white hover:bg-gray-800/50"
              }`}
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">Monthly</span>
            </button>
            <button
              onClick={() => setView("alltime")}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none touch-manipulation ${
                view === "alltime"
                  ? "bg-gray-700/80 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-200 active:text-white hover:bg-gray-800/50"
              }`}
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">All-Time</span>
            </button>
          </div>
        </div>

        {/* Month Navigation (only for monthly view) */}
        {view === "monthly" && (
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1.5 sm:p-2 rounded-md touch-manipulation hover:bg-gray-800/50 active:bg-gray-700/50 transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>
            <span className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white whitespace-nowrap bg-gray-900/40 backdrop-blur-sm rounded border border-gray-700/50">
              {formatMonthYear(currentMonth)}
            </span>
            <button
              onClick={() => navigateMonth("next")}
              className="p-1.5 sm:p-2 rounded-md touch-manipulation hover:bg-gray-800/50 active:bg-gray-700/50 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentMonth >= getCurrentMonthYear()}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search developers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200 hover:bg-gray-900/80"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="absolute right-0 top-full mt-2 text-xs text-gray-400 bg-gray-900/60 backdrop-blur-sm px-2 py-1 rounded border border-gray-700/50">
            {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}{" "}
            found
          </div>
        )}
      </div>

      {/* Current User Rank or Status */}
      {currentUserId && (
        <div className="mb-3 sm:mb-4">
          {userRank && userRank > 0 ? (
            <div className="p-2 sm:p-3 rounded-lg bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                <span className="text-xs sm:text-sm font-medium text-white">
                  Your current rank: #{userRank}
                </span>
              </div>
            </div>
          ) : userNotInLeaderboard ? (
            <div className="p-2 sm:p-3 rounded-lg bg-blue-900/20 backdrop-blur-sm border border-blue-700/50 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium text-blue-200">
                  You haven't joined this {view === "monthly" ? "month's" : ""}{" "}
                  leaderboard yet. Start contributing to get ranked!
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredData.map((entry, index) => (
            <motion.div
              key={`${entry.user.id}-${view}-${currentMonth}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-xl border border-gray-700/50 ${
                entry.user.id === currentUserId
                  ? "ring-2 ring-yellow-500/50"
                  : ""
              }`}
            >
              {/* Gradient Background for Top 3 */}
              {entry.rank <= 3 && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
                    entry.rank
                  )} backdrop-blur-sm`}
                />
              )}

              <div className="relative p-2 sm:p-3 md:p-4 bg-gray-900/40 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                    {/* Rank */}
                    <div className="flex items-center justify-center shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar and Info */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
                      <a
                        href={`/user/${entry.user.github_username}`}
                        className="hover:opacity-80 transition-opacity shrink-0"
                      >
                        <img
                          src={entry.user.avatar_url}
                          alt={entry.user.display_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-gray-600/50"
                        />
                      </a>
                      <div className="flex flex-col min-w-0 flex-1">
                        <a
                          href={`/user/${entry.user.github_username}`}
                          className="font-semibold text-sm sm:text-base text-white hover:underline truncate"
                        >
                          {entry.user.display_name}
                        </a>
                        <a
                          href={`/user/${entry.user.github_username}`}
                          className="text-xs sm:text-sm truncate text-gray-400 hover:text-gray-200"
                        >
                          @{entry.user.github_username}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                    {/* Badges */}
                    <div className="flex items-center gap-1">
                      {entry.badges.slice(0, 3).map((badge, index) => (
                        <div
                          key={`${entry.user.id}-${badge.id}-${
                            badge.month_year || "no-month"
                          }-${badge.rank || "no-rank"}-${index}`}
                          className="relative group cursor-pointer"
                          title={`${badge.name}: ${badge.description}`}
                        >
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${getBadgeColor(
                              badge.rarity
                            )} flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg backdrop-blur-sm`}
                          >
                            {badge.icon}
                          </div>
                          {badge.rank && badge.rank <= 3 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {badge.rank}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-sm sm:text-base md:text-lg font-bold text-white">
                        {formatNumber(entry.aura)} Aura
                      </div>
                      {entry.contributions !== undefined && (
                        <div className="text-xs sm:text-sm text-gray-400">
                          {formatNumber(entry.contributions)} contributions
                        </div>
                      )}
                      <div className="text-xs sm:text-sm text-gray-400">
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

      {filteredData.length === 0 && !loading && (
        <div className="text-center py-6 sm:py-8">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-400 px-4">
            {searchQuery.trim()
              ? `No developers found matching "${searchQuery}"`
              : `No data available for this ${
                  view === "monthly" ? "month" : "period"
                }.`}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={clearSearch}
              className="mt-2 text-sm text-gray-500 hover:text-gray-300 underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
