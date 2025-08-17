import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SkeletonAvatar, SkeletonText, Skeleton } from "../ui/skeleton";

interface UserCardSkeletonProps {
  username?: string;
}

export function UserCardSkeleton({ username }: UserCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-lg p-2 sm:p-3 border border-[#39d353] bg-gradient-to-r from-[#161b21] to-[#0d1117]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#39d353]/10 to-[#26a641]/10"></div>
      <div className="relative">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 text-[#39d353]" />
          <span className="text-xs font-medium text-[#39d353]">
            {username ? `${username}'s Position` : "Your Position"}
          </span>
        </div>
        <div className="flex flex-row items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Rank skeleton */}
            <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
            {/* Avatar skeleton */}
            <SkeletonAvatar className="w-6 h-6 sm:w-8 sm:h-8 ring-1 ring-[#39d353]" />
            <div>
              <SkeletonText className="w-20 sm:w-24 h-3 sm:h-4 mb-1" />
              <SkeletonText className="w-16 sm:w-20 h-2 sm:h-3" />
            </div>
          </div>
          <div className="text-right">
            <SkeletonText className="w-12 sm:w-16 h-4 sm:h-5 mb-1" />
            <SkeletonText className="w-10 sm:w-12 h-2 sm:h-3" />
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded" />
            <SkeletonText className="w-16 sm:w-20 h-3" />
          </div>
          <div className="flex items-center gap-1">
            <SkeletonText className="w-8 sm:w-10 h-3" />
            <Skeleton className="w-12 sm:w-16 h-4 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
