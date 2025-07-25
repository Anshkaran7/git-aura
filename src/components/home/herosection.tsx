"use client";

import { Button } from "@/components/ui/button";
import { Github, ArrowRight, Trophy, RefreshCw } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Squares from "../ui/Squares";

// Types for hero stats
interface HeroStats {
  totalDevelopers: number;
  totalAuraPoints: number;
  fallback?: boolean;
}

export const HeroSection = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<HeroStats>({
    totalDevelopers: 0,
    totalAuraPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

  const fetchHeroStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats/hero");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching hero stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroStats();
  }, []);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const renderStat = (value: number, label: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="font-semibold text-foreground">
        {loading ? (
          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin inline" />
        ) : error ? (
          "---"
        ) : (
          `${formatNumber(value)}+`
        )}
      </span>{" "}
      {label}
    </div>
  );

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-background overflow-hidden py-8">
      <div className="absolute w-full h-full z-30 pointer-events-auto">
        <Squares
          speed={0.3}
          squareSize={20}
          direction="diagonal"
          borderColor="#ffffff15"
          hoverFillColor="#00ff25"
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-40 pointer-events-none">
        <div className="max-w-3xl mx-auto slide-up">
          {/* Stats Display */}

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight z-50">
            Level Up Your <span className="text-highlight">GitHub Aura</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {isSignedIn
              ? "Check your aura score and climb the leaderboard. Let's see how you stack up."
              : "Join developers who turned their contributions into measurable impact. Get recognized for your work."}
          </p>

          {/* {!loading && stats.totalDevelopers > 0 && ( */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-8 mb-6 sm:mb-8 md:mb-12 text-xs sm:text-sm md:text-base px-2">
            {renderStat(
              stats.totalDevelopers,
              "Developers",
              <Github className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            )}
            {renderStat(
              stats.totalAuraPoints,
              "Aura Points",
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            )}
            {/* {renderStat(
              stats.totalBadges,
              "Badges Earned",
              <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            )} */}
          </div>
          {/* )} */}
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto">
            {isSignedIn ? (
              <Button
                variant="default"
                size="lg"
                className="text-lg px-8 py-6 cursor-pointer"
                onClick={handleGoToProfile}
              >
                <Github className="w-5 h-5 mr-2" />
                View My Aura
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="default"
                    size="lg"
                    className="text-lg px-8 py-6 group cursor-pointer"
                  >
                    <Github className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Connect GitHub
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Single floating element */}
      <div className="absolute top-1/2 right-12 floating">
        <div className="w-3 h-3 bg-muted rounded-full shadow-card"></div>
      </div>
    </section>
  );
};
