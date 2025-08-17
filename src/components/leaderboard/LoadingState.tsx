import { SkeletonLeaderboardEntry } from "../ui/skeleton";

export function LoadingState() {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h3 className="text-sm sm:text-base font-bold text-white mb-2 sm:mb-3">
        Loading Top Developers...
      </h3>
      {Array.from({ length: 10 }).map((_, index) => (
        <SkeletonLeaderboardEntry key={index} showRank={true} />
      ))}
    </div>
  );
}
