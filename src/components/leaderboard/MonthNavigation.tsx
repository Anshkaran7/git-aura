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
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
      <button
        onClick={() => onMonthChange("prev")}
        className="p-1.5 rounded-md touch-manipulation hover:bg-[#21262d] active:bg-[#161b21] transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-4 h-4 text-[#7d8590]" />
      </button>
      <span className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap bg-[#0d1117] backdrop-blur-sm rounded border border-[#21262d]">
        {formatMonthYear(currentMonth)}
      </span>
      <button
        onClick={() => onMonthChange("next")}
        className="p-1.5 rounded-md touch-manipulation hover:bg-[#21262d] active:bg-[#161b21] transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentMonth >= getCurrentMonthYear()}
      >
        <ChevronRight className="w-4 h-4 text-[#7d8590]" />
      </button>
    </div>
  );
}
