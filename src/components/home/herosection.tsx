"use client";

import { useMemo } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Analytics01Icon,
  ArrowRight01Icon,
  Award01Icon,
  GithubIcon,
  RankingIcon,
  Share08Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";

interface HeroStats {
  totalDevelopers: number;
  totalAuraPoints: number;
  totalBadges?: number;
  monthYear?: string;
  fallback?: boolean;
}

const quickNotes = [
  {
    title: "Quiet flex energy",
    text: "Your commits, streaks, and badges show up polished, not loud.",
    icon: SparklesIcon,
  },
  {
    title: "Leaderboard receipts",
    text: "Monthly and all-time rankings that read fast and actually feel premium.",
    icon: RankingIcon,
  },
  {
    title: "Shareables that hit",
    text: "Profile cards and battle exports that look clean enough to post without editing.",
    icon: Share08Icon,
  },
  {
    title: "Badges with aura",
    text: "Top placements look earned, not randomly tossed onto the screen.",
    icon: Award01Icon,
  },
];

async function fetchHeroStats(): Promise<HeroStats> {
  const response = await fetch("/api/stats/hero", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch hero stats");
  }

  return response.json();
}

export const HeroSection = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const heroStatsQuery = useQuery({
    queryKey: ["hero-stats"],
    queryFn: fetchHeroStats,
    staleTime: 5 * 60 * 1000,
  });

  const stats = heroStatsQuery.data ?? {
    totalDevelopers: 0,
    totalAuraPoints: 0,
    totalBadges: 0,
  };

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }

    return `${value}`;
  };

  const handleGoToProfile = () => {
    const githubAccount = user?.externalAccounts?.find(
      (account) => account.provider === "github"
    );

    if (githubAccount?.username) {
      router.push(`/${githubAccount.username}`);
      return;
    }

    router.push("/profile");
  };

  const statCards = useMemo(
    () => [
      {
        label: "Developers",
        value: heroStatsQuery.isLoading
          ? "..."
          : `${formatNumber(stats.totalDevelopers)}+`,
      },
      {
        label: "Aura tracked",
        value: heroStatsQuery.isLoading
          ? "..."
          : `${formatNumber(stats.totalAuraPoints)}+`,
      },
      {
        label: "Badges dropped",
        value: heroStatsQuery.isLoading
          ? "..."
          : `${formatNumber(stats.totalBadges || 0)}+`,
      },
    ],
    [heroStatsQuery.isLoading, stats.totalAuraPoints, stats.totalBadges, stats.totalDevelopers]
  );

  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(161,161,170,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(212,212,216,0.18),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(10,10,10,0.07),transparent_38%)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.06),transparent_20%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_36%)]" />
      <div className="absolute inset-x-6 top-28 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur">
            <HugeIcon icon={SparklesIcon} size={14} className="text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Clean flex for GitHub people
            </span>
          </div>

          <h1 className="max-w-3xl text-[2.45rem] font-semibold leading-[0.94] tracking-[-0.065em] text-foreground sm:text-[3.6rem] lg:text-[5rem]">
            Turn your GitHub into a quiet flex.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            GitAura gives your commits, streaks, badges, and rank movement main
            character energy without doing too much. It feels sharp, calm, and
            lowkey expensive.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isSignedIn ? (
              <Button
                size="lg"
                onClick={handleGoToProfile}
                className="h-11 rounded-full px-5 text-sm font-semibold"
              >
                <HugeIcon icon={GithubIcon} size={16} />
                Open my aura
                <HugeIcon icon={ArrowRight01Icon} size={16} />
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="h-11 rounded-full px-5 text-sm font-semibold"
                >
                  <HugeIcon icon={GithubIcon} size={16} />
                  Plug in GitHub
                  <HugeIcon icon={ArrowRight01Icon} size={16} />
                </Button>
              </SignInButton>
            )}

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/leaderboard")}
              className="h-11 rounded-full px-5 text-sm font-semibold"
            >
              <HugeIcon icon={RankingIcon} size={16} />
              See who’s up
            </Button>
          </div>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {statCards.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.35rem] border border-border bg-card/90 px-4 py-3 shadow-sm backdrop-blur"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2.4rem] bg-gradient-to-b from-foreground/6 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.2rem] border border-border bg-card/95 p-4 shadow-[0_30px_90px_-36px_rgba(0,0,0,0.24)] backdrop-blur sm:p-5">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Live preview
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">
                  Not loud. Just dangerously clean.
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5">
                <HugeIcon
                  icon={Analytics01Icon}
                  size={14}
                  className="text-primary"
                />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {stats.monthYear || "Live data"}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {quickNotes.map((note, index) => (
                <div
                  key={note.title}
                  className={`rounded-[1.45rem] border border-border bg-background/90 px-4 py-3 ${
                    index === 0
                      ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(245,245,245,0.88))] dark:bg-[linear-gradient(135deg,rgba(23,23,23,0.92),rgba(10,10,10,0.88))]"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground">
                      <HugeIcon icon={note.icon} size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold tracking-[-0.02em] text-foreground">
                        {note.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {note.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-[1.6rem] border border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(245,245,245,0.82))] px-4 py-4 dark:bg-[linear-gradient(135deg,rgba(23,23,23,0.92),rgba(10,10,10,0.9))]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Signature vibe
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Looks premium. Still feels effortless.
                    </p>
                  </div>
                  <div className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    zero template energy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
