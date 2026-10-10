import { ChevronLeft, ChevronRight } from "lucide-react";
import { LEADERBOARD_LAUNCH_MONTH } from "@/lib/leaderboard";
import { getCurrentMonthYear } from "@/lib/utils2";

interface MonthNavigationProps {
  currentMonth: string;
  onMonthChange: (direction: "prev" | "next") => void;
}

export function MonthNavigation({
  currentMonth,
  onMonthChange,
}: MonthNavigationProps) {
  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const buttonClass =
    "flex h-8 w-8 items-center justify-center bg-canvas-subtle text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-canvas-subtle";

  // GitHub-style button group: [<] [Month Year] [>]
  return (
    <div className="inline-flex h-8 w-full items-stretch overflow-hidden rounded-md border border-border sm:w-auto">
      <button
        type="button"
        onClick={() => onMonthChange("prev")}
        disabled={currentMonth <= LEADERBOARD_LAUNCH_MONTH}
        className={`${buttonClass} border-r border-border`}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="flex flex-1 items-center justify-center bg-background px-3 text-sm font-medium whitespace-nowrap text-foreground sm:min-w-36">
        {formatMonthYear(currentMonth)}
      </span>
      <button
        type="button"
        onClick={() => onMonthChange("next")}
        disabled={currentMonth >= getCurrentMonthYear()}
        className={`${buttonClass} border-l border-border`}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
