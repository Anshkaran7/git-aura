import React from "react";
import { Skeleton, SkeletonText } from "./ui/skeleton";

const MontlyContributionSkeleton: React.FC = () => {
  return (
    <div className="bg-[#161b21] backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-[#21262d] mx-1 sm:mx-0">
      {/* Header */}
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#161b21] to-[#0d1117]">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
          <SkeletonText className="h-6 sm:h-7 md:h-8 w-48 sm:w-56" />
          <SkeletonText className="h-4 sm:h-5 w-32 sm:w-40" />
        </div>

        {/* Chart Container */}
        <div className="w-full h-64 sm:h-80 bg-[#0d1117] backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-[#21262d] shadow-inner">
          {/* Y-axis labels */}
          <div className="flex h-full">
            <div className="flex flex-col justify-between py-2 pr-4 text-right">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonText key={i} className="h-3 w-8" />
              ))}
            </div>

            {/* Chart bars */}
            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 pb-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  {/* Bar */}
                  <Skeleton 
                    className="w-full rounded-t-sm"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      minHeight: '20px'
                    }}
                  />
                  {/* Month label */}
                  <SkeletonText className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 sm:mt-6 gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <SkeletonText className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MontlyContributionSkeleton;
