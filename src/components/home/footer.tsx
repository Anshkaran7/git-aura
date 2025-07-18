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
    <footer className="bg-card border-t border-border relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-muted/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto  py-12 relative z-10">
        {/* Brand Section */}
        <div className="flex flex-row items-center justify-between">
          <div className="text-start mb-8">
            <div className="flex items-center justify-start gap-2 mb-4">
              <div className="p-2 rounded-lg bg-muted border border-border">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-highlight">
                  Git Aura
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-md mx-auto text-start">
              Stop being a commit ghost and start building your developer street
              cred. Turn your green squares into actual flexing rights.
            </p>
            <div className="flex items-center justify-start gap-2">
              {loading ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs border-border animate-pulse"
                  >
                    Loading...
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-border animate-pulse"
                  >
                    Loading...
                  </Badge>
                </>
              ) : stats ? (
                <>
                  <Badge variant="outline" className="text-xs border-border">
                    {formatNumber(stats.totalDevelopers)}+ Developers
                  </Badge>
                  <Badge variant="outline" className="text-xs border-border">
                    {formatNumber(stats.totalAuraPoints)}+ Aura Points
                  </Badge>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-xs border-border">
                    10K+ Developers
                  </Badge>
                  <Badge variant="outline" className="text-xs border-border">
                    50M+ Aura Points
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="text-center mb-8 p-6 rounded-xl bg-card border border-border">
            <h3 className="text-xl font-bold mb-3">Ready to Stop Being Mid?</h3>
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto text-sm">
              Join hundreds of developers who've already discovered their true
              Git Aura. Warning: Results may cause excessive confidence in code
              reviews.
            </p>
            <Button variant="default" size="lg" className="px-8">
              <Github className="w-5 h-5 mr-2" />
              Start Your Git Aura Journey
            </Button>
          </div>
        </div>
        {/* Final CTA */}

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-border">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4 md:mb-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
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
