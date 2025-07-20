"use client";

import { Button } from "@/components/ui/button";
import { Github, Zap, Trophy, Star, ArrowRight, RefreshCw } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Squares from "../ui/Squares";

// Types for hero stats
interface HeroStats {
  totalDevelopers: number;
  totalAuraPoints: number;
  totalBadges: number;
  monthlyActive: number;
  totalMonthlyContributions: number;
  averageAuraPerUser: number;
  averageBadgesPerUser: number;
  fallback?: boolean;
}

export const HeroSection = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<HeroStats>({
    totalDevelopers: 0,
    totalAuraPoints: 0,
    totalBadges: 0,
    monthlyActive: 0,
    totalMonthlyContributions: 0,
    averageAuraPerUser: 0,
    averageBadgesPerUser: 0,
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
    // Fallback to profile page if no GitHub username found
    router.push("/profile");
  };

  const handleShowDemoProfile = () => {
    router.push("/torvalds");
  };

  const fetchHeroStats = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch("/api/stats/hero");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data: HeroStats = await response.json();
      if (data.fallback) {
        setError(true);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching hero stats:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroStats();
  }, []);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Render stat with loading state
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
    <section className="relative min-h-[100vh] sm:min-h-screen flex items-center justify-center bg-background overflow-hidden py-8 sm:py-12">
      <div className="absolute w-full h-full z-30 pointer-events-auto">
        <Squares
          speed={0.3}
          squareSize={20}
          direction="diagonal"
          borderColor="#ffffff15"
          hoverFillColor="#00ff25"
        />
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center relative z-40 pointer-events-none">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto slide-up">
          {/* Badge */}
          <div className="inline-flex mt-0 md:mt-10 items-center bg-muted/50 border-2 border-border rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 mb-3 sm:mb-4 text-xs sm:text-sm">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            <span className="font-medium text-[9px]  md:text-base z-50 ml-1 sm:ml-2 text-center">
              {isSignedIn
                ? `Welcome back, ${user?.firstName || "Developer"}! 🚀`
                : loading
                ? "Loading community stats..."
                : stats.totalDevelopers > 0
                ? `Join ${formatNumber(
                    stats.totalDevelopers
                  )}+ developers leveling up their GitHub game`
                : "Be among the first developers to join GitHub Aura!"}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight z-50 px-2">
            {isSignedIn ? (
              <>
                Ready to Level Up Your{" "}
                <span className="text-highlight">GitHub Aura</span>? 🔥
              </>
            ) : (
              <>
                Your GitHub Contributions Are{" "}
                <span className="text-highlight">Weak</span>?
                <br className="hidden sm:block" />
                Let's Fix That <span className="text-highlight">Aura</span> 💀
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-3 sm:px-4">
            {isSignedIn ? (
              <>
                Your GitHub profile is connected! Time to see your developer
                aura score
                <span className="text-primary font-semibold">
                  {" "}
                  and climb the leaderboard
                </span>
                .<br className="hidden md:block" />
                Let's see how much aura you've been farming! 📈
              </>
            ) : (
              <>
                Stop being a commit ghost 👻 Join thousands of developers who
                turned their green squares into
                <span className="text-primary font-semibold">
                  {" "}
                  ACTUAL developer street cred
                </span>
                .
                <br className="hidden md:block" />
                Warning: May cause excessive flexing on LinkedIn.
              </>
            )}
          </p>

          {/* Stats Row */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 lg:gap-8 mb-6 sm:mb-8 md:mb-12 text-xs sm:text-sm md:text-base px-2">
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
            {renderStat(
              stats.totalBadges,
              "Badges Earned",
              <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center pointer-events-auto px-3 sm:px-4">
            {isSignedIn ? (
              <>
                <Button
                  variant="default"
                  size="lg"
                  className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 w-full sm:w-auto cursor-pointer"
                  onClick={handleGoToProfile}
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  View My Aura Dashboard
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>

                {/* <Button
                  variant="secondary"
                  size="lg"
                  className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 w-full sm:w-auto cursor-pointer"
                  onClick={handleShowDemoProfile}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  See Pro Profile Example
                </Button> */}
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="default"
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 w-full sm:w-auto group cursor-pointer"
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2 cursor-pointer group-hover:rotate-12 transition-transform" />
                    Connect GitHub & Get Roasted
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignInButton>

                <Button
                  variant="secondary"
                  size="lg"
                  className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 w-full sm:w-auto cursor-pointer"
                  onClick={handleShowDemoProfile}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Show Me a Pro Profile
                </Button>
              </>
            )}
          </div>

          {/* Social Proof */}
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 md:mt-8 px-3 sm:px-4 leading-relaxed">
            {isSignedIn ? (
              <>
                🎉 You're now part of the GitHub Aura elite!
                <br />
                <span className="text-primary">
                  Time to flex those contribution stats
                </span>
              </>
            ) : (
              <>
                "I went from 'junior developer' to 'senior developer' just by
                showing my aura score in standup meetings. 10/10 would
                recommend."
                <br />
                <span className="text-primary">- Anonymous Chad Developer</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Floating Elements - Better mobile positioning */}
      <div className="absolute top-8 sm:top-10 md:top-20 right-8 sm:right-10 md:right-20 floating">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-primary rounded-full shadow-card"></div>
      </div>
      <div
        className="absolute bottom-12 sm:bottom-16 md:bottom-32 left-8 sm:left-10 md:left-20 floating"
        style={{ animationDelay: "1s" }}
      >
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-accent rounded-full shadow-card"></div>
      </div>
      <div
        className="absolute top-1/2 right-12 sm:right-16 md:right-32 floating"
        style={{ animationDelay: "2s" }}
      >
        <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-muted rounded-full shadow-card"></div>
      </div>
    </section>
  );
};
