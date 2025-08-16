import { Calendar, Globe } from "lucide-react";
import { ViewType } from "./types";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-muted rounded-md p-1 border border-border w-full sm:w-auto">
      <button
        onClick={() => onViewChange("monthly")}
        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-all ${
          view === "monthly"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Calendar className="w-3 h-3 inline mr-1" />
        Monthly
      </button>
      <button
        onClick={() => onViewChange("alltime")}
        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-all ${
          view === "alltime"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Globe className="w-3 h-3 inline mr-1" />
        All Time
      </button>
    </div>
  );
}
