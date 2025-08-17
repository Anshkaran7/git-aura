import React from "react";
import { SkeletonCard, SkeletonAvatar, SkeletonText, Skeleton } from "@/components/ui/skeleton";

export function BadgeDisplaySkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-3 sm:px-4">
      <SkeletonCard className="max-w-md w-full text-center p-6 sm:p-8">
        {/* Badge Icon Skeleton */}
        <div className="relative mb-4 sm:mb-6 flex justify-center">
          <div className="relative">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full" />
            {/* Glow effect skeleton */}
            <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-muted/20 to-muted/40" />
          </div>
        </div>

        {/* Badge Title */}
        <div className="mb-3 sm:mb-4">
          <Skeleton className="h-6 sm:h-7 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>

        {/* Badge Description */}
        <div className="mb-4 sm:mb-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>

        {/* Badge Metadata */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </SkeletonCard>
    </div>
  );
}

export function BadgeCardSkeleton() {
  return (
    <div className="relative group">
      <SkeletonCard className="p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300">
        {/* Badge Icon */}
        <div className="mb-3 sm:mb-4 flex justify-center">
          <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-full" />
        </div>

        {/* Badge Name */}
        <Skeleton className="h-5 w-24 mx-auto mb-2" />

        {/* Badge Description */}
        <div className="mb-3 space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3 mx-auto" />
        </div>

        {/* Badge Rarity */}
        <Skeleton className="h-4 w-16 mx-auto rounded-full" />
      </SkeletonCard>
    </div>
  );
}

export function BadgeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BadgeCardSkeleton key={i} />
      ))}
    </div>
  );
}
