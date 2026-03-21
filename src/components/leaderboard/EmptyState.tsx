import { Award01Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";

interface EmptyStateProps {
  view: "monthly" | "alltime";
}

export function EmptyState({ view }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 px-4 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-primary">
        <HugeIcon icon={Award01Icon} size={20} />
      </div>
      <p className="px-4 text-xs leading-5 text-muted-foreground sm:text-sm">
        No other developers found for this{" "}
        {view === "monthly" ? "month" : "period"}.
      </p>
    </div>
  );
}
