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
    if (count > 12) return selectedTheme.contribution.level4;
    if (count > 7) return selectedTheme.contribution.level3;
    if (count > 3) return selectedTheme.contribution.level2;
    if (count > 0) return selectedTheme.contribution.level1;
    return selectedTheme.contribution.level0;
  };

  const generateCommitGrid = () => {
    const weekdays = ["Mon", "", "Wed", "", "Fri"];
    const grid = [];

    // Add weekday labels column
    grid.push(
      <div
        key="weekdays"
        className="flex flex-col gap-[3px] text-xs text-gray-400 pr-2 pt-6"
      >
        {weekdays.map((day, i) => (
          <div key={i} className="h-[10px] flex items-center">
            {day}
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
            className={`w-[10px] h-[10px] rounded-sm ${getContributionColor(
              contributionCount
            )} hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:ring-offset-[#0d1117] transition-all cursor-pointer`}
            title={`${date.toDateString()}: ${contributionCount} contributions`}
          />
        );
      }
      grid.push(
        <div key={week} className="flex flex-col gap-[3px]">
          {weekCells}
        </div>
      );
    }

    return <div className="flex gap-[3px]">{grid}</div>;
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
      <div className="grid grid-cols-[repeat(12,_minmax(0,_1fr))] text-xs text-gray-400 ml-8 mb-2">
        {months.map((month, i) => (
          <div key={i}>{month}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <div
        className={`${
          selectedTheme.name === "Light"
            ? "bg-white"
            : selectedTheme.name === "Ocean Dark"
            ? "bg-[#0f172a]/50"
            : "bg-[#0d1117]/50"
        } rounded-xl p-3 sm:p-6 ${
          selectedTheme.border
        }  w-full border backdrop-blur-sm`}
        style={{ overflowX: "auto", width: "max-content" }}
      >
        <div className="min-w-max w-full">
          {getMonthLabels()}
          <div className="overflow-x-auto">{generateCommitGrid()}</div>
        </div>
        <div className="flex items-center justify-end mt-2 sm:mt-4 gap-1 sm:gap-2">
          <span
            className={`text-xs ${
              selectedTheme.name === "Light" ? "text-gray-500" : "text-gray-400"
            } font-mona-sans`}
          >
            Less
          </span>
          <div className="flex gap-0.5 sm:gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm ${getContributionColor(
                  level * 4
                )}`}
              />
            ))}
          </div>
          <span
            className={`text-xs ${
              selectedTheme.name === "Light" ? "text-gray-500" : "text-gray-400"
            } font-mona-sans`}
          >
            More
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContributionGrid;
