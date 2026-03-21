import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clampMonthYearToLaunch, LEADERBOARD_LAUNCH_MONTH } from "@/lib/leaderboard";
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

function buildLeaderboardApiUrl(
  view: ViewType,
  currentMonth: string,
  highlightedUsername?: string
) {
  const params = new URLSearchParams({
    page: "1",
    limit: String(MAX_ENTRIES),
  });

  if (highlightedUsername) {
    params.set("username", highlightedUsername);
  }

  if (view === "monthly") {
    params.set("monthYear", currentMonth);
    return `/api/leaderboard/monthly?${params.toString()}`;
  }

  return `/api/leaderboard/alltime?${params.toString()}`;
}

function normalizeLeaderboardEntry(
  entry?: Partial<LeaderboardEntry> | null
): LeaderboardEntry | null {
  if (!entry?.user?.id || !entry.user.github_username) {
    return null;
  }

  return {
    ...entry,
    rank: entry.rank || 0,
    aura: entry.aura ?? 0,
    contributions: entry.contributions,
    badges: Array.isArray(entry.badges) ? entry.badges : [],
    user: {
      ...entry.user,
      display_name: entry.user.display_name || entry.user.github_username,
      avatar_url: entry.user.avatar_url || "",
      total_aura: entry.user.total_aura ?? entry.aura ?? 0,
      current_streak: entry.user.current_streak ?? 0,
    },
  };
}

function normalizeLeaderboardEntries(
  data?: Partial<LeaderboardResponse>
): LeaderboardEntry[] {
  if (!Array.isArray(data?.leaderboard)) {
    return [];
  }

  return data.leaderboard
    .filter((entry): entry is LeaderboardEntry => Boolean(entry?.user?.id))
    .map((entry, index) => ({
      ...entry,
      rank: entry.rank || index + 1,
      aura: entry.aura ?? 0,
      badges: Array.isArray(entry.badges) ? entry.badges : [],
    }))
    .slice(0, MAX_ENTRIES);
}

export function CustomLeaderboard({ username }: CustomLeaderboardProps) {
  const { isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewType>(username ? "monthly" : "alltime");
  const [currentMonth, setCurrentMonth] = useState(
    clampMonthYearToLaunch(getCurrentMonthYear())
  );
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [isRefreshingCurrentUser, setIsRefreshingCurrentUser] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const refreshedMonthKeyRef = useRef<string | null>(null);

  const loadMore = useCallback(() => {
    setDisplayCount((previousCount) =>
      Math.min(previousCount + PAGE_SIZE, MAX_ENTRIES)
    );
  }, []);

  const signedInGithubUsername = useMemo(
    () =>
      user?.externalAccounts?.find((account) => account.provider === "github")
        ?.username || "",
    [user]
  );

  const highlightedUsername = useMemo(
    () => username || signedInGithubUsername,
    [signedInGithubUsername, username]
  );

  useEffect(() => {
    setView(username ? "monthly" : "alltime");
  }, [username]);

  const leaderboardQuery = useQuery<
    Partial<LeaderboardResponse> & { error?: string }
  >({
    queryKey: ["leaderboard", view, currentMonth],
    placeholderData: (previousData) => previousData,
    queryFn: async ({ signal }) => {
      const response = await fetch(
        buildLeaderboardApiUrl(view, currentMonth, highlightedUsername),
        {
          signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard (${response.status})`);
      }

      const data = (await response.json()) as Partial<LeaderboardResponse> & {
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
  });

  const leaderboardData = useMemo(
    () => normalizeLeaderboardEntries(leaderboardQuery.data),
    [leaderboardQuery.data]
  );

  const currentUser = useMemo(() => {
    const exactUserEntry = normalizeLeaderboardEntry(leaderboardQuery.data?.userEntry);

    if (exactUserEntry) {
      return exactUserEntry;
    }

    if (!highlightedUsername) {
      return null;
    }

    return (
      leaderboardData.find(
        (entry) =>
          entry.user.github_username.toLowerCase() ===
          highlightedUsername.toLowerCase()
      ) || null
    );
  }, [highlightedUsername, leaderboardData, leaderboardQuery.data?.userEntry]);

  const userOutOfTop100 = Boolean(currentUser && currentUser.rank > MAX_ENTRIES);

  const errorMessage = useMemo(() => {
    if (!leaderboardQuery.error) {
      return null;
    }

    return leaderboardQuery.error instanceof Error
      ? leaderboardQuery.error.message
      : "Unable to load leaderboard right now.";
  }, [leaderboardQuery.error]);

  useEffect(() => {
    setDisplayCount(
      leaderboardData.length === 0
        ? 0
        : Math.min(PAGE_SIZE, leaderboardData.length)
    );
  }, [leaderboardData.length, view, currentMonth]);

  useEffect(() => {
    const isCurrentMonth = currentMonth === getCurrentMonthYear();
    const shouldRefreshCurrentUser =
      isSignedIn &&
      Boolean(signedInGithubUsername) &&
      highlightedUsername.toLowerCase() === signedInGithubUsername.toLowerCase();

    if (view !== "monthly" || !isCurrentMonth || !shouldRefreshCurrentUser) {
      return;
    }

    const refreshKey = `${signedInGithubUsername}:${currentMonth}`;
    if (refreshedMonthKeyRef.current === refreshKey) {
      return;
    }

    refreshedMonthKeyRef.current = refreshKey;
    let cancelled = false;

    const refreshCurrentUserAura = async () => {
      setIsRefreshingCurrentUser(true);

      try {
        const response = await fetch("/api/refresh-user-aura", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: signedInGithubUsername,
          }),
        });

        if (!response.ok) {
          const refreshError = await response
            .json()
            .catch(() => ({ error: "Unknown refresh error" }));

          console.warn("Skipping leaderboard aura refresh:", {
            status: response.status,
            error: refreshError.error,
            details: refreshError.details,
          });
          return;
        }

        if (!cancelled) {
          await queryClient.invalidateQueries({
            queryKey: ["leaderboard", "monthly", currentMonth],
          });
        }
      } catch (error) {
        console.error("Error refreshing current user aura:", error);
      } finally {
        if (!cancelled) {
          setIsRefreshingCurrentUser(false);
        }
      }
    };

    void refreshCurrentUserAura();

    return () => {
      cancelled = true;
    };
  }, [
    currentMonth,
    highlightedUsername,
    isSignedIn,
    queryClient,
    signedInGithubUsername,
    view,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !leaderboardQuery.isPending &&
          !errorMessage &&
          displayCount < leaderboardData.length
        ) {
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
  }, [
    displayCount,
    errorMessage,
    leaderboardData.length,
    leaderboardQuery.isPending,
    loadMore,
  ]);

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

    const nextMonth = `${newYear}-${newMonth.toString().padStart(2, "0")}`;
    setCurrentMonth(clampMonthYearToLaunch(nextMonth));
  };

  if (leaderboardQuery.isPending && leaderboardData.length === 0) {
    return <LoadingState />;
  }

  if (errorMessage && leaderboardData.length === 0) {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => {
          void leaderboardQuery.refetch();
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
          {isRefreshingCurrentUser ? (
            <p className="text-[11px] text-muted-foreground">
              Syncing your latest GitHub month so Aura stays honest.
            </p>
          ) : null}
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
            <div key={`${view}-${currentMonth}`} className="space-y-3">
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
            </div>

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
