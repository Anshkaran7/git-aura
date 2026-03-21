import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getCurrentMonthYear } from "@/lib/utils2";
import { ViewType, LeaderboardEntry, LeaderboardResponse } from "./types";
import { ViewToggle } from "./ViewToggle";
import { MonthNavigation } from "./MonthNavigation";
import { UserCard } from "./UserCard";
import { LeaderboardEntry as LeaderboardEntryComponent } from "./LeaderboardEntry";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface CustomLeaderboardProps {
  username: string;
}

const MAX_ENTRIES = 100;
const PAGE_SIZE = 20;

export function CustomLeaderboard({ username }: CustomLeaderboardProps) {
  const [view, setView] = useState<ViewType>(username ? "monthly" : "alltime");
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [userOutOfTop100, setUserOutOfTop100] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const observerTarget = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const loadMore = useCallback(() => {
    setDisplayCount((previousCount) =>
      Math.min(previousCount + PAGE_SIZE, MAX_ENTRIES)
    );
  }, []);

  useEffect(() => {
    setView(username ? "monthly" : "alltime");
  }, [username]);

  const fetchLeaderboardData = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setUserOutOfTop100(false);
    setCurrentUser(null);

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: String(MAX_ENTRIES),
      });

      let apiUrl = "/api/leaderboard/alltime";

      if (view === "monthly") {
        params.set("monthYear", currentMonth);
        apiUrl = `/api/leaderboard/monthly?${params.toString()}`;
      } else {
        apiUrl = `/api/leaderboard/alltime?${params.toString()}`;
      }

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard (${response.status})`);
      }

      const data = (await response.json()) as Partial<LeaderboardResponse> & {
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      const entries = Array.isArray(data.leaderboard) ? data.leaderboard : [];
      const normalizedEntries = entries
        .filter((entry): entry is LeaderboardEntry => Boolean(entry?.user?.id))
        .map((entry, index) => ({
          ...entry,
          rank: entry.rank || index + 1,
          aura: entry.aura ?? 0,
          badges: Array.isArray(entry.badges) ? entry.badges : [],
        }));

      const visibleEntries = normalizedEntries.slice(0, MAX_ENTRIES);
      const matchedUser = username
        ? normalizedEntries.find(
            (entry) =>
              entry.user.github_username.toLowerCase() === username.toLowerCase()
          ) || null
        : null;

      setCurrentUser(matchedUser);
      setUserOutOfTop100(Boolean(matchedUser && matchedUser.rank > MAX_ENTRIES));
      setLeaderboardData(visibleEntries);
      setDisplayCount(
        visibleEntries.length === 0
          ? 0
          : Math.min(PAGE_SIZE, visibleEntries.length)
      );
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load leaderboard right now.";

      setError(message);
      setLeaderboardData([]);
      setCurrentUser(null);
      setUserOutOfTop100(false);
      setDisplayCount(PAGE_SIZE);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currentMonth, username, view]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && !error && displayCount < leaderboardData.length) {
          loadMore();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.15 }
    );

    const currentTarget = observerTarget.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [displayCount, error, leaderboardData.length, loadMore, loading]);

  useEffect(() => {
    void fetchLeaderboardData();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchLeaderboardData]);

  const displayedData = useMemo(
    () => leaderboardData.slice(0, displayCount),
    [displayCount, leaderboardData]
  );

  const handleMonthChange = (direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-").map(Number);
    let newYear = year;
    let newMonth = month;

    if (direction === "prev") {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }

    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, "0")}`);
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
      <div className="flex flex-col items-start justify-between gap-3 rounded-3xl border border-border/70 bg-background/75 p-4 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Leaderboard pulse</h3>
          <p className="text-xs leading-5 text-muted-foreground">
            Sharper rankings, lighter typography, and cleaner monthly or all-time snapshots.
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <ViewToggle view={view} onViewChange={setView} />
          {view === "monthly" ? (
            <MonthNavigation
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
            />
          ) : null}
        </div>
      </div>

      {currentUser ? (
        <UserCard
          currentUser={currentUser}
          userOutOfTop100={userOutOfTop100}
          username={username}
        />
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Top 100 Developers
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Showing {displayedData.length} of {leaderboardData.length}
          </p>
        </div>

        {leaderboardData.length === 0 ? (
          <EmptyState view={view} />
        ) : (
          <>
            <AnimatePresence initial={false}>
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

            {displayCount < leaderboardData.length ? (
              <div
                ref={observerTarget}
                className="flex h-10 items-center justify-center"
                aria-hidden="true"
              >
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
