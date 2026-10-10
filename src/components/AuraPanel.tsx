"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  GitBranch,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateTotalAura } from "@/lib/aura";
import { calculateMonthlyAuraBreakdown } from "@/lib/aura-calculations";
import {
  calculateStreak,
  formatNumber,
  getAuraStatus,
  getCurrentMonthYear,
  getStreakMessage,
} from "@/lib/utils2";
import { GitHubContributions, Theme } from "./types";

export interface AllTimeBadge {
  name: string;
  icon: string;
  rarity?: string;
  month_year?: string;
  rank?: number;
}

export interface AllTimeEntry {
  rank: number | null;
  badges: AllTimeBadge[];
}

// One request per username per page session, shared by AuraPanel and the
// shareable profile card.
const allTimeEntryCache = new Map<string, Promise<AllTimeEntry | null>>();

export function fetchAllTimeEntry(username: string) {
  const key = username.toLowerCase();
  let pending = allTimeEntryCache.get(key);
  if (!pending) {
    pending = fetch(
      `/api/leaderboard/alltime?username=${encodeURIComponent(username)}&limit=1`
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data) =>
        data
          ? {
              rank: data.userRank ?? null,
              badges: (data.userEntry?.badges ?? []) as AllTimeBadge[],
            }
          : null
      )
      .catch(() => {
        allTimeEntryCache.delete(key);
        return null;
      });
    allTimeEntryCache.set(key, pending);
  }
  return pending;
}

/** Remove leading/trailing emoji (and variation selectors) from a message. */
export function stripEmoji(text: string) {
  return text
    .replace(/^[\s\p{Extended_Pictographic}\uFE0F\u200D]+/u, "")
    .replace(/[\s\p{Extended_Pictographic}\uFE0F\u200D]+$/u, "")
    .trim();
}

interface AuraPanelProps {
  selectedTheme: Theme;
  userAura: number;
  currentStreak: number;
  contributions: GitHubContributions;
  isCalculatingAura: boolean;
  /** GitHub username — used to look up the all-time leaderboard rank. */
  username?: string;
}

function calculateMonthlySnapshot(
  monthYear: string,
  contributions: GitHubContributions
) {
  const [year, month] = monthYear.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  let monthlyContributions = 0;
  let activeDays = 0;

  contributions.contributionDays.forEach((day) => {
    const dayDate = new Date(day.date);
    if (dayDate >= monthStart && dayDate <= monthEnd) {
      monthlyContributions += day.contributionCount;
      if (day.contributionCount > 0) {
        activeDays += 1;
      }
    }
  });

  const monthlyAura = calculateMonthlyAuraBreakdown(
    monthlyContributions,
    activeDays,
    monthEnd.getDate()
  ).totalAura;

  return {
    contributions: monthlyContributions,
    activeDays,
    aura: monthlyAura,
    daysInMonth: monthEnd.getDate(),
  };
}

function getMonthlyAuraStatus(monthlyAura: number) {
  if (monthlyAura >= 4000) {
    return { level: "Legendary", tone: "text-foreground" };
  }
  if (monthlyAura >= 2500) {
    return { level: "Elite", tone: "text-foreground" };
  }
  if (monthlyAura >= 1500) {
    return { level: "Strong", tone: "text-foreground" };
  }
  if (monthlyAura >= 700) {
    return { level: "Rising", tone: "text-muted-foreground" };
  }

  return { level: "Starting", tone: "text-muted-foreground" };
}

const AuraPanel: React.FC<AuraPanelProps> = ({
  selectedTheme,
  userAura,
  currentStreak,
  contributions,
  isCalculatingAura,
  username,
}) => {
  void selectedTheme;

  const { isSignedIn, user } = useUser();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [isSyncingManually, setIsSyncingManually] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (!username) {
      setRank(null);
      return;
    }

    let cancelled = false;
    fetchAllTimeEntry(username).then((entry) => {
      if (!cancelled) setRank(entry?.rank ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const fallbackTotalAura = useMemo(
    () =>
      userAura > 0
        ? userAura
        : calculateTotalAura(contributions.contributionDays),
    [contributions.contributionDays, userAura]
  );

  const fallbackCurrentStreak = useMemo(
    () =>
      currentStreak > 0
        ? currentStreak
        : calculateStreak(contributions.contributionDays),
    [contributions.contributionDays, currentStreak]
  );

  const monthlyData = useMemo(
    () => calculateMonthlySnapshot(currentMonth, contributions),
    [contributions, currentMonth]
  );

  const consistency = useMemo(() => {
    if (monthlyData.daysInMonth === 0) {
      return 0;
    }

    return Math.round((monthlyData.activeDays / monthlyData.daysInMonth) * 100);
  }, [monthlyData.activeDays, monthlyData.daysInMonth]);

  const auraStatus = useMemo(
    () => getAuraStatus(fallbackTotalAura),
    [fallbackTotalAura]
  );
  const streakStatus = useMemo(
    () => getStreakMessage(fallbackCurrentStreak),
    [fallbackCurrentStreak]
  );
  const monthlyAuraStatus = useMemo(
    () => getMonthlyAuraStatus(monthlyData.aura),
    [monthlyData.aura]
  );

  const formatMonthYear = useCallback((monthYear: string) => {
    const [year, month] = monthYear.split("-").map(Number);
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, []);

  const syncMonthlyAura = useCallback(async () => {
    if (!isSignedIn || !user || currentMonth !== getCurrentMonthYear()) {
      return;
    }

    await fetch("/api/save-monthly-aura", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monthYear: currentMonth,
        contributionsCount: monthlyData.contributions,
        activeDays: monthlyData.activeDays,
        allContributions: contributions.contributionDays,
      }),
    });
  }, [
    contributions.contributionDays,
    currentMonth,
    isSignedIn,
    monthlyData.activeDays,
    monthlyData.contributions,
    user,
  ]);

  const syncTotalAuraWithBackend = useCallback(async () => {
    if (!isSignedIn || !user || contributions.contributionDays.length === 0) {
      return;
    }

    const githubAccount = user.externalAccounts?.find(
      (account) => account.provider === "github"
    );

    if (!githubAccount?.username) {
      return;
    }

    await fetch("/api/save-user-aura", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        githubUsername: githubAccount.username,
        contributionDays: contributions.contributionDays,
      }),
    });
  }, [contributions.contributionDays, isSignedIn, user]);

  useEffect(() => {
    if (!isSignedIn || !user || contributions.contributionDays.length === 0) {
      return;
    }

    void syncMonthlyAura();
  }, [
    contributions.contributionDays.length,
    isSignedIn,
    syncMonthlyAura,
    user,
  ]);

  useEffect(() => {
    if (!isSignedIn || !user || contributions.contributionDays.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      void syncTotalAuraWithBackend();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [
    contributions.contributionDays.length,
    isSignedIn,
    syncTotalAuraWithBackend,
    user,
  ]);

  const handleManualSync = useCallback(async () => {
    if (!isSignedIn || !user || isSyncingManually || isCalculatingAura) {
      return;
    }

    setIsSyncingManually(true);
    try {
      await syncMonthlyAura();
      await syncTotalAuraWithBackend();
    } finally {
      setIsSyncingManually(false);
    }
  }, [
    isCalculatingAura,
    isSignedIn,
    isSyncingManually,
    syncMonthlyAura,
    syncTotalAuraWithBackend,
    user,
  ]);

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1);

    if (direction === "prev") {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    setCurrentMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
  }, [currentMonth]);

  return (
    <section className="gh-box">
      <div className="gh-box-header">
        <h2 className="text-sm font-semibold text-foreground">Aura overview</h2>
        <div className="flex items-center gap-2">
          {isCalculatingAura && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
              Calculating
            </span>
          )}
          {isSignedIn && user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncingManually || isCalculatingAura}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isSyncingManually ? "animate-spin" : ""
                }`}
              />
              {isSyncingManually ? "Syncing" : "Sync"}
            </Button>
          )}
        </div>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-px bg-border-muted sm:grid-cols-4">
        <StatCell
          icon={<Zap className="h-3.5 w-3.5" />}
          label="Total aura"
          value={formatNumber(fallbackTotalAura)}
        />
        <StatCell
          icon={<Trophy className="h-3.5 w-3.5" />}
          label="All-time rank"
          value={rank ? `#${rank.toLocaleString()}` : "—"}
        />
        <StatCell
          icon={<Flame className="h-3.5 w-3.5" />}
          label="Current streak"
          value={`${fallbackCurrentStreak} ${
            fallbackCurrentStreak === 1 ? "day" : "days"
          }`}
        />
        <StatCell
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Level"
          value={auraStatus.level}
        />
      </div>

      <div className="flex items-start gap-3 border-t border-border-muted bg-canvas-subtle px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm text-foreground">
            {stripEmoji(auraStatus.message)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {stripEmoji(streakStatus.message)}
          </p>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Monthly aura
          </h3>
          <span className="gh-label">{monthlyAuraStatus.level}</span>
        </div>

        <div className="inline-flex items-center rounded-md border border-border bg-canvas-subtle">
          <button
            onClick={() => navigateMonth("prev")}
            className="flex h-7 w-7 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex h-7 min-w-[120px] items-center justify-center border-x border-border bg-card px-2 text-xs font-medium text-foreground">
            {formatMonthYear(currentMonth)}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            disabled={currentMonth >= getCurrentMonthYear()}
            className="flex h-7 w-7 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-border-muted bg-border-muted sm:grid-cols-4">
        <StatCell
          icon={<Zap className="h-3.5 w-3.5" />}
          label="Monthly aura"
          value={formatNumber(monthlyData.aura)}
        />
        <StatCell
          icon={<GitBranch className="h-3.5 w-3.5" />}
          label="Contributions"
          value={monthlyData.contributions.toLocaleString()}
        />
        <StatCell
          icon={<Users className="h-3.5 w-3.5" />}
          label="Active days"
          value={`${monthlyData.activeDays} / ${monthlyData.daysInMonth}`}
        />
        <StatCell
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Consistency"
          value={`${consistency}%`}
        />
      </div>

      {!isSignedIn && (
        <div className="flex flex-col items-start gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Sign in to sync your Aura and monthly stats
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Logged-in users can persist rankings, badges, and monthly
              snapshots.
            </p>
          </div>
          <SignInButton mode="modal">
            <Button size="sm">Sign in to sync</Button>
          </SignInButton>
        </div>
      )}
    </section>
  );
};

function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 bg-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

export default AuraPanel;
