import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clampMonthYearToLaunch } from "@/lib/leaderboard";
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
  title?: string;
  description?: string;
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

export function CustomLeaderboard({
  username,
  title = "Leaderboard",
  description,
}: CustomLeaderboardProps) {
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

  const isInitialLoading =
    leaderboardQuery.isPending && leaderboardData.length === 0;
  const showError = Boolean(errorMessage) && leaderboardData.length === 0;

  let body: ReactNode;

  if (isInitialLoading) {
    body = <LoadingState />;
  } else if (showError) {
    body = (
      <ErrorState
        message={errorMessage as string}
        onRetry={() => {
          void leaderboardQuery.refetch();
        }}
      />
    );
  } else {
    body = (
      <div className="space-y-4">
        {currentUser ? (
          <UserCard
            currentUser={currentUser}
            userOutOfTop100={userOutOfTop100}
            username={username}
          />
        ) : null}

        <div className="gh-box overflow-hidden">
          <div className="gh-box-header py-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Top 100 developers
              </h2>
              <span className="gh-counter tabular-nums">
                {leaderboardData.length}
              </span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {leaderboardQuery.isFetching ? (
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-border border-t-muted-foreground align-[-2px]" />
              ) : null}
              Showing {displayedData.length} of {leaderboardData.length}
            </span>
          </div>

          {leaderboardData.length === 0 ? (
            <EmptyState view={view} />
          ) : (
            <div key={`${view}-${currentMonth}`}>
              {displayedData.map((entry, index) => (
                <LeaderboardEntryComponent
                  key={`${entry.user.id}-${view}-${currentMonth}`}
                  entry={entry}
                  index={index}
                  view={view}
                  currentMonth={currentMonth}
                  currentPage={1}
                  highlighted={
                    Boolean(highlightedUsername) &&
                    entry.user.github_username.toLowerCase() ===
                      highlightedUsername.toLowerCase()
                  }
                />
              ))}
            </div>
          )}

          {leaderboardData.length > 0 && displayCount < leaderboardData.length ? (
            <div
              ref={observerTarget}
              className="flex h-12 items-center justify-center border-t border-border-muted"
              aria-hidden="true"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-muted-foreground" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
          {isRefreshingCurrentUser ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Syncing your latest GitHub activity…
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto">
          <ViewToggle view={view} onViewChange={setView} />
          {view === "monthly" ? (
            <MonthNavigation
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
            />
          ) : null}
        </div>
      </div>

      {body}
    </div>
  );
}
