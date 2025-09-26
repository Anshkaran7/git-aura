import React from "react";
import { SkeletonGrid, Skeleton } from "@/components/ui/skeleton";

export function ContributionGridSkeleton() {
  return (
    <div className="w-full flex justify-center">
      <div className="bg-card backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 border border-border shadow-inner max-w-full">
        <div className="w-full overflow-hidden">
          {/* Month labels skeleton */}
          <div className="grid grid-cols-12 text-xs text-muted-foreground ml-4 sm:ml-6 mb-1 sm:mb-2 gap-2 overflow-hidden max-w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-6" />
            ))}
          </div>
          
          {/* Grid skeleton */}
          <div className="pb-2 w-full overflow-hidden">
            <div className="flex gap-[1px] sm:gap-[2px] justify-center w-full overflow-hidden">
              {/* Weekday labels */}
              <div className="flex flex-col gap-[1px] sm:gap-[2px] text-xs text-muted-foreground pr-1 sm:pr-2 pt-3 sm:pt-4 shrink-0">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-[7px] sm:h-[9px] md:h-[11px] flex items-center">
                    <Skeleton className="h-2 w-6" />
                  </div>
                ))}
              </div>
              
              {/* Contribution squares */}
              <SkeletonGrid 
                rows={7} 
                cols={53} 
                cellClassName="w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] md:w-[11px] md:h-[11px] rounded-sm"
                className="gap-[1px] sm:gap-[2px]"
              />
            </div>
          </div>
        </div>
        
        {/* Legend skeleton */}
        <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-3 md:mt-4 gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            <Skeleton className="h-3 w-8" />
            <div className="flex gap-0.5 sm:gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-[7px] h-[7px] sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-sm" />
              ))}
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MonthlyContributionSkeleton() {
  return (
    <div className="w-full bg-card backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/50">
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Monthly Grid */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square">
              <Skeleton className="w-full h-full rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuraPanelSkeleton() {
  return (
    <div className="w-full bg-card backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      {/* Toggle and Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="w-6 h-6 rounded" />
        </div>
      </div>

      {/* Main Aura Display */}
      <div className="text-center mb-6 sm:mb-8">
        <Skeleton className="h-12 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto mb-4" />
        <Skeleton className="h-16 w-48 mx-auto rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="text-center p-3 rounded-lg bg-muted/20 border border-border/50">
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* AI Message */}
      <div className="border border-border rounded-lg p-4 bg-muted/10">
        <div className="flex items-start gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
