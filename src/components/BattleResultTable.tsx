import React from "react";

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

const BattleResultTable: React.FC<BattleResultTableProps> = ({ results }) => {
  const safeResults = Array.isArray(results) ? results : [];

  const formatValue = (val: number | string, key: string) => {
    if (key === "created_at") {
      if (typeof val === "number") {
        return `${val.toFixed(1)} yrs`;
      }
      return val;
    }

    if (typeof val === "number") {
      // Format large numbers with commas
      if (val >= 1000) {
        return val.toLocaleString();
      }
      return val.toString();
    }

    return val;
  };

  const getMetricIcon = (key: string) => {
    switch (key) {
      case "aura":
        return "⭐";
      case "totalContributions":
        return "📊";
      case "public_repos":
        return "📁";
      case "totalStars":
        return "🌟";
      case "totalIssues":
        return "�"; // Issues Raised
      case "totalPullRequests":
        return "✅"; // PRs Merged
      case "public_gists":
        return "📝";
      case "followers":
        return "👥";
      case "following":
        return "👤";
      case "created_at":
        return "📅";
      default:
        return "📈";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card rounded-lg overflow-hidden text-foreground border border-border">
        <div className="bg-muted px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Battle Results
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Comparing {safeResults.length} metrics - Winner highlighted in gold
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                  Metric
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">
                  User 1
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">
                  User 2
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {safeResults.map((r, index) => (
                <tr
                  key={r.key}
                  className={`border-t border-border hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? "bg-card" : "bg-muted/20"
                  }`}
                >
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMetricIcon(r.key)}</span>
                      <span>{r.label}</span>
                    </div>
                  </td>
                  <td
                    className={`py-3 px-4 text-center font-mono text-sm ${
                      r.winner === "user1"
                        ? "bg-yellow-500/20 dark:bg-yellow-900/40 font-bold text-yellow-700 dark:text-yellow-200"
                        : "text-foreground"
                    }`}
                  >
                    {formatValue(r.value1, r.key)}
                  </td>
                  <td
                    className={`py-3 px-4 text-center font-mono text-sm ${
                      r.winner === "user2"
                        ? "bg-yellow-500/20 dark:bg-yellow-900/40 font-bold text-yellow-700 dark:text-yellow-200"
                        : "text-foreground"
                    }`}
                  >
                    {formatValue(r.value2, r.key)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs">
                    {r.description || "No description available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BattleResultTable;
