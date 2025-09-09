import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { AnimatePresence } from "framer-motion";
import { getCurrentMonthYear, createItemData, LEADERBOARD_ITEM_HEIGHT, saveScrollPosition, restoreScrollPosition } from "@/lib/utils2";
import { ViewType, LeaderboardEntry } from "./types";
import { ViewToggle } from "./ViewToggle";
import { MonthNavigation } from "./MonthNavigation";
import { UserCard } from "./UserCard";
import { VirtualizedLeaderboardEntry } from "./VirtualizedLeaderboardEntry";
import { PerformanceIndicator } from "./PerformanceIndicator";
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
  const [displayCount, setDisplayCount] = useState(1000); // Increase for virtual scrolling

  // Virtual scrolling refs
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll position management
  const scrollKey = useMemo(() => `leaderboard-${view}-${currentMonth}-${username}`, [view, currentMonth, username]);

  // Save scroll position when component unmounts or data changes
  const handleScroll = useCallback((scrollTop: number) => {
    saveScrollPosition(scrollKey, scrollTop);
  }, [scrollKey]);

  // Restore scroll position after data loads
  useEffect(() => {
    if (!loading && leaderboardData.length > 0 && listRef.current) {
      const savedPosition = restoreScrollPosition(scrollKey);
      if (savedPosition > 0) {
        listRef.current.scrollTo(savedPosition);
      }
    }
  }, [loading, leaderboardData.length, scrollKey]);

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
        // For global leaderboard, show all data (virtual scrolling handles performance)
        setLeaderboardData(sortedLeaderboard);
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

  // Memoized item data for virtual scrolling
  const itemData = useMemo(() => 
    createItemData(leaderboardData, {
      view,
      currentMonth,
      currentPage: 1,
    }), [leaderboardData, view, currentMonth]);

  // Dynamic container height with resize handling
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Calculate container height with mobile responsiveness
  const containerHeight = useMemo(() => {
    if (windowDimensions.height === 0) return 600;
    
    // Mobile-first responsive height calculation
    const isMobile = windowDimensions.width < 768;
    const baseOffset = isMobile ? 150 : 200;
    const maxHeight = isMobile ? 500 : 600;
    
    return Math.min(maxHeight, windowDimensions.height - baseOffset);
  }, [windowDimensions]);

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
            Developers Leaderboard
          </h3>
          <div className="text-[11px] sm:text-xs text-muted-foreground">
            {leaderboardData.length} total developers
          </div>
        </div>

        {/* Performance Indicator */}
        {leaderboardData.length > 50 && (
          <div className="mb-3">
            <PerformanceIndicator 
              itemCount={leaderboardData.length} 
              isVirtualized={true} 
            />
          </div>
        )}
        
        {/* Virtual Scrolling Container */}
        <div 
          ref={containerRef}
          className="rounded-lg border border-border/50 bg-card/20 backdrop-blur supports-backdrop-blur:backdrop-blur-md"
        >
          <List
            ref={listRef}
            height={containerHeight}
            itemCount={leaderboardData.length}
            itemSize={LEADERBOARD_ITEM_HEIGHT}
            itemData={itemData}
            onScroll={({ scrollTop }) => handleScroll(scrollTop)}
            overscanCount={5}
            className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/30 hover:scrollbar-thumb-border/50"
          >
            {VirtualizedLeaderboardEntry}
          </List>
        </div>
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
