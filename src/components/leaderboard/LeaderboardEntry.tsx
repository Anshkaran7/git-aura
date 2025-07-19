import { motion } from "framer-motion";
import { formatNumber, getBadgeColor } from "@/lib/utils2";
import { LeaderboardEntry as LeaderboardEntryType } from "./types";
import { RankIcon } from "./RankIcon";

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  index: number;
  view: "monthly" | "alltime";
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
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20";
      case 2:
        return "from-gray-400/20 to-gray-500/20";
      case 3:
        return "from-amber-600/20 to-amber-700/20";
      default:
        return "from-[#161b21] to-[#0d1117]";
    }
  };

  return (
    <motion.div
      key={`${entry.user.id}-${view}-${currentMonth}-${currentPage}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-lg sm:rounded-xl border border-[#21262d]"
    >
      {entry.rank <= 3 && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
            entry.rank
          )} backdrop-blur-sm`}
        />
      )}

      <div className="relative p-2.5 sm:p-3 md:p-4 bg-[#161b21] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <div className="flex items-center justify-center shrink-0">
              <RankIcon rank={entry.rank} />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
              <a
                href={`/user/${entry.user.github_username}`}
                className="hover:opacity-80 transition-opacity shrink-0"
              >
                <img
                  src={entry.user.avatar_url}
                  alt={entry.user.display_name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-[#30363d]"
                />
              </a>
              <div className="flex flex-col min-w-0 flex-1">
                <a
                  href={`/user/${entry.user.github_username}`}
                  className="font-semibold text-sm sm:text-base text-white hover:underline truncate"
                >
                  {entry.user.display_name}
                </a>
                <a
                  href={`/user/${entry.user.github_username}`}
                  className="text-xs sm:text-sm truncate text-[#7d8590] hover:text-[#e6edf3]"
                >
                  @{entry.user.github_username}
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                <div
                  key={`${entry.user.id}-${badge.id}-${badgeIndex}`}
                  className="relative group cursor-pointer"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${getBadgeColor(
                      badge.rarity
                    )} flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg backdrop-blur-sm`}
                  >
                    {badge.icon}
                  </div>
                  {badge.rank && badge.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                      {badge.rank}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-right">
              <div className="text-base sm:text-lg font-bold text-white">
                {formatNumber(entry.aura)} Aura
              </div>
              {entry.contributions !== undefined && (
                <div className="text-xs sm:text-sm text-[#7d8590]">
                  {formatNumber(entry.contributions)} contributions
                </div>
              )}
              <div className="text-xs sm:text-sm text-[#7d8590]">
                🔥 {entry.user.current_streak} streak
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
