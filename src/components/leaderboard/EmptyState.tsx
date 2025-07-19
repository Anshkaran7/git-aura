import { Trophy } from "lucide-react";

interface EmptyStateProps {
  view: "monthly" | "alltime";
}

export function EmptyState({ view }: EmptyStateProps) {
  return (
    <div className="text-center py-6 sm:py-8">
      <Trophy className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-[#7d8590]" />
      <p className="text-sm sm:text-base text-[#7d8590] px-4">
        No other developers found for this{" "}
        {view === "monthly" ? "month" : "period"}.
      </p>
    </div>
  );
}
