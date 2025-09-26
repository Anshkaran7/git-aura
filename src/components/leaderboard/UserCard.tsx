import { motion } from "framer-motion";
import { Star, HeartHandshake } from "lucide-react";
import { formatNumber, getBadgeColor } from "@/lib/utils2";
import { LeaderboardEntry } from "./types";
import { RankIcon } from "./RankIcon";

interface UserCardProps {
  currentUser: LeaderboardEntry;
  userOutOfTop100: boolean;
  username: string;
}

export function UserCard({
  currentUser,
  userOutOfTop100,
  username,
}: UserCardProps) {
  if (!currentUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-xl p-3 sm:p-4 border transition-colors duration-200 ${
        userOutOfTop100
          ? "border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-950/30 dark:to-red-950/20"
          : "border-emerald-400/40 bg-gradient-to-r from-emerald-400/10 to-emerald-600/10 dark:from-emerald-900/20 dark:to-emerald-950/10"
      }`}
    >
      {!userOutOfTop100 && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-emerald-600/10 pointer-events-none" />
      )}
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {username}'s position
          </span>
        </div>
        <div className="flex flex-row items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <RankIcon rank={currentUser.rank} />
            <img
              src={currentUser.user.avatar_url}
              alt={currentUser.user.display_name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-1 ring-emerald-500/40"
            />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {currentUser.user.display_name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                @{currentUser.user.github_username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
              #{currentUser.rank}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {formatNumber(currentUser.aura)}{" "}
              <span className="font-medium">Aura</span>
            </div>
            {currentUser.contributions !== undefined && (
              <div className="text-[11px] sm:text-xs text-muted-foreground">
                {formatNumber(currentUser.contributions)} contributions
              </div>
            )}
          </div>
        </div>

        {userOutOfTop100 && (
          <div className="flex items-start gap-2.5 pt-3 border-t border-orange-500/30 dark:border-orange-500/20">
            <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-orange-200 mb-1">
                Time to level up
              </h3>
              <p className="text-xs text-orange-300/90 leading-relaxed">
                You are outside the top 100. Contribute consistently to climb
                the board. Every commit counts.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
