import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40",
        className
      )}
      {...props}
    />
  );
}

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20 sm:w-24 sm:h-24",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  widths?: string[];
}

function SkeletonText({ lines = 1, className, widths }: SkeletonTextProps) {
  const defaultWidths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6"];
  
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            widths?.[i] || defaultWidths[i % defaultWidths.length]
          )}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
}

function SkeletonCard({ className, children }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SkeletonGridProps {
  rows?: number;
  cols?: number;
  className?: string;
  cellClassName?: string;
}

function SkeletonGrid({ 
  rows = 7, 
  cols = 53, 
  className, 
  cellClassName 
}: SkeletonGridProps) {
  return (
    <div className={cn("flex gap-[2px] justify-center", className)}>
      {Array.from({ length: cols }).map((_, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-[2px]">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Skeleton
              key={`${colIndex}-${rowIndex}`}
              className={cn(
                "w-[11px] h-[11px] rounded-sm",
                cellClassName
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonButtonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

function SkeletonButton({ size = "md", className }: SkeletonButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-16",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
    />
  );
}

interface SkeletonBadgeProps {
  className?: string;
}

function SkeletonBadge({ className }: SkeletonBadgeProps) {
  return (
    <Skeleton
      className={cn("h-5 w-12 rounded-full", className)}
    />
  );
}

export {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonGrid,
  SkeletonButton,
  SkeletonBadge,
};
