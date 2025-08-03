import { Calendar, Globe } from "lucide-react";
import { ViewType } from "./types";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-[#161b21] rounded-md p-1 border border-[#21262d] w-full sm:w-auto">
      <button
        onClick={() => onViewChange("monthly")}
        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-all ${
          view === "monthly"
            ? "bg-[#39d353] text-black"
            : "text-[#7d8590] hover:text-white"
        }`}
      >
        <Calendar className="w-3 h-3 inline mr-1" />
        Monthly
      </button>
      <button
        onClick={() => onViewChange("alltime")}
        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-all ${
          view === "alltime"
            ? "bg-[#39d353] text-black"
            : "text-[#7d8590] hover:text-white"
        }`}
      >
        <Globe className="w-3 h-3 inline mr-1" />
        All Time
      </button>
    </div>
  );
}
