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
import { UserAvatar } from "@/components/ui/user-avatar";
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
        return "from-amber-100/90 via-amber-50/80 to-white/70 dark:from-yellow-400/20 dark:to-yellow-600/20";
      case 2:
        return "from-zinc-100/90 via-zinc-50/80 to-white/70 dark:from-gray-300/20 dark:to-gray-500/20";
      case 3:
        return "from-orange-100/90 via-orange-50/80 to-white/70 dark:from-amber-500/20 dark:to-amber-700/20";
      default:
        return "from-transparent to-transparent";
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
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),transparent_42%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
      {entry.rank <= 3 ? (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getRankColor(
            entry.rank
          )} opacity-80`}
        />
      ) : null}

      <div className="relative flex flex-col gap-3 bg-card/95 p-3 backdrop-blur-xl dark:bg-card/85 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center justify-center shrink-0">
            {getRankIcon(entry.rank)}
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <Link href={profileHref} className="shrink-0 transition-opacity hover:opacity-85">
              <UserAvatar
                src={entry.user.avatar_url}
                githubUsername={entry.user.github_username}
                displayName={entry.user.display_name}
                alt={entry.user.display_name}
                className="h-10 w-10 ring-2 ring-background/60"
                initialsClassName="text-[10px]"
                size={80}
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
                <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/85 px-2 py-1 text-[10px] font-medium text-secondary-foreground dark:border-border/70 dark:bg-background/80 dark:text-muted-foreground">
                  <HugeIcon icon={GitCommitIcon} size={12} className="text-emerald-400" />
                  {formatNumber(entry.contributions)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/85 px-2 py-1 text-[10px] font-medium text-secondary-foreground dark:border-border/70 dark:bg-background/80 dark:text-muted-foreground">
                <HugeIcon icon={FireIcon} size={12} className="text-orange-500 dark:text-orange-400" />
                {entry.user.current_streak} streak
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
