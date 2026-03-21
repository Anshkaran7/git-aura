import { motion } from "framer-motion";
import Link from "next/link";
import {
  FireIcon,
  GitCommitIcon,
  MedalFirstPlaceIcon,
  MedalSecondPlaceIcon,
  MedalThirdPlaceIcon,
} from "@hugeicons/core-free-icons";
import { formatNumber, getBadgeColor } from "@/lib/utils2";
import { ViewType, LeaderboardEntry as LeaderboardEntryType } from "./types";
import { useAuth } from "@clerk/nextjs";
import { HugeIcon } from "@/components/ui/huge-icon";
import { BadgeIcon } from "@/components/badges/BadgeIcon";

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
  const profileHref = `/user/${encodeURIComponent(entry.user.github_username)}`;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <HugeIcon icon={MedalFirstPlaceIcon} size={18} className="text-amber-400" />;
      case 2:
        return <HugeIcon icon={MedalSecondPlaceIcon} size={18} className="text-slate-300" />;
      case 3:
        return <HugeIcon icon={MedalThirdPlaceIcon} size={18} className="text-orange-400" />;
      default:
        return (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background/80 text-[10px] font-semibold text-muted-foreground shadow-sm">
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
      className={`relative overflow-hidden rounded-2xl border transition-colors ${
        isCurrentUser
          ? "border-primary/45 ring-1 ring-primary/30"
          : "border-border/70"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
      {entry.rank <= 3 ? (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
            entry.rank
          )} opacity-80`}
        />
      ) : null}

      <div className="relative flex flex-col gap-3 bg-card/85 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center justify-center shrink-0">
            {getRankIcon(entry.rank)}
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <Link href={profileHref} className="shrink-0 transition-opacity hover:opacity-85">
              <img
                src={entry.user.avatar_url}
                alt={entry.user.display_name}
                className="h-10 w-10 rounded-full border border-white/15 object-cover ring-2 ring-background/60"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={profileHref}
                  className="truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {entry.user.display_name}
                </Link>
                {isCurrentUser ? (
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    You
                  </span>
                ) : null}
              </div>
              <Link
                href={profileHref}
                className="truncate text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                @{entry.user.github_username}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <div className="flex items-center gap-1">
            {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
              <div
                key={`${entry.user.id}-${badge.id}-${badge.month_year || "none"}-${badge.rank || "no-rank"}-${badgeIndex}`}
                className={`flex h-7 min-w-7 items-center justify-center rounded-full bg-gradient-to-br ${getBadgeColor(
                  badge.rarity
                )} px-2 text-[10px] font-semibold text-white shadow-sm`}
                title={`${badge.name}: ${badge.description}`}
              >
                <BadgeIcon
                  icon={badge.icon}
                  name={badge.name}
                  className="h-5 w-5"
                  imageClassName="drop-shadow-sm"
                />
              </div>
            ))}
            {entry.badges.length > 2 ? (
              <div className="flex h-7 min-w-7 items-center justify-center rounded-full border border-border/70 bg-background/80 px-1.5 text-[10px] font-semibold text-muted-foreground">
                +{entry.badges.length - 2}
              </div>
            ) : null}
          </div>

          <div className="grid gap-1 text-right">
            <div className="text-sm font-semibold text-foreground">
              {formatNumber(entry.aura)} Aura
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {entry.contributions !== undefined ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  <HugeIcon icon={GitCommitIcon} size={12} className="text-emerald-400" />
                  {formatNumber(entry.contributions)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <HugeIcon icon={FireIcon} size={12} className="text-orange-400" />
                {entry.user.current_streak} streak
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
