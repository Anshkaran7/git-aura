"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Flame, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/utils2";

interface TopUser {
  id: number;
  name: string;
  designation: string;
  image: string;
  githubUsername?: string;
  rank: number;
  totalAura: number;
  contributions: number;
  currentStreak: number;
}

interface ApiResponse {
  topUsers: TopUser[];
  monthYear: string;
  stats: {
    totalAuraPoints: number;
    totalContributions: number;
    totalParticipants: number;
  };
  fallback?: boolean;
}

async function fetchTopUsers(): Promise<ApiResponse> {
  const response = await fetch("/api/leaderboard/top-monthly");
  if (!response.ok) {
    throw new Error("Failed to fetch top users");
  }

  const data = (await response.json()) as ApiResponse;
  if (data.fallback) {
    throw new Error("No data available");
  }

  return data;
}

export default function TopAuraUsers() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const topUsersQuery = useQuery({
    queryKey: ["top-monthly-users"],
    queryFn: fetchTopUsers,
    staleTime: 5 * 60 * 1000,
  });

  const topUsers = (topUsersQuery.data?.topUsers ?? []).slice(0, 5);

  const stats = topUsersQuery.data?.stats ?? {
    totalAuraPoints: 0,
    totalContributions: 0,
    totalParticipants: 0,
  };

  const monthYear = topUsersQuery.data?.monthYear ?? "";
  const error =
    topUsersQuery.error instanceof Error ? topUsersQuery.error.message : null;

  const handleGoToProfile = () => {
    const githubAccount = user?.externalAccounts?.find(
      (account) => account.provider === "github"
    );
    router.push(githubAccount?.username ? `/${githubAccount.username}` : "/sign-in");
  };

  const getMonthName = (value: string) => {
    if (!value) return "This month";
    const [year, month] = value.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const rankColor = (rank: number) =>
    rank === 1
      ? "text-gold"
      : rank === 2
        ? "text-silver"
        : rank === 3
          ? "text-bronze"
          : "text-muted-foreground";

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <p className="gh-eyebrow">Leaderboard</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Who&apos;s leading this month.
          </h2>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            Rankings reset every month, so there&apos;s always a race to win.
            The top three earn a permanent badge.
          </p>

          {!error && stats.totalParticipants > 0 && (
            <dl className="mt-6 grid max-w-md grid-cols-3 gap-4">
              {[
                { label: "Aura this month", value: stats.totalAuraPoints },
                { label: "Contributions", value: stats.totalContributions },
                { label: "Developers", value: stats.totalParticipants },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
                    {formatNumber(item.value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="gh-box overflow-hidden">
          <div className="gh-box-header">
            <h3 className="text-sm font-semibold text-foreground">
              Top developers · {getMonthName(monthYear)}
            </h3>
            <Link href="/leaderboard" className="gh-link text-xs">
              View all
            </Link>
          </div>

          {topUsersQuery.isLoading ? (
            <ul>
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="gh-box-row flex items-center gap-3">
                  <span className="h-4 w-4 animate-pulse rounded bg-accent" />
                  <span className="h-8 w-8 animate-pulse rounded-full bg-accent" />
                  <span className="h-4 w-32 animate-pulse rounded bg-accent" />
                  <span className="ml-auto h-4 w-12 animate-pulse rounded bg-accent" />
                </li>
              ))}
            </ul>
          ) : error || topUsers.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">
                {error ? "Leaderboard unavailable" : "No rankings yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error
                  ? "Please try again in a moment."
                  : "No one has claimed the first spot this month."}
              </p>
            </div>
          ) : (
            <ul>
              {topUsers.map((u) => (
                <li key={u.id} className="gh-box-row flex items-center gap-3 hover:bg-canvas-subtle">
                  <span className={`w-5 text-center text-sm font-semibold tabular-nums ${rankColor(u.rank)}`}>
                    {u.rank}
                  </span>
                  <img
                    src={u.image}
                    alt=""
                    loading="lazy"
                    className="h-8 w-8 rounded-full border border-border bg-canvas-subtle"
                  />
                  <div className="min-w-0 flex-1">
                    {u.githubUsername ? (
                      <a
                        href={`https://github.com/${u.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-semibold text-foreground hover:text-link hover:underline"
                      >
                        {u.name}
                      </a>
                    ) : (
                      <span className="block truncate text-sm font-semibold text-foreground">{u.name}</span>
                    )}
                    {u.githubUsername && (
                      <span className="block truncate text-xs text-muted-foreground">@{u.githubUsername}</span>
                    )}
                  </div>
                  {u.currentStreak > 0 && (
                    <span className="gh-label hidden sm:inline-flex">
                      <Flame className="h-3 w-3 text-bronze" />
                      {u.currentStreak}d
                    </span>
                  )}
                  <span className="text-right text-sm font-semibold tabular-nums text-foreground">
                    {formatNumber(u.totalAura)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">aura</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Closing CTA */}
      <div className="mx-auto mt-20 max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 rounded-md border border-border bg-canvas-subtle p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              See where you rank.
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Free, open source, and ready in under a minute.
            </p>
          </div>
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
        </div>
      </div>
    </section>
  );
}
