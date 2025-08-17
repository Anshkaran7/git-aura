import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-800/50", className)}
      {...props}
    />
  )
}

function SkeletonAvatar({
  className,
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "default" | "lg" | "xl"
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    default: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  }

  return (
    <div
      className={cn(
        "animate-pulse rounded-full bg-gray-800/50 shrink-0",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  lines?: number
}) {
  if (lines === 1) {
    return (
      <div
        className={cn("animate-pulse rounded bg-gray-800/50 h-4", className)}
        {...props}
      />
    )
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded bg-gray-800/50 h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-800/50 bg-gray-900/20 p-4 space-y-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SkeletonGrid({
  className,
  rows = 7,
  cols = 53,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number
  cols?: number
}) {
  return (
    <div
      className={cn(
        "bg-[#0d1117] backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 border border-[#21262d] shadow-inner",
        className
      )}
      {...props}
    >
      {/* Month labels skeleton */}
      <div className="grid grid-cols-12 text-xs text-[#7d8590] ml-4 sm:ml-6 mb-1 sm:mb-2 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-6" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="flex gap-[1px] sm:gap-[2px] justify-center w-full overflow-hidden">
        {/* Weekday labels */}
        <div className="flex flex-col gap-[1px] sm:gap-[2px] text-xs text-[#7d8590] pr-1 sm:pr-2 pt-3 sm:pt-4 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[7px] sm:h-[9px] md:h-[11px] w-4" />
          ))}
        </div>

        {/* Contribution squares */}
        {Array.from({ length: cols }).map((_, week) => (
          <div key={week} className="flex flex-col gap-[1px] sm:gap-[2px]">
            {Array.from({ length: rows }).map((_, day) => (
              <Skeleton
                key={day}
                className="w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] md:w-[11px] md:h-[11px] rounded-sm"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend skeleton */}
      <div className="flex items-center justify-end mt-2 sm:mt-3 md:mt-4 gap-2 sm:gap-3">
        <Skeleton className="h-3 w-8" />
        <div className="flex gap-0.5 sm:gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-[7px] h-[7px] sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-sm"
            />
          ))}
        </div>
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  )
}

function SkeletonLeaderboardEntry({
  className,
  showRank = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showRank?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-lg",
        className
      )}
      {...props}
    >
      {/* Rank */}
      {showRank && (
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      )}

      {/* Avatar */}
      <SkeletonAvatar size="default" />

      {/* User Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonText className="w-24 sm:w-32" />
          <Skeleton className="w-12 h-4 rounded-full" />
        </div>
        <SkeletonText className="w-16 sm:w-20 h-3" />
      </div>

      {/* Stats */}
      <div className="text-right space-y-1">
        <SkeletonText className="w-16 h-5" />
        <SkeletonText className="w-12 h-3" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonGrid,
  SkeletonLeaderboardEntry,
}
