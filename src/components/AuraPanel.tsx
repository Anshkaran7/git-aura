"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  RefreshCw,
  TrendingUp,
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

interface AuraPanelProps {
  selectedTheme: Theme;
  userAura: number;
  currentStreak: number;
  contributions: GitHubContributions;
  isCalculatingAura: boolean;
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
}) => {
  void selectedTheme;

  const { isSignedIn, user } = useUser();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [isSyncingManually, setIsSyncingManually] = useState(false);

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
    <section className="mt-6 rounded-[28px] border border-border bg-card/85 p-4 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.45)] sm:p-6">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Aura analysis
          </p>
          <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Performance overview
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isCalculatingAura && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
              Calculating
            </div>
          )}

          {isSignedIn && user && (
            <button
              onClick={handleManualSync}
              disabled={isSyncingManually || isCalculatingAura}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isSyncingManually ? "animate-spin" : ""
                }`}
              />
              {isSyncingManually ? "Syncing" : "Sync"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Monthly breakdown
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-background p-1">
          <button
            onClick={() => navigateMonth("prev")}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[132px] text-center text-xs font-medium text-foreground">
            {formatMonthYear(currentMonth)}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            disabled={currentMonth >= getCurrentMonthYear()}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-[24px] border border-border bg-background p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {monthlyAuraStatus.level}
          </p>
          <h4 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {formatNumber(monthlyData.aura)}
          </h4>
          <p className={`mt-2 text-sm ${monthlyAuraStatus.tone}`}>
            Monthly Aura for {formatMonthYear(currentMonth)}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GitBranch className="h-3.5 w-3.5" />
                Contributions
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {monthlyData.contributions.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Active days
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {monthlyData.activeDays}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-background p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Overall standing
          </p>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-xl">
              {auraStatus.emoji}
            </div>
            <div>
              <h4 className={`text-lg font-semibold ${auraStatus.color}`}>
                {auraStatus.level}
              </h4>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {auraStatus.message}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                Total Aura
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatNumber(fallbackTotalAura)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Streak
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {fallbackCurrentStreak} days
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Consistency
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {consistency}%
              </p>
            </div>
          </div>

          <p className={`mt-4 text-xs ${streakStatus.color}`}>
            {streakStatus.emoji} {fallbackCurrentStreak}-day streak
          </p>
        </div>
      </div>

      {!isSignedIn && (
        <div className="mt-4 rounded-[24px] border border-dashed border-border bg-background p-5 text-center">
          <p className="text-sm font-medium text-foreground">
            Sign in to sync your Aura and monthly stats.
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Logged-in users can persist rankings, badges, and up-to-date monthly
            snapshots.
          </p>
          <div className="mt-4">
            <SignInButton mode="modal">
              <Button>Sign in to sync</Button>
            </SignInButton>
          </div>
        </div>
      )}
    </section>
  );
};

export default AuraPanel;
