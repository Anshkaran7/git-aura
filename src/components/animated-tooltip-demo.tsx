"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Github, RefreshCw } from "lucide-react";
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

const fallbackUsers: TopUser[] = [1, 2, 3, 4, 5].map((id) => ({
  id,
  name: "Loading...",
  designation: "Aura Score: ---",
  image: `https://api.dicebear.com/7.x/avatars/svg?seed=${id}`,
  rank: id,
  totalAura: 0,
  contributions: 0,
  currentStreak: 0,
}));

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

  const topUsers =
    topUsersQuery.data?.topUsers && topUsersQuery.data.topUsers.length > 0
      ? topUsersQuery.data.topUsers
      : topUsersQuery.isLoading
        ? fallbackUsers
        : [];

  const stats = topUsersQuery.data?.stats ?? {
    totalAuraPoints: 0,
    totalContributions: 0,
    totalParticipants: 0,
  };

  const monthYear = topUsersQuery.data?.monthYear ?? "";
  const error =
    topUsersQuery.error instanceof Error ? topUsersQuery.error.message : null;

  const handleGoToProfile = () => {
    if (user?.externalAccounts) {
      const githubAccount = user.externalAccounts.find(
        (account) => account.provider === "github"
      );
      if (githubAccount?.username) {
        router.push(`/${githubAccount.username}`);
        return;
      }
    }
    router.push("/profile");
  };

  const getMonthName = (value: string) => {
    if (!value) return "This Month";
    const [year, month] = value.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const renderStats = () => {
    if (topUsersQuery.isLoading) return null;
    if (error || !stats.totalParticipants) return null;

    return (
      <div className="mb-8 flex flex-wrap justify-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(stats.totalAuraPoints)}
            </span>{" "}
            total aura
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(stats.totalContributions)}
            </span>{" "}
            commits in motion
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(stats.totalParticipants)}
            </span>{" "}
            people in the mix
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <div className="container relative z-10 mx-auto rounded-[2.2rem] border border-border bg-card/95 px-4 py-8 text-center shadow-[0_24px_80px_-42px_rgba(0,0,0,0.2)] sm:px-6 sm:py-10">
        <div className="mx-auto mb-8 max-w-3xl sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
            <Trophy className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              This month&apos;s room
            </span>
          </div>

          <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-4xl">
            {getMonthName(monthYear)} is looking stacked.
          </h2>

          <p className="mx-auto mb-6 max-w-2xl px-4 text-sm leading-6 text-muted-foreground">
            {topUsersQuery.isLoading ? (
              "Pulling the current top names..."
            ) : error ? (
              "The room is being weird right now. Try again in a sec."
            ) : topUsers.length === 0 ? (
              "No one has claimed the spotlight yet. First big month can set the whole tone."
            ) : (
              "A quick look at the profiles moving the hardest this month. Hover around and catch the vibe."
            )}
          </p>

          {renderStats()}
        </div>

        <div className="mb-8 flex min-h-[60px] w-full flex-row items-center justify-center sm:mb-10 sm:min-h-[80px]">
          {topUsersQuery.isLoading ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <RefreshCw className="h-4 w-4 animate-spin text-primary sm:h-6 sm:w-6" />
              <span className="text-sm text-muted-foreground sm:text-base">
                Loading the current lineup...
              </span>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="text-center">
              <div className="mb-3 text-4xl sm:mb-4 sm:text-6xl">🚀</div>
              <p className="text-sm text-muted-foreground">
                No one owns the month yet.
              </p>
            </div>
          ) : (
            <AnimatedTooltip items={topUsers} />
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isSignedIn ? (
            <Badge
              variant="outline"
              className="w-full cursor-pointer rounded-full border-primary px-4 py-2 text-xs text-primary transition-colors hover:bg-primary/10 sm:w-auto"
              onClick={handleGoToProfile}
            >
              <Github className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Open your quiet flex
            </Badge>
          ) : (
            <SignInButton mode="modal">
              <Badge
                variant="outline"
                className="w-full cursor-pointer rounded-full border-primary px-4 py-2 text-xs text-primary transition-colors hover:bg-primary/10 sm:w-auto"
              >
                <Github className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Connect GitHub and get in the mix
              </Badge>
            </SignInButton>
          )}
        </div>
      </div>
    </section>
  );
}
