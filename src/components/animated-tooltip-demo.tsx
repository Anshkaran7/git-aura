"use client";
import React, { useState, useEffect } from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Github, RefreshCw } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  const [topUsers, setTopUsers] = useState<TopUser[]>(fallbackUsers);
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

      const response = await fetch("/api/leaderboard/top-monthly");
      if (!response.ok) {
        throw new Error("Failed to fetch top users");
      }

      const data: ApiResponse = await response.json();

      if (data.topUsers && data.topUsers.length > 0) {
        setTopUsers(data.topUsers);
        setStats(data.stats);
        setMonthYear(data.monthYear);
      } else {
        // No data available for current month, show placeholder message
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
      // Keep fallback data on error
      setTopUsers(fallbackUsers);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
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

  return (
    <section className="py-12 sm:py-20 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-muted/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-card backdrop-blur-sm border border-border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Hall of Fame
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            {getMonthName(monthYear)}'s{" "}
            <span className="text-highlight">Aura Legends</span> 👑
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {loading ? (
              "Loading the month's top performers..."
            ) : topUsers.length === 0 ? (
              <>
                Be the first to claim your spot this month!
                <span className="text-primary font-semibold">
                  {" "}
                  Connect your GitHub and start farming aura!
                </span>
              </>
            ) : (
              <>
                These developers didn't just commit code - they committed to
                greatness.
                <span className="text-primary font-semibold">
                  {" "}
                  Hover to see their legendary scores!
                </span>
              </>
            )}
          </p>
        </div>

        {/* Animated Tooltip Component */}
        <div className="flex flex-row items-center justify-center mb-8 sm:mb-12 w-full min-h-[60px] sm:min-h-[80px]">
          {loading ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 animate-spin text-primary" />
              <span className="text-sm sm:text-base text-muted-foreground">
                Loading top performers...
              </span>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🚀</div>
              <p className="text-sm sm:text-base text-muted-foreground">
                No champions yet this month.
                <br />
                <span className="text-primary font-semibold">
                  Be the first to dominate!
                </span>
              </p>
            </div>
          ) : (
            <AnimatedTooltip items={topUsers} />
          )}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-12">
          {isSignedIn ? (
            <Badge
              variant="outline"
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 border-primary text-primary cursor-pointer hover:bg-primary/10 transition-colors w-full sm:w-auto text-center"
              onClick={handleGoToProfile}
            >
              <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Your Aura Dashboard
            </Badge>
          ) : (
            <SignInButton mode="modal">
              <Badge
                variant="outline"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 border-primary text-primary cursor-pointer hover:bg-primary/10 transition-colors w-full sm:w-auto text-center"
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Join the Elite - Connect Your GitHub
              </Badge>
            </SignInButton>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-4">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {loading ? (
                <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                `${stats.totalAuraPoints.toLocaleString()}${
                  stats.totalAuraPoints === 0 ? "" : "+"
                }`
              )}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Total Aura Points{" "}
              {monthYear ? `(${getMonthName(monthYear)})` : "This Month"}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {loading ? (
                <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                `${stats.totalParticipants.toLocaleString()}${
                  stats.totalParticipants === 0 ? "" : "+"
                }`
              )}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Active Competitors
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {(() => {
                const now = new Date();
                const nextMonth = new Date(
                  now.getFullYear(),
                  now.getMonth() + 1,
                  1
                );
                const timeDiff = nextMonth.getTime() - now.getTime();
                const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                return `${daysLeft} days`;
              })()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Until Next Reset
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 sm:mt-8 bg-red-900/20 border border-red-800 rounded-lg p-3 sm:p-4 max-w-md mx-auto">
            <p className="text-xs sm:text-sm text-red-400 text-center">
              ⚠️ {error}
              <br />
              <button
                onClick={fetchTopUsers}
                className="text-primary hover:text-primary/80 underline mt-2 inline-flex items-center gap-1 text-xs sm:text-sm"
              >
                <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Try again
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
