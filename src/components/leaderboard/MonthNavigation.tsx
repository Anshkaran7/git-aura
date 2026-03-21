import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
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

  return (
    <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
      <button
        onClick={() => onMonthChange("prev")}
        disabled={currentMonth <= LEADERBOARD_LAUNCH_MONTH}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 transition-all hover:border-primary/30 hover:text-primary"
        aria-label="Previous month"
      >
        <HugeIcon icon={ArrowLeft01Icon} size={14} className="text-muted-foreground" />
      </button>
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 shadow-sm">
        <HugeIcon icon={Calendar03Icon} size={14} className="text-primary" />
        <span className="whitespace-nowrap text-[11px] font-semibold text-foreground">
          {formatMonthYear(currentMonth)}
        </span>
      </div>
      <button
        onClick={() => onMonthChange("next")}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentMonth >= getCurrentMonthYear()}
        aria-label="Next month"
      >
        <HugeIcon icon={ArrowRight01Icon} size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}
