"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
    title: "Leaderboard polish",
    text: "Monthly and all-time rankings with cleaner cards and steadier loading states.",
    icon: RankingIcon,
  },
  {
    title: "Profile export",
    text: "Sharper shareable layouts for GitHub identities, badges, and aura snapshots.",
    icon: Share08Icon,
  },
  {
    title: "Badge system",
    text: "Top placements, visual rewards, and better profile presentation without noisy UI.",
    icon: Award01Icon,
  },
];

export const HeroSection = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<HeroStats>({
    totalDevelopers: 0,
    totalAuraPoints: 0,
    totalBadges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroStats = async () => {
      try {
        const response = await fetch("/api/stats/hero", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch hero stats");
        }

        const data = (await response.json()) as HeroStats;
        setStats(data);
      } catch (error) {
        console.error("Error fetching hero stats:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchHeroStats();
  }, []);

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
    <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(115,115,115,0.12),transparent_34%)]" />
      <div className="absolute inset-x-6 top-28 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
            <HugeIcon icon={SparklesIcon} size={14} className="text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Refined monochrome system
            </span>
          </div>

          <h1 className="max-w-xl text-[2.2rem] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground sm:text-[3.4rem] lg:text-[4.5rem]">
            Measure your GitHub work with a calmer, classier interface.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground sm:text-[15px]">
            GitAura turns contribution history, rank movement, and badges into a
            portfolio surface that feels editorial instead of overdesigned.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isSignedIn ? (
              <Button
                size="lg"
                onClick={handleGoToProfile}
                className="h-11 rounded-full px-5 text-sm font-semibold"
              >
                <HugeIcon icon={GithubIcon} size={16} />
                Open My Aura
                <HugeIcon icon={ArrowRight01Icon} size={16} />
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="h-11 rounded-full px-5 text-sm font-semibold"
                >
                  <HugeIcon icon={GithubIcon} size={16} />
                  Connect GitHub
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
              Explore Leaderboard
            </Button>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Developers
              </div>
              <div className="mt-2 text-lg font-semibold text-foreground">
                {loading ? "..." : `${formatNumber(stats.totalDevelopers)}+`}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Aura
              </div>
              <div className="mt-2 text-lg font-semibold text-foreground">
                {loading ? "..." : `${formatNumber(stats.totalAuraPoints)}+`}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm sm:block">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Badges
              </div>
              <div className="mt-2 text-lg font-semibold text-foreground">
                {loading ? "..." : `${formatNumber(stats.totalBadges || 0)}+`}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-foreground/5 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-4 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.32)] sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Home Preview
                </p>
                <h2 className="mt-1 text-base font-semibold text-foreground">
                  Quiet by default. Strong on detail.
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                <HugeIcon icon={Analytics01Icon} size={14} className="text-primary" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {stats.monthYear || "Live data"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {quickNotes.map((note) => (
                <div
                  key={note.title}
                  className="rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-card text-foreground">
                      <HugeIcon icon={note.icon} size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {note.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {note.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-[1.4rem] border border-border bg-background px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Signature card
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Smaller type. Better spacing. Real contrast.
                    </p>
                  </div>
                  <div className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    AAA-ready grayscale
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
