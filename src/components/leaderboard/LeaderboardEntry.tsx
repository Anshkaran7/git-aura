import Link from "next/link";
import { Flame } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { formatNumber } from "@/lib/utils2";
import { cn } from "@/lib/utils";
import { ViewType, LeaderboardEntry as LeaderboardEntryType } from "./types";
import { RankIcon } from "./RankIcon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { BadgeIcon } from "@/components/badges/BadgeIcon";

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  index: number;
  view: ViewType;
  currentMonth: string;
  currentPage: number;
  /** Force the "current user" highlight (e.g. the profile being viewed). */
  highlighted?: boolean;
}

export function LeaderboardEntry({ entry, highlighted }: LeaderboardEntryProps) {
  const { userId } = useAuth();
  const profileHref = `/user/${encodeURIComponent(entry.user.github_username)}`;
  const isCurrentUser = userId === entry.user.id;
  const isHighlighted = isCurrentUser || Boolean(highlighted);
  const visibleBadges = entry.badges.slice(0, 3);
  const hiddenBadgeCount = entry.badges.length - visibleBadges.length;

  return (
    <div
      className={cn(
        "gh-box-row flex items-center gap-3 px-3 sm:px-4",
        isHighlighted
          ? "bg-accent-subtle shadow-[inset_2px_0_0_var(--link)]"
          : "hover:bg-canvas-subtle"
      )}
    >
      <div className="flex w-7 shrink-0 justify-center">
        <RankIcon rank={entry.rank} />
      </div>

      <Link href={profileHref} className="shrink-0" tabIndex={-1} aria-hidden="true">
        <UserAvatar
          src={entry.user.avatar_url}
          githubUsername={entry.user.github_username}
          displayName={entry.user.display_name}
          alt={entry.user.display_name}
          className="h-8 w-8 border border-border"
          initialsClassName="text-[10px]"
          size={64}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={profileHref}
            className="truncate text-sm font-semibold text-foreground hover:text-link hover:underline"
          >
            {entry.user.display_name}
          </Link>
          {isHighlighted ? (
            <span className="gh-label shrink-0 border-link/40 text-link">
              {isCurrentUser ? "You" : "Viewing"}
            </span>
          ) : null}
        </div>
        <span className="truncate text-xs text-muted-foreground sm:text-sm">
          @{entry.user.github_username}
        </span>
      </div>

      {entry.badges.length > 0 ? (
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {visibleBadges.map((badge, badgeIndex) => (
            <span
              key={`${entry.user.id}-${badge.id}-${badge.month_year || "none"}-${badge.rank || "no-rank"}-${badgeIndex}`}
              title={`${badge.name}: ${badge.description}`}
              className="inline-flex"
            >
              <BadgeIcon
                icon={badge.icon}
                name={badge.name}
                className="h-6 w-6 text-sm"
              />
            </span>
          ))}
          {hiddenBadgeCount > 0 ? (
            <span className="gh-counter">+{hiddenBadgeCount}</span>
          ) : null}
        </div>
      ) : null}

      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
        {entry.contributions !== undefined ? (
          <span className="hidden text-xs text-muted-foreground tabular-nums md:inline">
            {formatNumber(entry.contributions)} contributions
          </span>
        ) : null}
        <span
          className="gh-label tabular-nums"
          title={`${entry.user.current_streak} day streak`}
        >
          <Flame className="h-3 w-3 text-bronze" />
          {entry.user.current_streak}
          <span className="hidden sm:inline">day streak</span>
        </span>
        <span className="min-w-[4.5rem] text-right text-sm whitespace-nowrap">
          <span className="font-semibold tabular-nums text-foreground">
            {formatNumber(entry.aura)}
          </span>{" "}
          <span className="text-xs text-muted-foreground">aura</span>
        </span>
      </div>
    </div>
  );
}
