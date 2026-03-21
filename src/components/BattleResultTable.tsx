import React from "react";
import { Badge } from "@/components/ui/badge";

interface MetricResult {
  key: string;
  label: string;
  value1: number | string;
  value2: number | string;
  winner: "user1" | "user2" | null;
  description?: string;
}

interface BattleResultTableProps {
  results: MetricResult[];
}

const METRIC_ICONS: Record<string, string> = {
  aura: "A",
  totalContributions: "C",
  public_repos: "R",
  totalStars: "S",
  totalIssues: "I",
  totalPullRequests: "P",
  public_gists: "G",
  followers: "F",
  following: "+",
  created_at: "Y",
};

function formatValue(value: number | string, key: string) {
  if (key === "created_at" && typeof value === "number") {
    return `${value.toFixed(1)} yrs`;
  }

  return typeof value === "number" ? value.toLocaleString() : value;
}

export default function BattleResultTable({
  results,
}: BattleResultTableProps) {
  const safeResults = Array.isArray(results) ? results : [];

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)]">
      <div className="border-b border-border bg-background/80 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground sm:text-[15px]">
              Metric comparison
            </h3>
            <p className="text-xs text-muted-foreground">
              {safeResults.length} categories, ranked by stronger output per
              metric.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit rounded-full border-border bg-card px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            Head to head
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-border">
        {safeResults.map((result) => (
          <div
            key={result.key}
            className="grid gap-3 px-4 py-4 sm:grid-cols-[1.15fr_0.9fr_0.9fr_1.2fr] sm:items-center sm:px-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {METRIC_ICONS[result.key] ?? "M"}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {result.label}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {result.description || "Comparison metric"}
                </p>
              </div>
            </div>

            <div
              className={`rounded-full border px-3 py-2.5 text-center text-sm font-semibold tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${
                result.winner === "user1"
                  ? "border-foreground/15 bg-foreground text-background"
                  : "border-border bg-background text-foreground/90"
              }`}
            >
              {formatValue(result.value1, result.key)}
            </div>

            <div
              className={`rounded-full border px-3 py-2.5 text-center text-sm font-semibold tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${
                result.winner === "user2"
                  ? "border-foreground/15 bg-foreground text-background"
                  : "border-border bg-background text-foreground/90"
              }`}
            >
              {formatValue(result.value2, result.key)}
            </div>

            <p className="hidden text-xs leading-5 text-muted-foreground sm:block">
              {result.description || "Comparison metric"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
