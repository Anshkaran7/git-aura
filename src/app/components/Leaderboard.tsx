"use client";

import React, { useState, useEffect } from "react";
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
import { createClient } from "@supabase/supabase-js";
import {
  formatNumber,
  getBadgeColor,
  getCurrentMonthYear,
} from "../../lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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
}

const Leaderboard = ({ currentUserId, selectedTheme }: LeaderboardProps) => {
  const [view, setView] = useState<"monthly" | "alltime">("monthly");
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [view, currentMonth]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      let query;
      let userRankQuery;

      if (view === "monthly") {
        // Fetch monthly leaderboard - show monthly aura only
        const { data: monthlyData } = await supabase
          .from("monthly_leaderboards")
          .select(
            `
            rank,
            monthly_aura,
            contributions_count,
            users!inner(
              id,
              display_name,
              github_username,
              avatar_url,
              monthly_aura,
              current_streak
            )
          `
          )
          .eq("month_year", currentMonth)
          .order("rank", { ascending: true })
          .limit(100);

        query = monthlyData;

        // Get current user's rank for this month
        if (currentUserId) {
          const { data: userRankData } = await supabase
            .from("monthly_leaderboards")
            .select("rank")
            .eq("month_year", currentMonth)
            .eq("user_id", currentUserId)
            .single();

          setUserRank(userRankData?.rank || null);
        }
      } else {
        // Fetch all-time leaderboard - show total aura
        const { data: alltimeData } = await supabase
          .from("global_leaderboard")
          .select(
            `
            rank,
            total_aura,
            users!inner(
              id,
              display_name,
              github_username,
              avatar_url,
              total_aura,
              current_streak
            )
          `
          )
          .order("rank", { ascending: true })
          .limit(100);

        query = alltimeData;

        // Get current user's all-time rank
        if (currentUserId) {
          const { data: userRankData } = await supabase
            .from("global_leaderboard")
            .select("rank")
            .eq("user_id", currentUserId)
            .single();

          setUserRank(userRankData?.rank || null);
        }
      }

      if (query) {
        // Fetch badges for each user
        const userIds = query.map((entry: any) => entry.users.id);
        const { data: badgesData } = await supabase
          .from("user_badges")
          .select(
            `
            user_id,
            month_year,
            rank,
            badges!inner(
              id,
              name,
              description,
              icon,
              color,
              rarity
            )
          `
          )
          .in("user_id", userIds);

        // Transform data
        const transformedData: LeaderboardEntry[] = query.map((entry: any) => {
          const userBadges =
            badgesData?.filter(
              (badge: any) => badge.user_id === entry.users.id
            ) || [];

          return {
            rank: entry.rank,
            user: entry.users,
            aura: entry.total_aura || 0,
            contributions:
              view === "monthly" ? entry.contributions_count : undefined,
            badges: userBadges.map((ub: any) => ({
              ...ub.badges,
              month_year: ub.month_year,
              rank: ub.rank,
            })),
          };
        });

        setLeaderboardData(transformedData);
      }
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
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
                      <img
                        src={entry.user.avatar_url}
                        alt={entry.user.display_name}
                        className="w-10 h-10 rounded-full ring-2 ring-blue-500/30"
                      />
                      <div>
                        <div className={`font-semibold ${selectedTheme.text}`}>
                          {entry.user.display_name}
                        </div>
                        <div
                          className={`text-sm ${
                            selectedTheme.name === "Light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          @{entry.user.github_username}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Badges */}
                    <div className="flex items-center gap-1">
                      {entry.badges.slice(0, 3).map((badge) => (
                        <div
                          key={badge.id}
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
                        {formatNumber(entry.aura)} Aura
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
