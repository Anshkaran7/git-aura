import { cn } from "@/lib/utils";

interface RankIconProps {
  rank: number;
  className?: string;
}

// Subtle gold / silver / bronze marks for the top 3, plain number otherwise.
const TOP_RANK_STYLES: Record<number, string> = {
  1: "border-gold/40 bg-gold/15 text-gold",
  2: "border-silver/40 bg-silver/15 text-silver",
  3: "border-bronze/40 bg-bronze/15 text-bronze",
};

export function RankIcon({ rank, className }: RankIconProps) {
  const topStyle = TOP_RANK_STYLES[rank];

  if (topStyle) {
    return (
      <span
        className={cn(
          "inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1 text-xs font-semibold tabular-nums",
          topStyle,
          className
        )}
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center text-sm font-medium tabular-nums text-muted-foreground",
        className
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}
