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
      className={`relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 ${
        userOutOfTop100
          ? "border-2 border-orange-500 bg-gradient-to-r from-orange-900/20 to-red-900/20"
          : "border-2 border-[#39d353] bg-gradient-to-r from-[#161b21] to-[#0d1117]"
      }`}
    >
      {!userOutOfTop100 && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#39d353]/10 to-[#26a641]/10"></div>
      )}
      <div className="relative">
        {userOutOfTop100 ? (
          <div className="flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-orange-200 mb-1">
                Time to Level Up! 💪
              </h3>
              <p className="text-xs sm:text-sm text-orange-300/90 leading-relaxed">
                @{username} is currently ranked #{currentUser.rank}. The top 100
                developers are crushing it! Start contributing more, maintain
                consistency, and climb your way up. Every commit counts toward
                your coding journey! 🚀
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#39d353]" />
              <span className="text-xs sm:text-sm font-medium text-[#39d353]">
                {username}'s Position
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <RankIcon rank={currentUser.rank} />
                <img
                  src={currentUser.user.avatar_url}
                  alt={currentUser.user.display_name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-[#39d353]"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentUser.user.display_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7d8590]">
                    @{currentUser.user.github_username}
                  </p>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  #{currentUser.rank}
                </div>
                <div className="text-xs sm:text-sm text-[#7d8590]">
                  {formatNumber(currentUser.aura)} Aura
                </div>
                {currentUser.contributions !== undefined && (
                  <div className="text-[10px] sm:text-xs text-[#7d8590]">
                    {formatNumber(currentUser.contributions)} contributions
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
