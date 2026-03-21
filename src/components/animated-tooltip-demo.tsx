"use client";
import React, { useState, useEffect } from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Github, RefreshCw } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/utils2";

// Types for the API response
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

// Fallback data for when API fails or no data is available
const fallbackUsers: TopUser[] = [
  {
    id: 1,
    name: "Loading...",
    designation: "Aura Score: ---",
    image: "https://api.dicebear.com/7.x/avatars/svg?seed=1",
    rank: 1,
    totalAura: 0,
    contributions: 0,
    currentStreak: 0,
  },
  {
    id: 2,
    name: "Loading...",
    designation: "Aura Score: ---",
    image: "https://api.dicebear.com/7.x/avatars/svg?seed=2",
    rank: 2,
    totalAura: 0,
    contributions: 0,
    currentStreak: 0,
  },
  {
    id: 3,
    name: "Loading...",
    designation: "Aura Score: ---",
    image: "https://api.dicebear.com/7.x/avatars/svg?seed=3",
    rank: 3,
    totalAura: 0,
    contributions: 0,
    currentStreak: 0,
  },
  {
    id: 4,
    name: "Loading...",
    designation: "Aura Score: ---",
    image: "https://api.dicebear.com/7.x/avatars/svg?seed=4",
    rank: 4,
    totalAura: 0,
    contributions: 0,
    currentStreak: 0,
  },
  {
    id: 5,
    name: "Loading...",
    designation: "Aura Score: ---",
    image: "https://api.dicebear.com/7.x/avatars/svg?seed=5",
    rank: 5,
    totalAura: 0,
    contributions: 0,
    currentStreak: 0,
  },
];

export default function TopAuraUsers() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [stats, setStats] = useState({
    totalAuraPoints: 0,
    totalContributions: 0,
    totalParticipants: 0,
  });
  const [monthYear, setMonthYear] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setTopUsers(fallbackUsers); // Show loading state immediately

      const response = await fetch("/api/leaderboard/top-monthly");
      if (!response.ok) {
        throw new Error("Failed to fetch top users");
      }

      const data: ApiResponse = await response.json();

      if (data.fallback) {
        throw new Error("No data available");
      }

      if (data.topUsers && data.topUsers.length > 0) {
        setTopUsers(data.topUsers);
        setStats(data.stats);
        setMonthYear(data.monthYear);
      } else {
        setTopUsers([]);
        setStats({
          totalAuraPoints: 0,
          totalContributions: 0,
          totalParticipants: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching top users:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
      setTopUsers([]); // Clear loading state on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();
  }, []);

  // Get current month name for display
  const getMonthName = (monthYear: string) => {
    if (!monthYear) return "This Month";
    const [year, month] = monthYear.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Render stats section
  const renderStats = () => {
    if (loading) return null;
    if (error || !stats.totalParticipants) return null;

    return (
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(stats.totalAuraPoints)}
            </span>{" "}
            Total Aura
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(stats.totalContributions)}
            </span>{" "}
            Contributions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatNumber(stats.totalParticipants)}
            </span>{" "}
            Participants
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <div className="container relative z-10 mx-auto rounded-[2rem] border border-border bg-card px-4 py-8 text-center shadow-[0_24px_80px_-42px_rgba(0,0,0,0.38)] sm:px-6 sm:py-10">
        <div className="mx-auto mb-8 max-w-3xl sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Hall of Fame
            </span>
          </div>

          <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
            {getMonthName(monthYear)}’s top contributors.
          </h2>

          <p className="mx-auto mb-6 max-w-2xl px-4 text-sm leading-6 text-muted-foreground">
            {loading ? (
              "Loading the month's top performers..."
            ) : error ? (
              "Unable to load top performers. Please try again later."
            ) : topUsers.length === 0 ? (
              <>
                No winners have landed yet this month. The first strong profile
                can set the tone.
              </>
            ) : (
              <>
                A compact snapshot of the strongest GitAura profiles right now.
                Hover to inspect rank, aura, and current momentum.
              </>
            )}
          </p>

          {/* Stats Section */}
          {renderStats()}
        </div>

        {/* Animated Tooltip Component */}
        <div className="mb-8 flex min-h-[60px] w-full flex-row items-center justify-center sm:mb-10 sm:min-h-[80px]">
          {loading ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 animate-spin text-primary" />
              <span className="text-sm sm:text-base text-muted-foreground">
                Loading top performers...
              </span>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🚀</div>
              <p className="text-sm text-muted-foreground">
                No champions yet this month.
              </p>
            </div>
          ) : (
            <AnimatedTooltip items={topUsers} />
          )}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isSignedIn ? (
            <Badge
                variant="outline"
                className="w-full cursor-pointer rounded-full border-primary px-4 py-2 text-xs text-primary transition-colors hover:bg-primary/10 sm:w-auto"
                onClick={handleGoToProfile}
              >
              <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Your Aura Dashboard
            </Badge>
          ) : (
            <SignInButton mode="modal">
              <Badge
                variant="outline"
                className="w-full cursor-pointer rounded-full border-primary px-4 py-2 text-xs text-primary transition-colors hover:bg-primary/10 sm:w-auto"
              >
                <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Connect GitHub & Start Competing
              </Badge>
            </SignInButton>
          )}
        </div>
      </div>
    </section>
  );
}
