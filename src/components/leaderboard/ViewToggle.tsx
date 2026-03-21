import { Calendar03Icon, GlobeIcon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { ViewType } from "./types";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="grid w-full grid-cols-2 rounded-full border border-border/70 bg-background/70 p-1 shadow-sm sm:w-auto">
      <button
        onClick={() => onViewChange("monthly")}
        className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold transition-all ${
          view === "monthly"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <HugeIcon icon={Calendar03Icon} size={14} />
        Monthly
      </button>
      <button
        onClick={() => onViewChange("alltime")}
        className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold transition-all ${
          view === "alltime"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <HugeIcon icon={GlobeIcon} size={14} />
        All Time
      </button>
    </div>
  );
}
