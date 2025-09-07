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
        return <Medal className="w-4 h-4 text-slate-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">
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
      className={`relative overflow-hidden rounded-xl border ${
        isCurrentUser
          ? "border-yellow-500/40 ring-1 ring-yellow-500/40 shadow-[0_0_0_3px_rgba(234,179,8,0.08)]"
          : "border-border"
      } bg-card/60 hover:bg-card/80 backdrop-blur supports-backdrop-blur:backdrop-blur-md transition-colors duration-200`}
    >
      {/* Gradient Background for Top 3 */}
      {entry.rank <= 3 && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
            entry.rank
          )} backdrop-blur-sm`}
        />
      )}

      <div className="relative p-3 sm:p-4">
        <div className="flex sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Rank */}
            <div className="flex items-center justify-center shrink-0 rounded-full border border-border/60 bg-muted/30 w-7 h-7 sm:w-8 sm:h-8">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar and Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
              <a
                href={`/user/${entry.user.github_username}`}
                className="hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full transition-all shrink-0"
              >
                <img
                  src={entry.user.avatar_url}
                  alt={entry.user.display_name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-1 ring-border"
                />
              </a>
              <div className="flex flex-col min-w-0 flex-1">
                <a
                  href={`/user/${entry.user.github_username}`}
                  className="font-semibold text-sm sm:text-base text-foreground hover:underline truncate"
                >
                  {entry.user.display_name}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 align-middle">
                      You
                    </span>
                  )}
                </a>
                <a
                  href={`/user/${entry.user.github_username}`}
                  className="text-xs sm:text-sm truncate text-muted-foreground hover:text-foreground"
                >
                  @{entry.user.github_username}
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Stats */}
            <div className="text-right">
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-foreground">
                {formatNumber(entry.aura)}{" "}
                <span className="font-semibold text-muted-foreground">
                  Aura
                </span>
              </div>
              {entry.contributions !== undefined && (
                <div className="text-[11px] sm:text-xs text-muted-foreground">
                  {formatNumber(entry.contributions)} contributions
                </div>
              )}
              <div className="text-[11px] sm:text-xs text-muted-foreground">
                🔥 {entry.user.current_streak} streak
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
