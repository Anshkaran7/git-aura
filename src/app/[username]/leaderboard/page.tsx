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
  AlertCircle,
  HeartHandshake,
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// Custom Leaderboard Component for username-based view
function CustomLeaderboard({ username }: { username: string }) {
  const [view, setView] = useState<"monthly" | "alltime">("monthly");
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [userOutOfTop100, setUserOutOfTop100] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20,
  });

  useEffect(() => {
    fetchLeaderboardData();
  }, [view, currentMonth, username, currentPage]);

  // Reset to page 1 when view or month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [view, currentMonth]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setUserOutOfTop100(false);
    try {
      let response;

      if (view === "monthly") {
        const params = new URLSearchParams({
          monthYear: currentMonth,
          page: currentPage.toString(),
          limit: "20",
        });
        response = await fetch(`/api/leaderboard/monthly?${params}`);
      } else {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
        });
        response = await fetch(`/api/leaderboard/alltime?${params}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();
      const leaderboard = data.leaderboard || [];

      // Set pagination info
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20,
        }
      );

      // Now we need to get the user's full rank (including beyond top 100)
      let userFullRank = null;
      let userEntry = null;

      // First, check if user is in current page
      userEntry = leaderboard.find(
        (entry: LeaderboardEntry) =>
          entry.user.github_username.toLowerCase() === username.toLowerCase()
      );

      if (userEntry) {
        userFullRank = userEntry.rank;
        setCurrentUser(userEntry);
      } else {
        // User not in current page, fetch their rank separately
        try {
          const userRankResponse = await fetch(
            view === "monthly"
              ? `/api/leaderboard/monthly?monthYear=${currentMonth}&userId=${username}`
              : `/api/leaderboard/alltime?userId=${username}`
          );

          if (userRankResponse.ok) {
            const userRankData = await userRankResponse.json();
            if (userRankData.userRank && userRankData.userRank > 0) {
              userFullRank = userRankData.userRank;

              // If user rank > 100, show motivational message
              if (userFullRank > 100) {
                setUserOutOfTop100(true);
                setCurrentUser({
                  rank: userFullRank,
                  user: {
                    id: "",
                    display_name: username,
                    github_username: username,
                    avatar_url: `https://github.com/${username}.png`,
                    total_aura: 0,
                    current_streak: 0,
                  },
                  aura: 0,
                  badges: [],
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user rank:", error);
        }
      }

      // Remove user from the main leaderboard if they're in current page
      const filteredLeaderboard = leaderboard.filter(
        (entry: LeaderboardEntry) =>
          entry.user.github_username.toLowerCase() !== username.toLowerCase()
      );

      setLeaderboardData(filteredLeaderboard);
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500" />
        );
      case 2:
        return (
          <Medal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
        );
      case 3:
        return (
          <Medal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />
        );
      default:
        return (
          <span className="text-base sm:text-lg font-bold text-[#7d8590] bg-[#21262d] rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center">
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
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-[#39d353] mx-auto mb-3 sm:mb-4"></div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
            Loading Leaderboard
          </h3>
          <p className="text-xs sm:text-sm text-[#7d8590]">
            Fetching latest rankings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex bg-[#161b21] rounded-lg p-1 border border-[#21262d] w-full sm:w-auto">
          <button
            onClick={() => setView("monthly")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              view === "monthly"
                ? "bg-[#39d353] text-black"
                : "text-[#7d8590] hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
            Monthly
          </button>
          <button
            onClick={() => setView("alltime")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              view === "alltime"
                ? "bg-[#39d353] text-black"
                : "text-[#7d8590] hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
            All Time
          </button>
        </div>

        {/* Month Navigation for Monthly View */}
        {view === "monthly" && (
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1.5 rounded-md touch-manipulation hover:bg-[#21262d] active:bg-[#161b21] transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4 text-[#7d8590]" />
            </button>
            <span className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap bg-[#0d1117] backdrop-blur-sm rounded border border-[#21262d]">
              {formatMonthYear(currentMonth)}
            </span>
            <button
              onClick={() => navigateMonth("next")}
              className="p-1.5 rounded-md touch-manipulation hover:bg-[#21262d] active:bg-[#161b21] transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentMonth >= getCurrentMonthYear()}
            >
              <ChevronRight className="w-4 h-4 text-[#7d8590]" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {pagination.totalCount > 0 && (
        <div className="flex items-center justify-between mb-4 text-xs sm:text-sm text-[#7d8590]">
          <span>
            Showing {Math.min(pagination.limit, pagination.totalCount)} of top
            100 developers
          </span>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>
      )}

      {/* Current User Highlight or Out of Top 100 Message */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 ${
            userOutOfTop100
              ? "border-2 border-orange-500 bg-gradient-to-r from-orange-900/20 to-red-900/20"
              : "border-2 border-[#39d353] bg-gradient-to-r from-[#161b21] to-[#0d1117]"
          }`}
        >
          {!userOutOfTop100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#39d353]/10 to-[#26a641]/10"></div>
          )}
          <div className="relative">
            {userOutOfTop100 ? (
              <div className="flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-orange-200 mb-1">
                    Time to Level Up! 💪
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-300/90 leading-relaxed">
                    @{username} is currently ranked #{currentUser.rank}. The top
                    100 developers are crushing it! Start contributing more,
                    maintain consistency, and climb your way up. Every commit
                    counts toward your coding journey! 🚀
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#39d353]" />
                  <span className="text-xs sm:text-sm font-medium text-[#39d353]">
                    {username}'s Position
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {getRankIcon(currentUser.rank)}
                    <img
                      src={currentUser.user.avatar_url}
                      alt={currentUser.user.display_name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-[#39d353]"
                    />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {currentUser.user.display_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#7d8590]">
                        @{currentUser.user.github_username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      #{currentUser.rank}
                    </div>
                    <div className="text-xs sm:text-sm text-[#7d8590]">
                      {formatNumber(currentUser.aura)} Aura
                    </div>
                    {currentUser.contributions !== undefined && (
                      <div className="text-[10px] sm:text-xs text-[#7d8590]">
                        {formatNumber(currentUser.contributions)} contributions
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Continue Leaderboard */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
          Other Developers
        </h3>
        <AnimatePresence>
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={`${entry.user.id}-${view}-${currentMonth}-${currentPage}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative overflow-hidden rounded-lg sm:rounded-xl border border-[#21262d]"
            >
              {entry.rank <= 3 && (
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
                    entry.rank
                  )} backdrop-blur-sm`}
                />
              )}

              <div className="relative p-2.5 sm:p-3 md:p-4 bg-[#161b21] backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                    <div className="flex items-center justify-center shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
                      <a
                        href={`/user/${entry.user.github_username}`}
                        className="hover:opacity-80 transition-opacity shrink-0"
                      >
                        <img
                          src={entry.user.avatar_url}
                          alt={entry.user.display_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-[#30363d]"
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
                          className="text-xs sm:text-sm truncate text-[#7d8590] hover:text-[#e6edf3]"
                        >
                          @{entry.user.github_username}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1">
                      {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                        <div
                          key={`${entry.user.id}-${badge.id}-${badgeIndex}`}
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
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                              {badge.rank}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-white">
                        {formatNumber(entry.aura)} Aura
                      </div>
                      {entry.contributions !== undefined && (
                        <div className="text-xs sm:text-sm text-[#7d8590]">
                          {formatNumber(entry.contributions)} contributions
                        </div>
                      )}
                      <div className="text-xs sm:text-sm text-[#7d8590]">
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

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#21262d]">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-2 rounded-md bg-[#161b21] border border-[#21262d] text-[#7d8590] hover:text-white hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      pageNum === currentPage
                        ? "bg-[#39d353] text-black"
                        : "bg-[#161b21] border border-[#21262d] text-[#7d8590] hover:text-white hover:bg-[#21262d]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-md bg-[#161b21] border border-[#21262d] text-[#7d8590] hover:text-white hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {leaderboardData.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <Trophy className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-[#7d8590]" />
          <p className="text-sm sm:text-base text-[#7d8590] px-4">
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
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-[#7d8590]">
            See where {username} ranks among all developers
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16 sm:py-20">
              <div className="bg-[#0d1117] border border-[#21262d] rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-[#39d353] mx-auto mb-3 sm:mb-4"></div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Loading Leaderboard
                </h3>
                <p className="text-xs sm:text-sm text-[#7d8590]">
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
