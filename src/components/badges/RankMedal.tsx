import { cn } from "@/lib/utils";

const PALETTES = {
  1: { light: "#f8d66d", base: "#d4a72c", dark: "#9a6700", ribbonA: "#cf222e", ribbonB: "#a40e26", text: "#5c3d00" },
  2: { light: "#eef1f4", base: "#b6bec7", dark: "#6e7781", ribbonA: "#0969da", ribbonB: "#0550ae", text: "#32383f" },
  3: { light: "#f6b88a", base: "#d1813f", dark: "#953800", ribbonA: "#1a7f37", ribbonB: "#116329", text: "#4c1d00" },
} as const;

/**
 * Flat medal for monthly podium finishes (1st / 2nd / 3rd).
 * Pure SVG so it stays crisp and exports cleanly with html-to-image.
 */
export function RankMedal({
  rank,
  className,
  title,
}: {
  rank: 1 | 2 | 3;
  className?: string;
  title?: string;
}) {
  const p = PALETTES[rank];
  const id = `medal-${rank}`;

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title ?? `Rank ${rank} medal`}
      className={cn("h-10 w-10 shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="1" stopColor={p.base} />
        </linearGradient>
      </defs>
      {/* Ribbon */}
      <path d="M17 0h12l5 18H22z" fill={p.ribbonA} />
      <path d="M47 0H35l-5 18h12z" fill={p.ribbonB} />
      {/* Medal */}
      <circle cx="32" cy="40" r="23" fill={p.dark} />
      <circle cx="32" cy="40" r="20" fill={`url(#${id}-face)`} />
      <circle cx="32" cy="40" r="15" fill="none" stroke={p.dark} strokeOpacity="0.35" strokeWidth="1.5" />
      <text
        x="32"
        y="47.5"
        textAnchor="middle"
        fontFamily="ui-sans-serif, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontSize="20"
        fill={p.text}
      >
        {rank}
      </text>
    </svg>
  );
}

/** Maps legacy badge image paths (/badge/1st.png etc.) to a medal rank. */
export function medalRankFromIcon(icon?: string | null): 1 | 2 | 3 | null {
  if (!icon) return null;
  if (icon.includes("/badge/1st")) return 1;
  if (icon.includes("/badge/2nd")) return 2;
  if (icon.includes("/badge/3rd")) return 3;
  return null;
}

/** "Monthly Bronze - 2026-03" → "Monthly Bronze · Mar 2026" */
export function formatBadgeName(name: string): string {
  const match = name.match(/^(.*?)\s*-\s*(\d{4})-(\d{2})$/);
  if (!match) return name;
  const [, label, year, month] = match;
  const date = new Date(Number(year), Number(month) - 1);
  return `${label} · ${date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}
