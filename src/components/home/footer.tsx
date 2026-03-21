"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight01Icon,
  GithubIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";

interface HeroStats {
  totalDevelopers: number;
  totalAuraPoints: number;
  totalBadges: number;
}

export const Footer = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [stats, setStats] = useState<HeroStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/hero", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = (await response.json()) as HeroStats;
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    void fetchStats();
  }, []);

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }

    return `${value}`;
  };

  return (
    <footer className="px-4 pb-10 pt-6 sm:px-6 sm:pb-14">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-card p-5 shadow-[0_22px_80px_-44px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-border bg-background p-2">
                <Image
                  src="/logo.png"
                  alt="Git Aura"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  GitAura
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  A quieter GitHub profile experience.
                </h2>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              The interface is now built around a monochrome palette, smaller
              type, and stronger spacing so stats, ranks, and badges feel more
              premium.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full border-border px-3 py-1 text-[11px]">
                {stats ? `${formatNumber(stats.totalDevelopers)}+ developers` : "Live leaderboard"}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border px-3 py-1 text-[11px]">
                {stats ? `${formatNumber(stats.totalAuraPoints)}+ aura` : "Monthly badges"}
              </Badge>
              <Badge variant="outline" className="rounded-full border-border px-3 py-1 text-[11px]">
                {stats ? `${formatNumber(stats.totalBadges)}+ badges` : "Profile exports"}
              </Badge>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <HugeIcon icon={SparklesIcon} size={14} />
              Ready to use it?
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-foreground">
              Open your profile, check your leaderboard card, and make sure your
              badges now render properly.
            </p>
            <Button
              onClick={() => router.push(isSignedIn ? "/leaderboard" : "/sign-in")}
              className="mt-4 h-10 rounded-full px-4 text-sm font-semibold"
            >
              <HugeIcon icon={GithubIcon} size={16} />
              {isSignedIn ? "Open leaderboard" : "Sign in to GitAura"}
              <HugeIcon icon={ArrowRight01Icon} size={16} />
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2025 GitAura. Designed with a lighter hand.</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("https://github.com/anshkaran7/git-aura")}
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </button>
            <button
              type="button"
              onClick={() => router.push("https://x.com/itsmeekaran")}
              className="transition-colors hover:text-foreground"
            >
              X
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
