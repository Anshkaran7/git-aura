import React from "react";
import { 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonButton,
  SkeletonGrid,
  Skeleton
} from "@/components/ui/skeleton";

export function ProfileCardSkeleton() {
  return (
    <div className="bg-card backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border mx-1 sm:mx-0">
      {/* Browser Window Controls */}
      <div className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-background backdrop-blur-sm border-b border-border">
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/90" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/90" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/90" />
        </div>
        <div className="flex-1 flex items-center justify-center mx-2 sm:mx-auto">
          <Skeleton className="h-6 w-32 sm:w-40 rounded-md" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <SkeletonButton size="sm" className="w-8 h-8" />
          <SkeletonButton size="sm" className="w-8 h-8" />
          <SkeletonButton size="sm" className="w-8 h-8" />
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-b from-card to-background">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
            <SkeletonAvatar size="xl" />
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
              <SkeletonText lines={1} widths={["w-32"]} />
              <SkeletonText lines={1} widths={["w-24"]} />
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right w-full sm:w-auto">
            <Skeleton className="h-6 w-16 mb-1 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-20 mx-auto sm:mx-0" />
          </div>
        </div>

        {/* Bio Skeleton */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
            <Skeleton className="w-4 h-4 rounded shrink-0" />
            <SkeletonText lines={2} widths={["w-full", "w-3/4"]} />
          </div>
        </div>

        {/* Contribution Section */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-4">
            <SkeletonText lines={1} widths={["w-48"]} />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Contribution Grid Skeleton */}
          <div className="w-full flex justify-center">
            <div className="bg-card backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 border border-border shadow-inner max-w-full">
              <div className="w-full overflow-hidden">
                {/* Month labels skeleton */}
                <div className="grid grid-cols-12 text-xs text-muted-foreground ml-4 sm:ml-6 mb-1 sm:mb-2 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-6" />
                  ))}
                </div>
                
                {/* Grid skeleton */}
                <div className="pb-2 w-full overflow-hidden">
                  <div className="flex gap-[2px] justify-center">
                    {/* Weekday labels */}
                    <div className="flex flex-col gap-[2px] text-xs text-muted-foreground pr-1 sm:pr-2 pt-3 sm:pt-4 shrink-0">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-[11px] w-6" />
                      ))}
                    </div>
                    
                    {/* Contribution squares */}
                    <SkeletonGrid rows={7} cols={53} cellClassName="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px]" />
                  </div>
                </div>
              </div>
              
              {/* Legend skeleton */}
              <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-3 md:mt-4 gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Skeleton className="h-3 w-8" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-2 h-2 rounded-sm" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
