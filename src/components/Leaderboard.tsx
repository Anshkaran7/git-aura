"use client";

import React, { useEffect, useRef, useState } from "react";
import { Trophy, Search, X, AlertCircle } from "lucide-react";
import { getCurrentMonthYear } from "@/lib/utils2";
import { calculateMonthlyAuraBreakdown } from "@/lib/aura-calculations";
import { GitHubContributions } from "./types";
import { ErrorState } from "./leaderboard/ErrorState";
import { ViewToggle } from "./leaderboard/ViewToggle";
import { MonthNavigation } from "./leaderboard/MonthNavigation";
import { Pagination } from "./leaderboard/Pagination";
import { LoadingState } from "./leaderboard/LoadingState";
import { LeaderboardEntry as LeaderboardEntryRow } from "./leaderboard/LeaderboardEntry";
import { Input } from "./ui/input";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [filteredData, setFilteredData] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20,
  });
  const [monthlyData, setMonthlyData] = useState<{
    contributions: number;
    aura: number;
    activeDays: number;
  }>({ contributions: 0, aura: 0, activeDays: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userNotInLeaderboard, setUserNotInLeaderboard] = useState(false);
  const [userOutOfTop100, setUserOutOfTop100] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    void fetchLeaderboardData();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [view, currentMonth, currentUserId, currentPage]);

  useEffect(() => {
    calculateMonthlyData();
  }, [currentMonth, contributions]);

  useEffect(() => {
    filterLeaderboard();
  }, [searchQuery, leaderboardData]);

  // Reset to page 1 when view or month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [view, currentMonth]);

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
    const monthlyAura = calculateMonthlyAuraBreakdown(
      monthlyContributions,
      activeDays,
      monthEnd.getDate()
    ).totalAura;

    setMonthlyData({
      contributions: monthlyContributions,
      aura: monthlyAura,
      activeDays: activeDays,
    });
  };

  const fetchLeaderboardData = async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setUserNotInLeaderboard(false);
    setUserOutOfTop100(false);

    try {
      let response;

      if (view === "monthly") {
        // Fetch monthly leaderboard via API
        const params = new URLSearchParams({
          monthYear: currentMonth,
          page: currentPage.toString(),
          limit: "20",
          ...(currentUserId && { userId: currentUserId }),
        });

        response = await fetch(`/api/leaderboard/monthly?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
      } else {
        // Fetch all-time leaderboard via API
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
          ...(currentUserId && { userId: currentUserId }),
        });

        response = await fetch(`/api/leaderboard/alltime?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard (${response.status})`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setLeaderboardData(data.leaderboard || []);
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

      // Handle user rank - check if user exists in leaderboard
      if (currentUserId) {
        if (data.userRank && data.userRank > 0) {
          setUserRank(data.userRank);
          if (data.userRank > 100) {
            setUserOutOfTop100(true);
            setUserNotInLeaderboard(false);
          } else {
            setUserOutOfTop100(false);
            setUserNotInLeaderboard(false);
          }
        } else {
          // User not found in leaderboard - they haven't participated yet
          setUserRank(null);
          setUserNotInLeaderboard(true);
          setUserOutOfTop100(false);
        }
      } else {
        setUserRank(null);
        setUserNotInLeaderboard(false);
        setUserOutOfTop100(false);
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      console.error("❌ Error fetching leaderboard:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load leaderboard right now."
      );
      setLeaderboardData([]);
      setFilteredData([]);
      setUserRank(null);
      setUserNotInLeaderboard(false);
      setUserOutOfTop100(false);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void fetchLeaderboardData();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ViewToggle view={view} onViewChange={setView} />
          {view === "monthly" && (
            <MonthNavigation
              currentMonth={currentMonth}
              onMonthChange={navigateMonth}
            />
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find a developer…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
            aria-label="Search developers"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Current User Rank or Status */}
      {currentUserId &&
        (userRank && userRank > 0 && userRank <= 100 ? (
          <div className="rounded-md border border-link/30 bg-accent-subtle px-4 py-2.5 text-sm text-foreground">
            Your current rank:{" "}
            <span className="font-semibold tabular-nums">#{userRank}</span>
          </div>
        ) : userOutOfTop100 ? (
          <div className="rounded-md border border-attention/40 bg-attention-subtle px-4 py-2.5 text-sm text-foreground">
            You&apos;re currently ranked{" "}
            <span className="font-semibold tabular-nums">#{userRank}</span>,
            outside the top 100. Keep contributing consistently to climb up.
          </div>
        ) : userNotInLeaderboard ? (
          <div className="flex items-center gap-2 rounded-md border border-link/30 bg-accent-subtle px-4 py-2.5 text-sm text-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 text-link" />
            You haven&apos;t joined this {view === "monthly" ? "month's" : ""}{" "}
            leaderboard yet. Start contributing to get ranked!
          </div>
        ) : null)}

      {/* Leaderboard List */}
      <div className="gh-box overflow-hidden">
        <div className="gh-box-header py-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Top 100 developers
            </h2>
            {pagination.totalCount > 0 && (
              <span className="gh-counter tabular-nums">
                {pagination.totalCount}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {searchQuery
              ? `${filteredData.length} result${filteredData.length !== 1 ? "s" : ""}`
              : `Page ${pagination.currentPage} of ${pagination.totalPages}`}
          </span>
        </div>

        {filteredData.map((entry, index) => (
          <LeaderboardEntryRow
            key={`${entry.user.id}-${view}-${currentMonth}-${currentPage}`}
            entry={entry}
            index={index}
            view={view}
            currentMonth={currentMonth}
            currentPage={currentPage}
            highlighted={entry.user.id === currentUserId}
          />
        ))}

        {filteredData.length === 0 && (
          <div className="px-4 py-12 text-center">
            <Trophy className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery.trim()
                ? `No developers found matching "${searchQuery}"`
                : `No data available for this ${
                    view === "monthly" ? "month" : "period"
                  }.`}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={clearSearch}
                className="gh-link mt-2 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!searchQuery && pagination.totalPages > 1 && (
        <Pagination
          pagination={{ ...pagination, currentPage }}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Leaderboard;
