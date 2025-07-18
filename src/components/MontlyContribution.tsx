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
      const date = new Date(day.date);
      const monthName = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (!monthlyData[monthName]) {
        monthlyData[monthName] = 0;
      }
      monthlyData[monthName] += day.contributionCount;
    });

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const dateA = new Date(a.month + " 1");
        const dateB = new Date(b.month + " 1");
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 12); // Get last 12 months
  };

  const monthlyContributions = calculateMonthlyContributions();

  return (
    <div className="mt-3 sm:mt-4 md:mt-6 flex flex-col gap-3 sm:gap-4 mx-1 sm:mx-0">
      {/* Total Contributions Card */}
      <div className="bg-[#161b21] backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-[#21262d] shadow-lg">
        <div className="text-center">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">
            Total Contributions:{" "}
            <span className="block sm:inline">
              {contributions.totalContributions.toLocaleString()}
            </span>
          </h3>
        </div>
      </div>

      {/* Monthly Breakdown Card */}
      <div className="bg-[#161b21] backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-[#21262d] shadow-lg">
        <div>
          <h4 className="text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4 text-[#e6edf3]">
            Monthly Breakdown{" "}
            <span className="block sm:inline">(Last 12 Months)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-4 gap-2 sm:gap-3">
            {monthlyContributions.map(({ month, count }) => (
              <div
                key={month}
                className="p-2 sm:p-3 rounded-lg bg-[#0d1117] backdrop-blur-sm border border-[#21262d] hover:scale-105 transition-all touch-manipulation hover:bg-[#161b21]"
              >
                <div className="text-xs sm:text-sm font-medium mb-1 text-[#7d8590] truncate">
                  {month}
                </div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                  {count}
                </div>
                <div className="text-xs text-[#7d8590] truncate">
                  {count > 100
                    ? "🔥 High"
                    : count > 50
                    ? "⚡ Good"
                    : count > 20
                    ? "📈 Active"
                    : "💤 Low"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MontlyContribution;
