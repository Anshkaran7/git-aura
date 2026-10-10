import { ViewType } from "./types";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

const OPTIONS: { value: ViewType; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "alltime", label: "All time" },
];

// GitHub Primer "SegmentedControl"
export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Leaderboard period"
      className="inline-flex h-8 w-full items-stretch rounded-md bg-accent p-0.5 sm:w-auto"
    >
      {OPTIONS.map((option) => {
        const selected = view === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onViewChange(option.value)}
            className={`flex-1 rounded-[5px] border px-3 text-sm whitespace-nowrap transition-colors sm:flex-none ${
              selected
                ? "border-border bg-background font-semibold text-foreground"
                : "border-transparent text-muted-foreground hover:bg-neutral-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
