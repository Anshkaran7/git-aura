export function LoadingState() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="rounded-3xl border border-border/70 bg-background/85 p-6 text-center shadow-[0_18px_60px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary/15 border-t-primary sm:h-12 sm:w-12"></div>
        <h3 className="text-sm font-semibold text-foreground sm:text-base">
          Loading Leaderboard
        </h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Fetching latest rankings...
        </p>
      </div>
    </div>
  );
}
