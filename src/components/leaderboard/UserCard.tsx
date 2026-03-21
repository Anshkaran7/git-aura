import { motion } from "framer-motion";
import {
  AiUserIcon,
  FireIcon,
  GitCommitIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { formatNumber } from "@/lib/utils2";
import { LeaderboardEntry } from "./types";
import { RankIcon } from "./RankIcon";
import { HugeIcon } from "@/components/ui/huge-icon";

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
      className={`relative overflow-hidden rounded-3xl border p-3 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] ${
        userOutOfTop100
          ? "border-orange-500/30 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_35%),linear-gradient(135deg,rgba(251,146,60,0.12),rgba(15,23,42,0.78))]"
          : "border-emerald-500/30 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_35%),linear-gradient(135deg,rgba(14,165,233,0.08),rgba(15,23,42,0.78))]"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
      <div className="relative space-y-3">
        <div className="flex items-center gap-1.5">
          <HugeIcon icon={SparklesIcon} size={14} className="text-primary" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {username}'s Position
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RankIcon rank={currentUser.rank} />
            <img
              src={currentUser.user.avatar_url}
              alt={currentUser.user.display_name}
              className="h-9 w-9 rounded-full border border-white/15 object-cover ring-2 ring-primary/20"
            />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {currentUser.user.display_name}
              </h3>
              <p className="truncate text-[11px] text-muted-foreground">
                @{currentUser.user.github_username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-semibold text-foreground">
              #{currentUser.rank}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {formatNumber(currentUser.aura)} Aura
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
            <HugeIcon icon={AiUserIcon} size={13} className="text-primary" />
            Top profile spotlight
          </div>
          {currentUser.contributions !== undefined ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
              <HugeIcon icon={GitCommitIcon} size={13} className="text-emerald-300" />
              {formatNumber(currentUser.contributions)} contributions
            </div>
          ) : null}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
            <HugeIcon icon={FireIcon} size={13} className="text-orange-300" />
            {currentUser.user.current_streak} day streak
          </div>
        </div>

        {userOutOfTop100 && (
          <div className="flex items-start gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/8 p-3">
            <HugeIcon icon={SparklesIcon} size={16} className="mt-0.5 text-orange-300" />
            <div>
              <h3 className="text-xs font-semibold text-orange-100">
                Outside the top 100 for now
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-orange-200/80">
                Keep stacking commits and consistency. Your full rank is still
                tracked, and a few strong weeks can move this card fast.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
