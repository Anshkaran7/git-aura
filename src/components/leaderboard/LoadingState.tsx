export function LoadingState() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
          Loading Leaderboard
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Fetching latest rankings...
        </p>
      </div>
    </div>
  );
}
