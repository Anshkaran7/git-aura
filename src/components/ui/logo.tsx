import { cn } from "@/lib/utils";

// A "G" drawn with contribution-graph squares. 0 = empty day, 1–4 = commit intensity.
const G_GRID = [
  [0, 4, 4, 4, 0],
  [4, 0, 0, 0, 0],
  [3, 0, 3, 4, 4],
  [3, 0, 0, 0, 4],
  [0, 3, 3, 3, 0],
];
const LEVEL_COLORS = ["#1c232c", "#0e4429", "#006d32", "#26a641", "#39d353"];
const CELL = 4;
const GAP = 1.25;
const OFFSET = (32 - (5 * CELL + 4 * GAP)) / 2;

/**
 * GitAura brand mark: a "G" made of commit squares on a dark tile.
 * Pure SVG — crisp at any size and identical in both themes.
 */
export function LogoMark({ className, title = "GitAura" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={title}
      className={cn("h-8 w-8 shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#0d1117" stroke="#3d444d" />
      {G_GRID.flatMap((row, r) =>
        row.map((level, c) => (
          <rect
            key={`${r}-${c}`}
            x={OFFSET + c * (CELL + GAP)}
            y={OFFSET + r * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={1}
            fill={LEVEL_COLORS[level]}
          />
        ))
      )}
    </svg>
  );
}

/** Mark + wordmark. */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="text-sm font-semibold tracking-tight text-foreground">GitAura</span>
    </span>
  );
}
