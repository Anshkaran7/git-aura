import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { getCurrentMonthYear } from "@/lib/utils2";
import { ViewType, LeaderboardEntry } from "./types";
import { ViewToggle } from "./ViewToggle";
import { MonthNavigation } from "./MonthNavigation";
import { UserCard } from "./UserCard";
import { LeaderboardEntry as LeaderboardEntryComponent } from "./LeaderboardEntry";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { LeaderboardSkeleton } from "../skeletons/LeaderboardSkeleton";
import { motion } from "framer-motion";

interface CustomLeaderboardProps {
  username: string;
}

export function CustomLeaderboard({ username }: CustomLeaderboardProps) {
  // Set default view to "alltime" when no username (global leaderboard)
  const [view, setView] = useState<ViewType>(username ? "monthly" : "alltime");
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [userOutOfTop100, setUserOutOfTop100] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);

  // Intersection Observer for infinite scrolling
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + 20, 100)); // Max 100 users
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && displayCount < 100) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, loadMore, displayCount]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [view, currentMonth, username]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setUserOutOfTop100(false);
    try {
      let response;
      let apiUrl = "";

      if (view === "monthly") {
        const params = new URLSearchParams({
          monthYear: currentMonth,
          // Don't filter by username - we want to see all users in the leaderboard
          // The username is only used for highlighting the specific user
        });
        apiUrl = `/api/leaderboard/monthly?${params}`;
      } else {
        // For alltime view, don't pass username filter - show all users
        apiUrl = `/api/leaderboard/alltime`;
      }

      response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();

      // Sort leaderboard by aura points and assign ranks
      const sortedLeaderboard = data.leaderboard.map(
        (entry: LeaderboardEntry, index: number) => ({
          ...entry,
          rank: index + 1, // Ensure rank is assigned
        })
      );

      // Find current user in the full leaderboard
      if (username) {
        const userEntry = sortedLeaderboard.find(
          (entry: LeaderboardEntry) =>
            entry.user.github_username.toLowerCase() === username.toLowerCase()
        );

        if (userEntry) {
          setCurrentUser(userEntry);
          // Check if user is out of top 100
          if (userEntry.rank > 100) {
            setUserOutOfTop100(true);
            // Only show top 100 in leaderboard
            setLeaderboardData(sortedLeaderboard.slice(0, 100));
          } else {
            setUserOutOfTop100(false);
            setLeaderboardData(sortedLeaderboard);
          }
        } else {
          setLeaderboardData(sortedLeaderboard);
        }
      } else {
        // For global leaderboard, only show top 100
        setLeaderboardData(sortedLeaderboard.slice(0, 100));
      }

      // Update pagination info
      setDisplayCount(Math.min(sortedLeaderboard.length, 100));
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <LeaderboardSkeleton count={20} />
      </motion.div>
    );
  }

  const displayedData = leaderboardData.slice(0, displayCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-3 sm:space-y-4"
    >
      {/* View Toggle and Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 sticky top-16 z-10 bg-background/70 backdrop-blur supports-backdrop-blur:backdrop-blur-md rounded-lg p-2 border border-border/50"
      >
        <ViewToggle view={view} onViewChange={setView} />
        {view === "monthly" && username && (
          <MonthNavigation
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        )}
      </motion.div>

      {/* Current User Card */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <UserCard
            currentUser={currentUser}
            userOutOfTop100={userOutOfTop100}
            username={username}
          />
        </motion.div>
      )}

      {/* Leaderboard Entries */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-1.5 sm:space-y-2"
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            Top 100 Developers
          </h3>
          <div className="text-[11px] sm:text-xs text-muted-foreground">
            {leaderboardData.length} total • showing {displayedData.length}
          </div>
        </div>
        <AnimatePresence>
          {displayedData.map((entry, index) => (
            <LeaderboardEntryComponent
              key={`${entry.user.id}-${view}-${currentMonth}`}
              entry={entry}
              index={index}
              view={view}
              currentMonth={currentMonth}
              currentPage={1}
            />
          ))}
        </AnimatePresence>

        {/* Infinite Scroll Observer */}
        {displayedData.length < leaderboardData.length &&
          displayedData.length < 100 && (
            <div
              ref={observerTarget}
              className="h-10 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs">Loading more…</span>
              </div>
            </div>
          )}
      </motion.div>

      {/* Empty State */}
      {leaderboardData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyState view={view} />
        </motion.div>
      )}
    </motion.div>
  );
}
