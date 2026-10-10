import React from "react";
import { GitHubContributions, Theme } from "./types";

function MontlyContribution({
  selectedTheme,
  contributions,
}: {
  selectedTheme: Theme;
  contributions: GitHubContributions;
}) {
  const calculateMonthlyContributions = () => {
    const monthlyData: Record<string, number> = {};

    contributions.contributionDays.forEach((day) => {
      // Parse as a local date (a bare YYYY-MM-DD is parsed as UTC)
      const date = new Date(`${day.date}T00:00:00`);
      const monthName = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (!monthlyData[monthName]) {
        monthlyData[monthName] = 0;
      }
      monthlyData[monthName] += day.contributionCount;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const dateA = new Date(a.month + " 1");
        const dateB = new Date(b.month + " 1");
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 12);
  };

  const monthlyContributions = calculateMonthlyContributions();
  // Oldest → newest for the chart
  const chronological = [...monthlyContributions].reverse();
  const maxCount = Math.max(1, ...chronological.map((m) => m.count));
  const best = monthlyContributions.reduce<{ month: string; count: number } | null>(
    (top, m) => (!top || m.count > top.count ? m : top),
    null
  );
  const average = monthlyContributions.length
    ? Math.round(
        monthlyContributions.reduce((sum, m) => sum + m.count, 0) /
          monthlyContributions.length
      )
    : 0;

  void selectedTheme;

  return (
    <section className="gh-box">
      <div className="gh-box-header">
        <h2 className="text-sm font-semibold text-foreground">
          Monthly contributions
        </h2>
        <span className="text-xs text-muted-foreground">Last 12 months</span>
      </div>

      {chronological.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No contribution data yet.
        </p>
      ) : (
        <div className="px-4 pb-3 pt-4">
          <div className="flex h-40 items-end gap-1 sm:gap-2">
            {chronological.map(({ month, count }) => (
              <div
                key={month}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                title={`${count.toLocaleString()} contributions in ${month}`}
              >
                <span className="mb-1 text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                  {count.toLocaleString()}
                </span>
                <div
                  className="w-full max-w-10 rounded-t-[3px] bg-[var(--contribution-level-2)] transition-colors group-hover:bg-[var(--contribution-level-3)]"
                  style={{
                    height: `${Math.max((count / maxCount) * 100, count > 0 ? 3 : 1)}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-1 border-t border-border-muted pt-1.5 sm:gap-2">
            {chronological.map(({ month }) => (
              <span
                key={month}
                className="min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground sm:text-xs"
              >
                {month.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-px border-t border-border-muted bg-border-muted text-xs">
        <div className="bg-card px-4 py-2.5">
          <p className="text-muted-foreground">Total</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
            {contributions.totalContributions.toLocaleString()}
          </p>
        </div>
        <div className="bg-card px-4 py-2.5">
          <p className="text-muted-foreground">Best month</p>
          <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
            {best ? best.month : "—"}
          </p>
        </div>
        <div className="bg-card px-4 py-2.5">
          <p className="text-muted-foreground">Monthly avg</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
            {average.toLocaleString()}
          </p>
        </div>
      </div>
    </section>
  );
}

export default MontlyContribution;
