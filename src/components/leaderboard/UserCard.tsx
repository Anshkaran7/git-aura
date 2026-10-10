import { Flame } from "lucide-react";
import { formatNumber } from "@/lib/utils2";
import { LeaderboardEntry } from "./types";
import { RankIcon } from "./RankIcon";
import { UserAvatar } from "@/components/ui/user-avatar";

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
    <div className="gh-box">
      <div className="gh-box-header py-2">
        <h2 className="text-sm font-semibold text-foreground">
          {username ? `${username}'s position` : "Your position"}
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          Rank #{currentUser.rank}
        </span>
      </div>
      <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
        <div className="flex w-7 shrink-0 justify-center">
          <RankIcon rank={currentUser.rank} />
        </div>
        <UserAvatar
          src={currentUser.user.avatar_url}
          githubUsername={currentUser.user.github_username}
          displayName={currentUser.user.display_name}
          alt={currentUser.user.display_name}
          className="h-8 w-8 border border-border"
          initialsClassName="text-[10px]"
          size={64}
        />
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {currentUser.user.display_name}
          </span>
          <span className="truncate text-xs text-muted-foreground sm:text-sm">
            @{currentUser.user.github_username}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          {currentUser.contributions !== undefined ? (
            <span className="hidden text-xs text-muted-foreground tabular-nums md:inline">
              {formatNumber(currentUser.contributions)} contributions
            </span>
          ) : null}
          <span className="gh-label tabular-nums">
            <Flame className="h-3 w-3 text-bronze" />
            {currentUser.user.current_streak}
            <span className="hidden sm:inline">day streak</span>
          </span>
          <span className="min-w-[4.5rem] text-right text-sm whitespace-nowrap">
            <span className="font-semibold tabular-nums text-foreground">
              {formatNumber(currentUser.aura)}
            </span>{" "}
            <span className="text-xs text-muted-foreground">aura</span>
          </span>
        </div>
      </div>
      {userOutOfTop100 ? (
        <div className="border-t border-border-muted bg-attention-subtle px-4 py-2.5 text-xs text-attention">
          Outside the top 100 for now. Your full rank is still tracked — keep
          the commits coming.
        </div>
      ) : null}
    </div>
  );
}
