"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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

      // First, let's check if the user exists in the database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, aura_points")
        .eq("id", userId)
        .single();

      if (userError) {
        console.log("User not found in database:", userError);
        // User doesn't exist in leaderboard yet
        setBadge(null);
        return;
      }

      console.log("Found user data:", userData);

      // Fetch current leaderboard to get user's position
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("users")
        .select("id, aura_points")
        .not("aura_points", "is", null)
        .order("aura_points", { ascending: false });

      if (leaderboardError) {
        console.error("Leaderboard query error:", leaderboardError);
        throw leaderboardError;
      }

      console.log("Leaderboard data:", leaderboardData?.slice(0, 5)); // Log first 5 users

      // Find user's position in the leaderboard
      const position =
        leaderboardData?.findIndex((user) => user.id === userId) + 1;

      console.log("User position:", position);

      if (position && position > 0) {
        setUserPosition(position);
        setBadge(generatePositionBadge(position));
      } else {
        // User not found in leaderboard
        setBadge(null);
      }
    } catch (error) {
      console.error("Error fetching user position:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      // Show a default badge for errors
      setBadge({
        id: "error",
        name: "Join the Game",
        description: "Start contributing to join the leaderboard!",
        icon: <Star className="w-8 h-8" />,
        color: "from-gray-400 to-gray-600",
        rarity: "common",
        position: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePositionBadge = (position: number): PositionBadge => {
    if (position === 1) {
      return {
        id: "first-place",
        name: "Champion",
        description: "Current #1 on the leaderboard! 🏆",
        icon: <Trophy className="w-8 h-8" />,
        color: "from-yellow-400 to-yellow-600",
        rarity: "legendary",
        position: 1,
      };
    } else if (position === 2) {
      return {
        id: "second-place",
        name: "Runner-up",
        description: "Holding strong at #2! 🥈",
        icon: <Medal className="w-8 h-8" />,
        color: "from-gray-300 to-gray-500",
        rarity: "epic",
        position: 2,
      };
    } else if (position === 3) {
      return {
        id: "third-place",
        name: "Bronze Medalist",
        description: "Solid #3 position! 🥉",
        icon: <Award className="w-8 h-8" />,
        color: "from-orange-400 to-orange-600",
        rarity: "rare",
        position: 3,
      };
    } else if (position <= 10) {
      return {
        id: "top-ten",
        name: "Top 10",
        description: `Elite top ${position} performer! ⭐`,
        icon: <Star className="w-8 h-8" />,
        color: "from-blue-400 to-blue-600",
        rarity: "rare",
        position: position,
      };
    } else {
      return {
        id: "participant",
        name: "Participant",
        description: `Currently ranked #${position}`,
        icon: <Award className="w-8 h-8" />,
        color: "from-gray-400 to-gray-600",
        rarity: "common",
        position: position,
      };
    }
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className={`text-center py-20 ${
            selectedTheme.name === "Light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Join the Leaderboard!</p>
          <p className="text-sm">
            Connect your GitHub and contribute code to earn a position badge!
          </p>
          <div className="mt-4 text-xs opacity-75">
            Your badge will appear here once you're on the leaderboard
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="relative"
      >
        {/* Badge Container */}
        <div
          className={`relative p-8 ${
            selectedTheme.cardBackground
          } rounded-3xl border-4 ${getRarityColor(
            badge.rarity
          )} shadow-2xl ${getRarityGlow(badge.rarity)} backdrop-blur-sm`}
        >
          {/* Position Number (Top Right) */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-white font-bold text-lg">
              #{badge.position}
            </span>
          </div>

          {/* Badge Icon */}
          <div
            className={`w-32 h-32 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center mb-6 mx-auto shadow-xl`}
          >
            <div className="text-white">{badge.icon}</div>
          </div>

          {/* Badge Info */}
          <div className="text-center">
            <h2
              className={`text-2xl font-bold mb-2 ${
                selectedTheme.name === "Light" ? "text-gray-800" : "text-white"
              }`}
            >
              {badge.name}
            </h2>

            {/* Rarity */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${
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
                className={`w-2 h-2 rounded-full ${
                  badge.rarity === "legendary"
                    ? "bg-yellow-500"
                    : badge.rarity === "epic"
                    ? "bg-purple-500"
                    : badge.rarity === "rare"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              />
              {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
            </div>

            <p
              className={`text-lg ${
                selectedTheme.name === "Light"
                  ? "text-gray-600"
                  : "text-gray-300"
              } max-w-sm mx-auto leading-relaxed`}
            >
              {badge.description}
            </p>

            {/* Current Status */}
            <div
              className={`mt-4 p-3 rounded-lg ${
                selectedTheme.name === "Light"
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-blue-900/20 border border-blue-500/30"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  selectedTheme.name === "Light"
                    ? "text-blue-700"
                    : "text-blue-300"
                }`}
              >
                🎯 Current Leaderboard Position
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

        {/* Floating Particles */}
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
