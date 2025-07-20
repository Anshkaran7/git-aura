"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star } from "lucide-react";

interface PositionBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
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
      console.log("Fetching user position for userId:", userId);

      // Fetch current month's leaderboard to get user position
      const response = await fetch(`/api/leaderboard/monthly?userId=${userId}`);

      if (!response.ok) {
        console.log("Failed to fetch leaderboard data");
        setBadge(null);
        return;
      }

      const data = await response.json();
      console.log("Leaderboard response:", data);

      if (!data.leaderboard || data.leaderboard.length === 0) {
        console.log("No leaderboard data found");
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

        console.log("User position:", position);
        setUserPosition(position);

        // Only show badges for top 3 positions
        if (position <= 3) {
          setBadge(generatePositionBadge(position));
        } else {
          setBadge(null);
        }
      } else {
        console.log("User not found in leaderboard");
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
        name: "🏆 Champion",
        description: "You're the #1 developer this month! Absolute legend! 👑",
        icon: <Trophy className="w-8 h-8" />,
        color: "from-yellow-400 to-yellow-600",
        rarity: "legendary",
        position: 1,
      };
    } else if (position === 2) {
      return {
        id: "second-place",
        name: "🥈 Runner-up",
        description:
          "Amazing work! You're holding strong at #2! Keep pushing! 💪",
        icon: <Medal className="w-8 h-8" />,
        color: "from-gray-300 to-gray-500",
        rarity: "epic",
        position: 2,
      };
    } else if (position === 3) {
      return {
        id: "third-place",
        name: "🥉 Bronze Medalist",
        description:
          "Excellent! You've earned the #3 spot! You're in the top tier! 🌟",
        icon: <Award className="w-8 h-8" />,
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "border-yellow-500 shadow-yellow-500/20";
      case "epic":
        return "border-purple-500 shadow-purple-500/20";
      case "rare":
        return "border-blue-500 shadow-blue-500/20";
      default:
        return "border-gray-400 shadow-gray-400/20";
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "shadow-yellow-500/50";
      case "epic":
        return "shadow-purple-500/50";
      case "rare":
        return "shadow-blue-500/50";
      default:
        return "shadow-gray-400/50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-16 md:py-20">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-4">
        <div
          className={`text-center py-12 sm:py-16 md:py-20 ${
            selectedTheme.name === "Light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          <Award className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
          <p className="text-base sm:text-lg md:text-xl mb-2">
            {userPosition && userPosition > 3
              ? `Great job! You're ranked #${userPosition}`
              : "Join the Top 3 Elite!"}
          </p>
          <p className="text-sm sm:text-base max-w-sm mx-auto px-2">
            {userPosition && userPosition > 3
              ? "Keep contributing to break into the top 3 and earn your elite badge!"
              : "Compete with other developers and earn your place in the top 3 to get an exclusive badge!"}
          </p>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm opacity-75">
            Only the top 3 developers get special badges 🏆🥈🥉
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-3 sm:px-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="relative max-w-sm w-full"
      >
        {/* Badge Container */}
        <div
          className={`relative p-4 sm:p-6 md:p-8 ${
            selectedTheme.cardBackground
          } rounded-2xl sm:rounded-3xl border-2 sm:border-4 ${getRarityColor(
            badge.rarity
          )} shadow-xl sm:shadow-2xl ${getRarityGlow(
            badge.rarity
          )} backdrop-blur-sm mx-2 sm:mx-0`}
        >
          {/* Position Number (Top Right) */}
          <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-4 md:-right-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow-lg">
            <span className="text-white font-bold text-xs sm:text-sm md:text-lg">
              #{badge.position}
            </span>
          </div>

          {/* Badge Icon */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-xl`}
          >
            <div className="text-white scale-75 sm:scale-90 md:scale-100">
              {badge.icon}
            </div>
          </div>

          {/* Badge Info */}
          <div className="text-center">
            <h2
              className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 ${
                selectedTheme.name === "Light" ? "text-gray-800" : "text-white"
              } px-2`}
            >
              {badge.name}
            </h2>

            {/* Rarity */}
            <div
              className={`inline-flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${
                badge.rarity === "legendary"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : badge.rarity === "epic"
                  ? "bg-purple-100 text-purple-800 border border-purple-300"
                  : badge.rarity === "rare"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-800 border border-gray-300"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  badge.rarity === "legendary"
                    ? "bg-yellow-500"
                    : badge.rarity === "epic"
                    ? "bg-purple-500"
                    : badge.rarity === "rare"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              />
              <span className="truncate">
                {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
              </span>
            </div>

            <p
              className={`text-sm sm:text-base md:text-lg ${
                selectedTheme.name === "Light"
                  ? "text-gray-600"
                  : "text-gray-300"
              } max-w-xs sm:max-w-sm mx-auto leading-relaxed px-2`}
            >
              {badge.description}
            </p>

            {/* Current Status */}
            <div
              className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg ${
                selectedTheme.name === "Light"
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-blue-900/20 border border-blue-500/30"
              }`}
            >
              <p
                className={`text-xs sm:text-sm font-medium ${
                  selectedTheme.name === "Light"
                    ? "text-blue-700"
                    : "text-blue-300"
                }`}
              >
                🎯 Monthly Leaderboard Elite
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-70 animate-pulse"></div>
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Floating Particles for legendary badge */}
        {badge.rarity === "legendary" && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                animate={{
                  y: [-20, -40, -20],
                  x: [0, Math.random() * 40 - 20, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default BadgeDisplay;
