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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-lg p-2 sm:p-3 ${
        userOutOfTop100
          ? "border border-orange-500 bg-gradient-to-r from-orange-900/20 to-red-900/20"
          : "border border-[#39d353] bg-gradient-to-r from-[#161b21] to-[#0d1117]"
      }`}
    >
      {!userOutOfTop100 && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#39d353]/10 to-[#26a641]/10"></div>
      )}
      <div className="relative">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 text-[#39d353]" />
          <span className="text-xs font-medium text-[#39d353]">
            {username}'s Position
          </span>
        </div>
        <div className="flex flex-row items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <RankIcon rank={currentUser.rank} />
            <img
              src={currentUser.user.avatar_url}
              alt={currentUser.user.display_name}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full ring-1 ring-[#39d353]"
            />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {currentUser.user.display_name}
              </h3>
              <p className="text-xs text-[#7d8590]">
                @{currentUser.user.github_username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base font-bold text-white">
              #{currentUser.rank}
            </div>
            <div className="text-xs text-[#7d8590]">
              {formatNumber(currentUser.aura)} Aura
            </div>
            {currentUser.contributions !== undefined && (
              <div className="text-[10px] text-[#7d8590]">
                {formatNumber(currentUser.contributions)} contributions
              </div>
            )}
          </div>
        </div>

        {userOutOfTop100 && (
          <div className="flex items-start gap-2 pt-2 border-t border-orange-500/20">
            <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-orange-200 mb-1">
                Time to Level Up! 💪
              </h3>
              <p className="text-xs text-orange-300/90 leading-relaxed">
                You are not in the top 100. The top 100 developers are crushing
                it! Start contributing more, maintain consistency, and climb
                your way up. Every commit counts toward your coding journey! 🚀
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
