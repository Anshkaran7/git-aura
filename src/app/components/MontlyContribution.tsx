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
    <div className="mt-4 flex flex-col gap-4">
      {/* Total Contributions Card */}
      <div
        className={`${
          selectedTheme.name === "Light"
            ? "bg-white"
            : selectedTheme.name === "Ocean Dark"
            ? "bg-[#0f172a]/50"
            : "bg-[#0d1117]/50"
        } rounded-xl p-4 ${selectedTheme.border} border backdrop-blur-sm`}
      >
        <div className="text-center">
          <h3
            className={`text-lg font-semibold ${
              selectedTheme.name === "Light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Total Contributions:{" "}
            {contributions.totalContributions.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Monthly Breakdown Card */}
      <div
        className={`${
          selectedTheme.name === "Light"
            ? "bg-white"
            : selectedTheme.name === "Ocean Dark"
            ? "bg-[#0f172a]/50"
            : "bg-[#0d1117]/50"
        } rounded-xl p-4 ${selectedTheme.border} border backdrop-blur-sm`}
      >
        <div>
          <h4
            className={`text-md font-medium mb-3 ${
              selectedTheme.name === "Light" ? "text-gray-700" : "text-gray-300"
            }`}
          >
            Monthly Breakdown (Last 12 Months)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthlyContributions.map(({ month, count }) => (
              <div
                key={month}
                className={`p-3 rounded-lg ${
                  selectedTheme.name === "Light"
                    ? "bg-gray-50 border border-gray-200"
                    : selectedTheme.name === "Ocean Dark"
                    ? "bg-[#1e293b]/50 border border-slate-600/30"
                    : "bg-[#161b22]/50 border border-gray-700/30"
                } backdrop-blur-sm`}
              >
                <div
                  className={`text-sm font-medium ${
                    selectedTheme.name === "Light"
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {month}
                </div>
                <div
                  className={`text-lg font-bold ${
                    selectedTheme.name === "Light"
                      ? "text-gray-800"
                      : "text-gray-200"
                  }`}
                >
                  {count}
                </div>
                <div
                  className={`text-xs ${
                    selectedTheme.name === "Light"
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
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
