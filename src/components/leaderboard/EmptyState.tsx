import { Trophy } from "lucide-react";

interface EmptyStateProps {
  view: "monthly" | "alltime";
}

export function EmptyState({ view }: EmptyStateProps) {
  return (
    <div className="px-4 py-12 text-center">
      <Trophy className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
      <h3 className="text-base font-semibold text-foreground">No rankings yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        No developers found for this {view === "monthly" ? "month" : "period"}.
      </p>
    </div>
  );
}
