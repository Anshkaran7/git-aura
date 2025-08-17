"use client";
import React from "react";
import { 
  Skeleton, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonCard,
  SkeletonGrid 
} from "./ui/skeleton";

const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#161b21] backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-[#21262d] mx-1 sm:mx-0">
      {/* Browser Window Controls */}
      <div className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-[#0d1117] backdrop-blur-sm border-b border-[#21262d]">
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/90" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/90" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/90" />
        </div>
        
        {/* URL Bar Skeleton */}
        <div className="flex-1 flex items-center justify-center mx-2 sm:mx-auto">
          <div className="flex items-center gap-1 sm:gap-2 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-md bg-[#161b21] backdrop-blur-sm border border-[#30363d] max-w-full overflow-hidden">
            <Skeleton className="h-3 w-16 sm:w-20" />
            <Skeleton className="h-3 w-20 sm:w-24" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-md" />
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-md" />
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-md" />
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-b from-[#161b21] to-[#0d1117]">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
            {/* Avatar Skeleton */}
            <SkeletonAvatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ring-2 ring-[#30363d]" />
            
            {/* User Info Skeleton */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 sm:space-y-3">
              <SkeletonText className="h-6 sm:h-7 md:h-8 w-32 sm:w-40 mx-auto sm:mx-0" />
              <SkeletonText className="h-4 sm:h-5 w-24 sm:w-28 mx-auto sm:mx-0" />
              
              {/* Stats Skeleton */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-2 sm:mt-3">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                  <SkeletonText className="h-3 w-16 sm:w-20" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                  <SkeletonText className="h-3 w-16 sm:w-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Repository Count Skeleton */}
          <div className="text-center sm:text-right w-full sm:w-auto space-y-1">
            <SkeletonText className="h-6 sm:h-7 md:h-8 w-16 sm:w-20 mx-auto sm:mx-0" />
            <SkeletonText className="h-3 sm:h-4 w-20 sm:w-24 mx-auto sm:mx-0" />
          </div>
        </div>

        {/* Bio Skeleton */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded" />
            <div className="flex-1 text-center sm:text-left">
              <SkeletonText lines={2} className="w-full" />
            </div>
          </div>
        </div>

        {/* Contribution Section */}
        <div className="mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Contribution Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 sm:gap-4">
            <SkeletonText className="h-5 sm:h-6 md:h-7 w-40 sm:w-48" />
            <SkeletonText className="h-3 sm:h-4 w-24 sm:w-28" />
          </div>

          {/* Contribution Grid Skeleton */}
          <div className="w-full">
            <SkeletonGrid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
