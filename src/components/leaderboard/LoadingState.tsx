export function LoadingState() {
  return (
    <div className="gh-box" aria-busy="true" aria-label="Loading leaderboard">
      <div className="gh-box-header">
        <div className="h-4 w-40 animate-pulse rounded bg-accent" />
        <div className="h-4 w-16 animate-pulse rounded bg-accent" />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="gh-box-row flex items-center gap-3">
          <div className="h-4 w-6 animate-pulse rounded bg-accent" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-accent" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-accent" />
            <div className="h-3 w-20 animate-pulse rounded bg-accent" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded bg-accent" />
        </div>
      ))}
    </div>
  );
}
