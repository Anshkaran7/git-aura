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

interface CustomLeaderboardProps {
  username: string;
}

export function CustomLeaderboard({ username }: CustomLeaderboardProps) {
  const [view, setView] = useState<ViewType>("monthly");
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
    setDisplayCount((prev) => prev + 20);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, loadMore]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [view, currentMonth, username]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setUserOutOfTop100(false);
    try {
      let response;

      if (view === "monthly") {
        const params = new URLSearchParams({
          monthYear: currentMonth,
        });
        response = await fetch(`/api/leaderboard/monthly?${params}`);
      } else {
        response = await fetch(`/api/leaderboard/alltime`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();

      // Sort leaderboard by aura points
      const sortedLeaderboard = [...data.leaderboard].sort((a, b) => {
        // Primary sort by aura
        if (b.aura !== a.aura) return b.aura - a.aura;
        // Secondary sort by contributions if available
        if (a.contributions && b.contributions) {
          return b.contributions - a.contributions;
        }
        // Tertiary sort by streak
        return b.user.current_streak - a.user.current_streak;
      });

      // Assign ranks based on sorted order
      const rankedLeaderboard = sortedLeaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      // Only look for current user if username is provided
      if (username) {
        // Find current user in the full leaderboard
        const userEntry = rankedLeaderboard.find(
          (entry) =>
            entry.user.github_username.toLowerCase() === username.toLowerCase()
        );

        if (userEntry) {
          setCurrentUser(userEntry);
          // Remove user from main leaderboard to show separately
          const filteredLeaderboard = rankedLeaderboard.filter(
            (entry) =>
              entry.user.github_username.toLowerCase() !==
              username.toLowerCase()
          );
          setLeaderboardData(filteredLeaderboard);
        } else {
          // If user not found in leaderboard, show all entries
          setLeaderboardData(rankedLeaderboard);
        }
      } else {
        // If no username provided, show all entries
        setLeaderboardData(rankedLeaderboard);
      }
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
    return <LoadingState />;
  }

  const displayedData = leaderboardData.slice(0, displayCount);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Toggle and Month Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <ViewToggle view={view} onViewChange={setView} />
        {view === "monthly" && (
          <MonthNavigation
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        )}
      </div>

      {/* Current User Card */}
      {currentUser && (
        <UserCard
          currentUser={currentUser}
          userOutOfTop100={userOutOfTop100}
          username={username}
        />
      )}

      {/* Leaderboard Entries */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
          {username
            ? currentUser
              ? "Other Developers"
              : "All Developers"
            : "All Developers"}
        </h3>
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
        {displayedData.length < leaderboardData.length && (
          <div
            ref={observerTarget}
            className="h-10 flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#39d353]"></div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {leaderboardData.length === 0 && <EmptyState view={view} />}
    </div>
  );
}
