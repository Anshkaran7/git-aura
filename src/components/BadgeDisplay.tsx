"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { getCurrentMonthYear } from "@/lib/utils2";
import { BadgeIcon as BadgeAsset } from "@/components/badges/BadgeIcon";

interface PositionBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  asset?: string;
  color: string;
  rarity: string;
  position: number;
}

interface BadgeDisplayProps {
  userId: string;
  selectedTheme: {
    name: string;
    background: string;
    cardBackground: string;
    text: string;
    border: string;
  };
}

const BadgeDisplay = ({ userId, selectedTheme }: BadgeDisplayProps) => {
  const [badge, setBadge] = useState<PositionBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<number | null>(null);

  useEffect(() => {
    fetchUserPosition();
  }, [userId]);

  const fetchUserPosition = async () => {
    try {
      const monthYear = getCurrentMonthYear();
      const response = await fetch(
        `/api/leaderboard/monthly?userId=${userId}&monthYear=${monthYear}&limit=100`
      );

      if (!response.ok) {
        setBadge(null);
        return;
      }

      const data = await response.json();

      if (!data.leaderboard || data.leaderboard.length === 0) {
        setBadge(null);
        return;
      }

      // Find user's position in the leaderboard
      const userEntry = data.leaderboard.find(
        (entry: any) => entry.user.id === userId
      );

      if (userEntry) {
        // Calculate position based on aura ranking
        const sortedLeaderboard = [...data.leaderboard].sort(
          (a, b) => b.aura - a.aura
        );
        const position =
          sortedLeaderboard.findIndex(
            (entry: any) => entry.user.id === userId
          ) + 1;

        setUserPosition(position);

        // Only show badges for top 3 positions
        if (position <= 3) {
          setBadge(generatePositionBadge(position));
        } else {
          setBadge(null);
        }
      } else {
        setBadge(null);
      }
    } catch (error) {
      console.error("Error fetching user position:", error);
      setBadge(null);
    } finally {
      setLoading(false);
    }
  };

  const generatePositionBadge = (position: number): PositionBadge => {
    if (position === 1) {
      return {
        id: "first-place",
        name: "Champion",
        description: "#1 developer on GitAura this month.",
        icon: <Trophy className="w-8 h-8" />,
        asset: "/badge/1st.png",
        color: "from-yellow-400 to-yellow-600",
        rarity: "legendary",
        position: 1,
      };
    } else if (position === 2) {
      return {
        id: "second-place",
        name: "Runner-up",
        description:
          "Holding strong at #2 this month.",
        icon: <Medal className="w-8 h-8" />,
        asset: "/badge/2nd.png",
        color: "from-gray-300 to-gray-500",
        rarity: "epic",
        position: 2,
      };
    } else if (position === 3) {
      return {
        id: "third-place",
        name: "Bronze medalist",
        description:
          "Earned the #3 spot this month.",
        icon: <Award className="w-8 h-8" />,
        asset: "/badge/3rd.png",
        color: "from-orange-400 to-orange-600",
        rarity: "rare",
        position: 3,
      };
    }

    // This shouldn't happen since we only call this for top 3
    return {
      id: "participant",
      name: "Participant",
      description: `Currently ranked #${position}`,
      icon: <Star className="w-8 h-8" />,
      color: "from-gray-400 to-gray-600",
      rarity: "common",
      position: position,
    };
  };

  void selectedTheme;

  const rarityLabelClass = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "border-gold/50 text-gold";
      case "epic":
        return "border-done/50 text-done";
      case "rare":
        return "border-link/50 text-link";
      default:
        return "";
    }
  };

  return (
    <section className="gh-box">
      <div className="gh-box-header">
        <h2 className="text-sm font-semibold text-foreground">Badges</h2>
        {userPosition && (
          <span className="text-xs text-muted-foreground">
            #{userPosition} this month
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-accent" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-accent" />
            <div className="h-3 w-48 animate-pulse rounded bg-accent" />
          </div>
        </div>
      ) : !badge ? (
        <div className="px-4 py-8 text-center">
          <Award className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            {userPosition && userPosition > 3
              ? `Ranked #${userPosition} this month`
              : "No badges yet"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            {userPosition && userPosition > 3
              ? "Keep contributing to break into the top 3 and earn a monthly badge."
              : "Finish in the monthly top 3 to earn an exclusive badge."}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-4 px-4 py-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center">
            {badge.asset ? (
              <BadgeAsset
                icon={badge.asset}
                name={badge.name}
                className="h-12 w-12"
              />
            ) : (
              <span className="text-muted-foreground">{badge.icon}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {badge.name}
              </h3>
              <span className={`gh-label ${rarityLabelClass(badge.rarity)}`}>
                {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {badge.description}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Monthly leaderboard · #{badge.position}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default BadgeDisplay;
