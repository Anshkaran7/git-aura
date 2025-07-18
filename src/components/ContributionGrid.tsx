"use client";
import React from "react";
import { Theme, GitHubContributions } from "./types";

interface ContributionGridProps {
  contributions: GitHubContributions;
  selectedTheme: Theme;
}

const ContributionGrid: React.FC<ContributionGridProps> = ({
  contributions,
  selectedTheme,
}) => {
  const getContributionColor = (count: number): string => {
    if (count > 12) return "bg-[#39d353]"; // High activity - bright green like GitHub
    if (count > 7) return "bg-[#26a641]"; // Good activity - medium green
    if (count > 3) return "bg-[#006d32]"; // Moderate activity - darker green
    if (count > 0) return "bg-[#0e4429]"; // Low activity - dark green
    return "bg-[#161b22]"; // No activity - dark black like GitHub
  };

  const generateCommitGrid = () => {
    const weekdays = ["Mon", "", "Wed", "", "Fri"];
    const grid = [];

    // Add weekday labels column
    grid.push(
      <div
        key="weekdays"
        className="flex flex-col gap-[1px] sm:gap-[2px] text-xs text-[#7d8590] pr-1 sm:pr-2 pt-3 sm:pt-4 shrink-0"
      >
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="h-[7px] sm:h-[9px] md:h-[11px] flex items-center text-xs"
          >
            <span className="hidden sm:inline text-xs">{day}</span>
            <span className="sm:hidden text-xs">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>
    );

    // Create a map of date to contribution count
    const contributionMap: Record<string, number> = {};
    contributions.contributionDays.forEach((day) => {
      contributionMap[day.date] = day.contributionCount;
    });

    // Generate columns (weeks) - Use actual data range
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Ensure we start from Sunday to match GitHub's grid
    const startDate = new Date(oneYearAgo);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let week = 0; week < 53; week++) {
      const weekCells = [];
      // Generate cells for each day in the week (Sunday to Saturday)
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7 + day);

        // Skip dates that are too far in the future
        if (date > today) {
          weekCells.push(
            <div
              key={`${week}-${day}`}
              className="w-[10px] h-[10px] rounded-sm bg-transparent"
            />
          );
          continue;
        }

        const dateStr = date.toISOString().split("T")[0];
        const contributionCount = contributionMap[dateStr] || 0;

        weekCells.push(
          <div
            key={`${week}-${day}`}
            className={`w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] md:w-[11px] md:h-[11px] rounded-sm ${getContributionColor(
              contributionCount
            )} hover:ring-1 sm:hover:ring-2 hover:ring-[#8b949e] hover:ring-offset-1 sm:hover:ring-offset-2 hover:ring-offset-[#0d1117] transition-all cursor-pointer touch-manipulation hover:scale-110`}
            title={`${date.toDateString()}: ${contributionCount} contributions`}
          />
        );
      }
      grid.push(
        <div key={week} className="flex flex-col gap-[1px] sm:gap-[2px]">
          {weekCells}
        </div>
      );
    }

    return <div className="flex gap-[1px] sm:gap-[2px] justify-center w-full overflow-hidden">{grid}</div>;
  };

  const getMonthLabels = () => {
    const months = [
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
    ];

    return (
      <div className="grid grid-cols-[repeat(12,_minmax(0,_1fr))] text-xs text-[#7d8590] ml-4 sm:ml-6 mb-1 sm:mb-2 overflow-hidden max-w-full">
        {months.map((month, i) => (
          <div key={i} className="text-xs truncate text-center">
            <span className="hidden sm:inline">{month}</span>
            <span className="sm:hidden">{month.slice(0, 1)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <div className="bg-[#0d1117] backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 border border-[#21262d] shadow-inner max-w-full">
        <div className="w-full overflow-hidden">
          {getMonthLabels()}
          <div className="pb-2 w-full overflow-hidden">{generateCommitGrid()}</div>
        </div>
        <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-3 md:mt-4 gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            <span className="text-[#7d8590] font-mona-sans whitespace-nowrap">
              Less
            </span>
            <div className="flex gap-0.5 sm:gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-[7px] h-[7px] sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-sm ${getContributionColor(
                    level * 4
                  )}`}
                />
              ))}
            </div>
            <span className="text-[#7d8590] font-mona-sans whitespace-nowrap">
              More
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionGrid;
