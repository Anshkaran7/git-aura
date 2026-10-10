import React from "react";
import { UserAvatar } from "@/components/ui/user-avatar";

interface MetricResult {
  key: string;
  label: string;
  value1: number | string;
  value2: number | string;
  winner: "user1" | "user2" | null;
  description?: string;
}

interface BattleUser {
  login: string;
  name?: string | null;
  avatar_url?: string;
}

interface BattleResultTableProps {
  results: MetricResult[];
  user1?: BattleUser;
  user2?: BattleUser;
}

function formatValue(value: number | string, key: string) {
  if (key === "created_at" && typeof value === "number") {
    return `${value.toFixed(1)} yrs`;
  }

  return typeof value === "number" ? value.toLocaleString() : value;
}

const GRID =
  "grid grid-cols-[minmax(0,1fr)_6rem_6rem] sm:grid-cols-[minmax(0,1fr)_9rem_9rem]";

function UserColumnHeader({
  user,
  fallback,
}: {
  user?: BattleUser;
  fallback: string;
}) {
  if (!user) {
    return <span className="text-right">{fallback}</span>;
  }

  return (
    <a
      href={`https://github.com/${user.login}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 items-center justify-end gap-1.5 text-foreground hover:text-link"
    >
      <UserAvatar
        src={user.avatar_url}
        githubUsername={user.login}
        displayName={user.name}
        className="hidden h-5 w-5 sm:flex"
        initialsClassName="text-[9px] tracking-normal"
        size={40}
      />
      <span className="truncate font-semibold">{user.login}</span>
    </a>
  );
}

function ValueCell({
  value,
  metricKey,
  isWinner,
}: {
  value: number | string;
  metricKey: string;
  isWinner: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-end gap-1 px-3 py-2.5 text-right text-sm tabular-nums sm:px-4 ${
        isWinner
          ? "bg-success-subtle font-semibold text-success"
          : "text-foreground"
      }`}
    >
      {isWinner && (
        <svg
          aria-label="Winner"
          viewBox="0 0 16 16"
          className="hidden h-3.5 w-3.5 shrink-0 fill-current sm:block"
        >
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
        </svg>
      )}
      <span className="truncate">{formatValue(value, metricKey)}</span>
    </div>
  );
}

export default function BattleResultTable({
  results,
  user1,
  user2,
}: BattleResultTableProps) {
  const safeResults = Array.isArray(results) ? results : [];

  return (
    <div className="gh-box overflow-hidden">
      <div
        className={`${GRID} items-center border-b border-border bg-canvas-subtle text-xs text-muted-foreground`}
      >
        <div className="px-3 py-2.5 font-semibold text-foreground sm:px-4">
          Metric
          <span className="ml-1.5 gh-counter">{safeResults.length}</span>
        </div>
        <div className="min-w-0 px-3 py-2.5 sm:px-4">
          <UserColumnHeader user={user1} fallback="Developer A" />
        </div>
        <div className="min-w-0 px-3 py-2.5 sm:px-4">
          <UserColumnHeader user={user2} fallback="Developer B" />
        </div>
      </div>

      {safeResults.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No metrics were returned for this comparison.
        </div>
      ) : (
        <div className="divide-y divide-border-muted">
        {safeResults.map((result) => (
          <div
            key={result.key}
            className={`${GRID} items-stretch hover:bg-canvas-subtle`}
          >
            <div className="min-w-0 px-3 py-2.5 sm:px-4">
              <p className="truncate text-sm font-medium text-foreground">
                {result.label}
              </p>
              {result.description && (
                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  {result.description}
                </p>
              )}
            </div>
            <ValueCell
              value={result.value1}
              metricKey={result.key}
              isWinner={result.winner === "user1"}
            />
            <ValueCell
              value={result.value2}
              metricKey={result.key}
              isWinner={result.winner === "user2"}
            />
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
