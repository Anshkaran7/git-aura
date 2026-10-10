"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { Theme, GitHubContributions } from "./types";

interface ContributionGridProps {
  contributions: GitHubContributions;
  selectedTheme: Theme;
  /** Optional content rendered on the left side of the legend row. */
  footer?: React.ReactNode;
  /** Square size in px (defaults to GitHub's 10px). */
  cellSize?: number;
  /** Gap between squares in px (defaults to 3px). */
  cellGap?: number;
  /**
   * When false the full year is always laid out (no horizontal scroll) —
   * used by the exported share card.
   */
  scrollable?: boolean;
}

const CELL = 10; // px — GitHub uses 10px squares
const GAP = 3; // px — and 3px spacing
const WEEKS = 53;
const WEEKDAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

// Format a Date as YYYY-MM-DD using the *local* calendar day. Using
// toISOString() here shifts the day for timezones ahead of UTC.
function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ContributionGrid: React.FC<ContributionGridProps> = ({
  contributions,
  selectedTheme,
  footer,
  cellSize = CELL,
  cellGap = GAP,
  scrollable = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const levelClasses = [
    selectedTheme.contribution.level0,
    selectedTheme.contribution.level1,
    selectedTheme.contribution.level2,
    selectedTheme.contribution.level3,
    selectedTheme.contribution.level4,
  ];

  const getLevel = (count: number): number => {
    if (count > 12) return 4;
    if (count > 7) return 3;
    if (count > 3) return 2;
    if (count > 0) return 1;
    return 0;
  };

  const { weeks, monthLabels } = useMemo(() => {
    const contributionMap: Record<string, number> = {};
    contributions.contributionDays.forEach((day) => {
      contributionMap[day.date] = day.contributionCount;
    });

    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Start on the Sunday of the week one year ago to match GitHub's grid
    const startDate = new Date(oneYearAgo);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks: Array<Array<{ date: Date; count: number } | null>> = [];
    const monthLabels: Array<{ week: number; label: string }> = [];
    let lastMonth = -1;
    let lastLabelWeek = -10;

    for (let week = 0; week < WEEKS; week++) {
      const days: Array<{ date: Date; count: number } | null> = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        if (date > today) {
          days.push(null);
          continue;
        }
        days.push({ date, count: contributionMap[toLocalDateKey(date)] || 0 });
      }
      weeks.push(days);

      // Month label goes on the first week whose first day is in a new month
      const firstDay = new Date(startDate);
      firstDay.setDate(startDate.getDate() + week * 7);
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        if (week - lastLabelWeek >= 3) {
          monthLabels.push({
            week,
            label: firstDay.toLocaleString("en-US", { month: "short" }),
          });
          lastLabelWeek = week;
        }
        lastMonth = month;
      }
    }

    return { weeks, monthLabels };
  }, [contributions.contributionDays]);

  // Like GitHub on narrow screens: show the most recent weeks first
  useEffect(() => {
    const el = scrollRef.current;
    if (el && scrollable) el.scrollLeft = el.scrollWidth;
  }, [weeks, scrollable]);

  const cellBase =
    "rounded-[2px] outline outline-1 -outline-offset-1 outline-foreground/5";

  return (
    <div className="w-full">
      <div ref={scrollRef} className={scrollable ? "overflow-x-auto" : ""}>
        <div
          className="inline-grid pb-1 text-xs text-foreground"
          style={{
            gridTemplateColumns: `28px repeat(${WEEKS}, ${cellSize}px)`,
            gridTemplateRows: `15px repeat(7, ${cellSize}px)`,
            gap: `${cellGap}px`,
          }}
          role="img"
          aria-label={`${contributions.totalContributions.toLocaleString()} contributions in the last year`}
        >
          {monthLabels.map(({ week, label }) => (
            <span
              key={`m-${week}`}
              className="whitespace-nowrap leading-[15px]"
              style={{ gridColumn: week + 2, gridRow: 1 }}
            >
              {label}
            </span>
          ))}

          {Object.entries(WEEKDAY_LABELS).map(([day, label]) => (
            <span
              key={`d-${day}`}
              className="flex items-center"
              style={{ gridColumn: 1, gridRow: Number(day) + 2 }}
            >
              {label}
            </span>
          ))}

          {weeks.map((days, week) =>
            days.map((cell, day) =>
              cell ? (
                <span
                  key={`${week}-${day}`}
                  className={`${cellBase} ${levelClasses[getLevel(cell.count)]}`}
                  style={{ gridColumn: week + 2, gridRow: day + 2 }}
                  title={`${cell.count === 0 ? "No" : cell.count} contribution${
                    cell.count === 1 ? "" : "s"
                  } on ${cell.date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}`}
                />
              ) : null
            )
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="min-w-0">{footer}</div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-1">Less</span>
          {levelClasses.map((cls, index) => (
            <span
              key={index}
              className={`${cellBase} ${cls}`}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </div>
  );
};

export default ContributionGrid;
