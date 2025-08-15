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

  return (
    <div className="mt-3 sm:mt-4 md:mt-6 flex flex-col gap-2 sm:gap-3 md:gap-4 mx-1 sm:mx-0">
      {/* Total Contributions Card */}
      <div className="bg-card backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-border shadow-lg">
        <div className="text-center">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
            Total Contributions:{" "}
            <span className="block sm:inline mt-1 sm:mt-0">
              {contributions.totalContributions.toLocaleString()}
            </span>
          </h3>
        </div>
      </div>

      {/* Monthly Breakdown Card */}
      <div className="bg-card backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-border shadow-lg">
        <div>
          <h4 className="text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4 text-muted-foreground text-center sm:text-left">
            Monthly Breakdown{" "}
            <span className="block sm:inline text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0">
              (Last 12 Months)
            </span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
            {monthlyContributions.map(({ month, count }) => (
              <div
                key={month}
                className="p-2 sm:p-3 rounded-lg bg-background backdrop-blur-sm border border-border hover:scale-[1.02] transition-all touch-manipulation hover:bg-muted group"
              >
                <div className="text-xs sm:text-sm font-medium mb-1 text-muted-foreground truncate group-hover:text-muted-foreground transition-colors">
                  {month}
                </div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
                  {count.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5 group-hover:text-muted-foreground transition-colors">
                  {count > 100
                    ? "🔥 High Activity"
                    : count > 50
                    ? "⚡ Good Progress"
                    : count > 20
                    ? "📈 Active"
                    : "💤 Low Activity"}
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
