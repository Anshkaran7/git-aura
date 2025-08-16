import { ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center">
      <button
        onClick={() => onMonthChange("prev")}
        className="p-1 rounded-md touch-manipulation hover:bg-muted active:bg-secondary transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <span className="px-2 py-1 text-xs font-medium text-foreground whitespace-nowrap bg-card backdrop-blur-sm rounded border border-border">
        {formatMonthYear(currentMonth)}
      </span>
      <button
        onClick={() => onMonthChange("next")}
        className="p-1 rounded-md touch-manipulation hover:bg-muted active:bg-secondary transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentMonth >= getCurrentMonthYear()}
      >
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
