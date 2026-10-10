"use client";

import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  CalendarDays,
  ChevronRight,
  Flame,
  GitPullRequest,
  Github,
  MapPin,
  Medal,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroStats {
  totalDevelopers: number;
  totalAuraPoints: number;
  totalBadges?: number;
  totalMonthlyContributions?: number;
}

async function fetchHeroStats(): Promise<HeroStats> {
  const response = await fetch("/api/stats/hero", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch hero stats");
  }

  return response.json();
}

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
};

// Deterministic pseudo-random contribution levels for the preview graph
const PREVIEW_WEEKS = 52;
const previewLevels = Array.from({ length: PREVIEW_WEEKS * 7 }, (_, i) => {
  const n = Math.sin(i * 12.9898) * 43758.5453;
  const r = n - Math.floor(n);
  const week = Math.floor(i / 7);
  const boost = week > 38 ? 0.18 : 0; // ramp up recent activity
  const v = r + boost;
  if (v < 0.35) return 0;
  if (v < 0.6) return 1;
  if (v < 0.8) return 2;
  if (v < 0.93) return 3;
  return 4;
});

export const HeroSection = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const heroStatsQuery = useQuery({
    queryKey: ["hero-stats"],
    queryFn: fetchHeroStats,
    staleTime: 5 * 60 * 1000,
  });

  const stats = heroStatsQuery.data;

  const handleGoToProfile = () => {
    const githubAccount = user?.externalAccounts?.find(
      (account) => account.provider === "github"
    );

    router.push(githubAccount?.username ? `/${githubAccount.username}` : "/sign-in");
  };

  return (
    <section className="border-b border-border px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Link
            href="/monthly-winners"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 text-xs text-muted-foreground transition-colors hover:border-border-strong"
          >
            <span className="rounded-full bg-accent-subtle px-2 py-0.5 font-medium text-link">
              New
            </span>
            Monthly winners are in
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Your GitHub activity,
            <br className="hidden sm:block" /> scored and ranked.
          </h1>

          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            GitAura turns your contributions into an aura score, streaks and
            badges — then puts you on a global leaderboard with everyone else.
          </p>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            {isSignedIn ? (
              <Button size="lg" onClick={handleGoToProfile}>
                <Github />
                Open your profile
                <ArrowRight />
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button size="lg">
                  <Github />
                  Sign in with GitHub
                  <ArrowRight />
                </Button>
              </SignInButton>
            )}

            <Button size="lg" variant="outline" asChild>
              <Link href="/leaderboard">
                <Trophy />
                View leaderboard
              </Link>
            </Button>
          </div>

          <dl className="mt-10 grid w-full max-w-lg grid-cols-3 divide-x divide-border rounded-md border border-border">
            {[
              { label: "Developers", value: stats?.totalDevelopers },
              { label: "Aura earned", value: stats?.totalAuraPoints },
              { label: "Badges awarded", value: stats?.totalBadges },
            ].map((item) => (
              <div key={item.label} className="px-3 py-3">
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {typeof item.value === "number" ? (
                    formatNumber(item.value)
                  ) : (
                    <span className="mx-auto block h-6 w-12 animate-pulse rounded bg-accent" />
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ProfilePreview />
      </div>
    </section>
  );
};

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

function ProfilePreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl" aria-hidden="true">
      <div className="overflow-hidden rounded-md border border-border bg-background gh-shadow">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-canvas-subtle px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="ml-3 min-w-0 truncate rounded-md border border-border bg-background px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
            git-aura.karandev.in/octocat
          </span>
        </div>

        {/* Profile tabs */}
        <div className="flex gap-1 overflow-hidden border-b border-border px-4 text-sm md:pl-[236px]">
          {[
            { label: "Overview", icon: BookMarked, active: true },
            { label: "Aura", icon: Zap, count: "4.9K" },
            { label: "Badges", icon: Medal, count: "6" },
            { label: "Battles", icon: GitPullRequest, count: "12" },
          ].map(({ label, icon: Icon, active, count }) => (
            <span
              key={label}
              className={`relative flex shrink-0 items-center gap-2 px-2 py-3 ${
                active
                  ? "font-semibold text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[#fd8c73]"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
              {count && <span className="gh-counter">{count}</span>}
            </span>
          ))}
        </div>

        <div className="grid gap-6 p-4 text-left sm:p-6 md:grid-cols-[200px_1fr]">
          {/* Profile column */}
          <div className="flex items-start gap-4 md:-mt-14 md:flex-col md:gap-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-canvas-subtle md:h-[200px] md:w-[200px]">
              <Github className="h-8 w-8 text-foreground md:h-24 md:w-24" strokeWidth={1.25} />
            </div>
            <div className="min-w-0 md:mt-4">
              <p className="text-xl font-semibold leading-tight text-foreground">The Octocat</p>
              <p className="text-lg font-light leading-tight text-muted-foreground">octocat</p>
              <div className="mt-3 hidden h-8 items-center justify-center rounded-md border border-border bg-canvas-subtle text-sm font-medium text-foreground md:flex">
                Share profile
              </div>
              <ul className="mt-3 hidden space-y-1 text-sm text-muted-foreground md:block">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> San Francisco
                </li>
                <li className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Joined 2011
                </li>
              </ul>
            </div>
          </div>

          {/* Main column */}
          <div className="min-w-0 space-y-4">
            <div className="grid grid-cols-2 overflow-hidden rounded-md border border-border sm:grid-cols-4">
              <PreviewStat label="Aura" value="4,892" />
              <PreviewStat
                label="Global rank"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    #24
                    <span className="inline-flex items-center text-xs font-medium text-success">
                      <ArrowUpRight className="h-3.5 w-3.5" />6
                    </span>
                  </span>
                }
              />
              <PreviewStat
                label="Streak"
                value={
                  <span className="inline-flex items-center gap-1">
                    18
                    <span className="text-sm font-normal text-muted-foreground">days</span>
                    <Flame className="h-4 w-4 text-bronze" />
                  </span>
                }
              />
              <PreviewStat label="This month" value="+346" />
            </div>

            <div>
              <p className="mb-2 text-base text-foreground">
                1,284 contributions in the last year
              </p>
              <div className="rounded-md border border-border p-3 sm:p-4">
                <div className="flex justify-end overflow-hidden">
                  <div className="w-max">
                    <div className="mb-1 grid grid-cols-12 text-[10px] text-muted-foreground">
                      {MONTHS.map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                    <div
                      className="grid grid-flow-col gap-[3px]"
                      style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
                    >
                      {previewLevels.map((level, i) => (
                        <span
                          key={i}
                          className="h-[10px] w-[10px] rounded-[2px] outline outline-1 -outline-offset-1 outline-foreground/5"
                          style={{ backgroundColor: `var(--contribution-level-${level})` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Learn how we count aura</span>
                  <span className="ml-auto flex items-center gap-1">
                    Less
                    {[0, 1, 2, 3, 4].map((l) => (
                      <span
                        key={l}
                        className="h-[10px] w-[10px] rounded-[2px] outline outline-1 -outline-offset-1 outline-foreground/5"
                        style={{ backgroundColor: `var(--contribution-level-${l})` }}
                      />
                    ))}
                    More
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Badges</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="gh-label border-gold/40 text-gold">
                    <Trophy className="h-3 w-3" /> 1st · September
                  </span>
                  <span className="gh-label border-silver/40 text-silver">
                    <Medal className="h-3 w-3" /> 2nd · July
                  </span>
                  <span className="gh-label">
                    <Flame className="h-3 w-3 text-bronze" /> 30-day streak
                  </span>
                </div>
              </div>
              <div className="rounded-md border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Recent activity</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Climbed to <span className="font-medium text-foreground">#24</span> globally
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-done" />
                    Won a battle against <span className="font-medium text-foreground">@hubot</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="-mb-px -mr-px border-b border-r border-border px-3 py-3 sm:px-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground sm:text-xl">{value}</p>
    </div>
  );
}
