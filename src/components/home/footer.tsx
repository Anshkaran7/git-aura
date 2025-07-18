"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, MessageCircle, Heart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

export const Footer = () => {
  const router = useRouter();
  const [stats, setStats] = useState<HeroStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats/hero");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback stats if API fails
        setStats({
          totalDevelopers: 10000,
          totalAuraPoints: 50000000,
          totalBadges: 0,
          monthlyActive: 0,
          totalMonthlyContributions: 0,
          averageAuraPerUser: 0,
          averageBadgesPerUser: 0,
          fallback: true,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback stats
      setStats({
        totalDevelopers: 10000,
        totalAuraPoints: 50000000,
        totalBadges: 0,
        monthlyActive: 0,
        totalMonthlyContributions: 0,
        averageAuraPerUser: 0,
        averageBadgesPerUser: 0,
        fallback: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden py-8 sm:py-12">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-muted/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Brand Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="text-start w-full lg:w-auto">
            <div className="flex items-center justify-start gap-2 mb-4">
              <div className="p-2 rounded-lg bg-muted border border-border">
                <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-highlight">
                  Git Aura
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md text-start">
              Stop being a commit ghost and start building your developer street
              cred. Turn your green squares into actual flexing rights.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs border-border animate-pulse whitespace-nowrap"
                  >
                    Loading...
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-border animate-pulse whitespace-nowrap"
                  >
                    Loading...
                  </Badge>
                </>
              ) : stats ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    {formatNumber(stats.totalDevelopers)}+ Developers
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    {formatNumber(stats.totalAuraPoints)}+ Aura Points
                  </Badge>
                </>
              ) : (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    10K+ Developers
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    50M+ Aura Points
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="text-start lg:text-center w-full lg:w-auto p-4 sm:p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
              Ready to Stop Being Mid?
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
              Join hundreds of developers who've already discovered their true
              Git Aura. Warning: Results may cause excessive confidence in code
              reviews.
            </p>
            <Button
              variant="default"
              size="default"
              className="w-full sm:w-auto px-4 sm:px-8 py-2"
            >
              <Github className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              Start Your Git Aura Journey
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-border">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-0 text-center sm:text-left">
            <span>Made with</span>
            <Heart className="w-3 sm:w-4 h-3 sm:h-4 text-red-500 fill-current" />
            <span>by Karan, for developers who want to flex</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                router.push("https://github.com/anshkaran7/git-aura")
              }
            >
              <Github className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <Twitter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Git Aura. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
