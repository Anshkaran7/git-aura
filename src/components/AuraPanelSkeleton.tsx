import React from "react";
import { Skeleton, SkeletonText, SkeletonCard } from "./ui/skeleton";

const AuraPanelSkeleton: React.FC = () => {
  return (
    <div className="bg-[#161b21] backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-[#21262d] mx-1 sm:mx-0">
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#161b21] to-[#0d1117]">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <SkeletonText className="h-7 sm:h-8 md:h-9 w-32 sm:w-40 mx-auto mb-2" />
          <SkeletonText className="h-4 sm:h-5 w-48 sm:w-56 mx-auto" />
        </div>

        {/* Main Aura Display */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative inline-flex items-center justify-center">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <SkeletonText className="h-6 sm:h-8 md:h-10 w-16 sm:w-20 mb-1" />
              <SkeletonText className="h-3 sm:h-4 w-12 sm:w-16" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="text-center p-3 sm:p-4">
              <SkeletonText className="h-5 sm:h-6 w-12 sm:w-16 mx-auto mb-2" />
              <SkeletonText className="h-3 sm:h-4 w-16 sm:w-20 mx-auto" />
            </SkeletonCard>
          ))}
        </div>

        {/* Progress Bars */}
        <div className="space-y-4 sm:space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <SkeletonText className="h-4 w-20 sm:w-24" />
                <SkeletonText className="h-4 w-12 sm:w-16" />
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-2 sm:h-3">
                <Skeleton 
                  className="h-full rounded-full"
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Skeleton className="flex-1 h-10 sm:h-12 rounded-lg" />
          <Skeleton className="flex-1 h-10 sm:h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default AuraPanelSkeleton;
