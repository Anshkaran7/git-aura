"use client";

import { Suspense, useState, useEffect } from "react";
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
} from "lucide-react";
import { formatNumber, getBadgeColor, getCurrentMonthYear } from "@/lib/utils2";
import { Header } from "@/components/home";

interface PageProps {
  params: Promise<{ username: string }>;
}

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

// Custom Leaderboard Component for username-based view
function CustomLeaderboard({ username }: { username: string }) {
  const [view, setView] = useState<"monthly" | "alltime">("monthly");
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, [view, currentMonth, username]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      let response;

      if (view === "monthly") {
        response = await fetch(
          `/api/leaderboard/monthly?monthYear=${currentMonth}`
        );
      } else {
        response = await fetch(`/api/leaderboard/alltime`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();
      const leaderboard = data.leaderboard || [];

      // Find the current user
      const userEntry = leaderboard.find(
        (entry: LeaderboardEntry) =>
          entry.user.github_username.toLowerCase() === username.toLowerCase()
      );

      // Remove user from the main leaderboard and set them separately
      const filteredLeaderboard = leaderboard.filter(
        (entry: LeaderboardEntry) =>
          entry.user.github_username.toLowerCase() !== username.toLowerCase()
      );

      setCurrentUser(userEntry || null);
      setLeaderboardData(filteredLeaderboard);
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
          <span className="text-lg font-bold text-[#7d8590] bg-[#21262d] rounded-full w-8 h-8 flex items-center justify-center">
            {rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20";
      case 2:
        return "from-gray-400/20 to-gray-500/20";
      case 3:
        return "from-amber-600/20 to-amber-700/20";
      default:
        return "from-[#161b21] to-[#0d1117]";
    }
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-").map(Number);
    let newYear = year;
    let newMonth = month;

    if (direction === "prev") {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }

    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, "0")}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#39d353] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Loading Leaderboard
          </h3>
          <p className="text-[#7d8590] text-sm">Fetching latest rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex bg-[#161b21] rounded-lg p-1 border border-[#21262d]">
          <button
            onClick={() => setView("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === "monthly"
                ? "bg-[#39d353] text-black"
                : "text-[#7d8590] hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4 mr-2 inline" />
            Monthly
          </button>
          <button
            onClick={() => setView("alltime")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === "alltime"
                ? "bg-[#39d353] text-black"
                : "text-[#7d8590] hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4 mr-2 inline" />
            All Time
          </button>
        </div>

        {/* Month Navigation for Monthly View */}
        {view === "monthly" && (
          <div className="flex items-center gap-3">
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
        )}
      </div>

      {/* Current User Highlight */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-xl border-2 border-[#39d353] bg-gradient-to-r from-[#161b21] to-[#0d1117] p-4 md:p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#39d353]/10 to-[#26a641]/10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-[#39d353]" />
              <span className="text-sm font-medium text-[#39d353]">
                Your Position
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {getRankIcon(currentUser.rank)}
                <img
                  src={currentUser.user.avatar_url}
                  alt={currentUser.user.display_name}
                  className="w-12 h-12 rounded-full ring-2 ring-[#39d353]"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {currentUser.user.display_name}
                  </h3>
                  <p className="text-[#7d8590]">
                    @{currentUser.user.github_username}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  #{currentUser.rank}
                </div>
                <div className="text-sm text-[#7d8590]">
                  {formatNumber(currentUser.aura)} Aura
                </div>
                {currentUser.contributions !== undefined && (
                  <div className="text-xs text-[#7d8590]">
                    {formatNumber(currentUser.contributions)} contributions
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue Leaderboard */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white mb-4">Other Developers</h3>
        <AnimatePresence>
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={`${entry.user.id}-${view}-${currentMonth}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative overflow-hidden rounded-xl border border-[#21262d]"
            >
              {entry.rank <= 3 && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
                    entry.rank
                  )} backdrop-blur-sm`}
                />
              )}

              <div className="relative p-3 md:p-4 bg-[#161b21] backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                    <div className="flex items-center justify-center shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
                      <a
                        href={`/${entry.user.github_username}`}
                        className="hover:opacity-80 transition-opacity shrink-0"
                      >
                        <img
                          src={entry.user.avatar_url}
                          alt={entry.user.display_name}
                          className="w-10 h-10 rounded-full ring-2 ring-[#30363d]"
                        />
                      </a>
                      <div className="flex flex-col min-w-0 flex-1">
                        <a
                          href={`/${entry.user.github_username}`}
                          className="font-semibold text-base text-white hover:underline truncate"
                        >
                          {entry.user.display_name}
                        </a>
                        <a
                          href={`/${entry.user.github_username}`}
                          className="text-sm truncate text-[#7d8590] hover:text-[#e6edf3]"
                        >
                          @{entry.user.github_username}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1">
                      {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                        <div
                          key={`${entry.user.id}-${badge.id}-${badgeIndex}`}
                          className="relative group cursor-pointer"
                          title={`${badge.name}: ${badge.description}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${getBadgeColor(
                              badge.rarity
                            )} flex items-center justify-center text-white text-sm font-bold shadow-lg backdrop-blur-sm`}
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
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {formatNumber(entry.aura)} Aura
                      </div>
                      {entry.contributions !== undefined && (
                        <div className="text-sm text-[#7d8590]">
                          {formatNumber(entry.contributions)} contributions
                        </div>
                      )}
                      <div className="text-sm text-[#7d8590]">
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

      {leaderboardData.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-[#7d8590]" />
          <p className="text-base text-[#7d8590] px-4">
            No other developers found for this{" "}
            {view === "monthly" ? "month" : "period"}.
          </p>
        </div>
      )}
    </div>
  );
}

export default async function LeaderboardPage({ params }: PageProps) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-black transition-colors duration-300">
      <Header leaderboard={false} dashboard={true} />
      <div className="max-w-6xl mx-auto px-4 pt-28 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-[#7d8590]">
            See where {username} ranks among all developers
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#39d353] mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Loading Leaderboard
                </h3>
                <p className="text-[#7d8590] text-sm">
                  Fetching latest rankings...
                </p>
              </div>
            </div>
          }
        >
          <LeaderboardWrapper username={username} />
        </Suspense>
      </div>
    </div>
  );
}

// Wrapper component to handle the custom leaderboard display
function LeaderboardWrapper({ username }: { username: string }) {
  return <CustomLeaderboard username={username} />;
}
