import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import { formatNumber, getBadgeColor } from "@/lib/utils2";
import { ViewType, LeaderboardEntry as LeaderboardEntryType } from "./types";
import { useAuth } from "@clerk/nextjs";

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  index: number;
  view: ViewType;
  currentMonth: string;
  currentPage: number;
}

export function LeaderboardEntry({
  entry,
  index,
  view,
  currentMonth,
  currentPage,
}: LeaderboardEntryProps) {
  const { userId } = useAuth();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-300">
            {rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400/20 to-yellow-600/20";
      case 2:
        return "from-gray-300/20 to-gray-500/20";
      case 3:
        return "from-amber-500/20 to-amber-700/20";
      default:
        return "from-gray-800/20 to-gray-900/20";
    }
  };

  const isCurrentUser = userId === entry.user.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative overflow-hidden rounded-lg border ${
        isCurrentUser
          ? "border-yellow-500/50 ring-1 ring-yellow-500/50"
          : "border-gray-700/50"
      }`}
    >
      {/* Gradient Background for Top 3 */}
      {entry.rank <= 3 && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
            entry.rank
          )} backdrop-blur-sm`}
        />
      )}

      <div className="relative p-2 sm:p-3 bg-gray-900/40 backdrop-blur-xl">
        <div className="flex sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Rank */}
            <div className="flex items-center justify-center shrink-0">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar and Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
              <a
                href={`/user/${entry.user.github_username}`}
                className="hover:opacity-80 transition-opacity shrink-0"
              >
                <img
                  src={entry.user.avatar_url}
                  alt={entry.user.display_name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full ring-1 ring-gray-600/50"
                />
              </a>
              <div className="flex flex-col min-w-0 flex-1">
                <a
                  href={`/user/${entry.user.github_username}`}
                  className="font-semibold text-xs sm:text-sm text-white hover:underline truncate"
                >
                  {entry.user.display_name}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs text-yellow-500">(You)</span>
                  )}
                </a>
                <a
                  href={`/user/${entry.user.github_username}`}
                  className="text-xs truncate text-gray-400 hover:text-gray-200"
                >
                  @{entry.user.github_username}
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Stats */}
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold text-white">
                {formatNumber(entry.aura)} Aura
              </div>
              {entry.contributions !== undefined && (
                <div className="text-xs text-gray-400">
                  {formatNumber(entry.contributions)} contributions
                </div>
              )}
              <div className="text-xs text-gray-400">
                🔥 {entry.user.current_streak} streak
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
