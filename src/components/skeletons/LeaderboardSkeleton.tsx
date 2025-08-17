import React from "react";
import { 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonBadge,
  Skeleton
} from "@/components/ui/skeleton";

interface LeaderboardSkeletonProps {
  count?: number;
}

export function LeaderboardSkeleton({ count = 10 }: LeaderboardSkeletonProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* View Toggle Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Current User Card Skeleton */}
      <SkeletonCard className="relative overflow-hidden rounded-lg p-2 sm:p-3 border border-muted">
        <div className="flex items-center gap-1 mb-2">
          <Skeleton className="w-3 h-3 rounded" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex flex-row items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded" />
            <SkeletonAvatar size="sm" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </SkeletonCard>

      {/* Leaderboard Header */}
      <Skeleton className="h-5 w-32" />

      {/* Leaderboard Entries */}
      <div className="space-y-1.5 sm:space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <LeaderboardEntrySkeleton key={index} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

interface LeaderboardEntrySkeletonProps {
  rank: number;
}

export function LeaderboardEntrySkeleton({ rank }: LeaderboardEntrySkeletonProps) {
  const isTopThree = rank <= 3;
  
  return (
    <div className={`
      flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all
      ${isTopThree 
        ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5' 
        : 'border-border bg-card/50 hover:bg-card/80'
      }
    `}>
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Rank */}
        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 shrink-0">
          {isTopThree ? (
            <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded" />
          ) : (
            <Skeleton className="h-4 w-6 rounded" />
          )}
        </div>

        {/* Avatar */}
        <SkeletonAvatar size="sm" className="shrink-0" />

        {/* User Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <SkeletonText lines={1} widths={["w-20"]} />
            {isTopThree && <SkeletonBadge />}
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Stats */}
      <div className="text-right shrink-0 space-y-1">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-16" />
        {Math.random() > 0.5 && <Skeleton className="h-3 w-14" />}
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg p-2 sm:p-3 border border-muted bg-gradient-to-r from-muted/5 to-muted/10">
      <div className="relative">
        <div className="flex items-center gap-1 mb-2">
          <Skeleton className="w-3 h-3 rounded" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex flex-row items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded" />
            <SkeletonAvatar size="sm" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
