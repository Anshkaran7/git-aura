"use client";
import React from "react";
import { SkeletonGrid } from "./ui/skeleton";

interface ContributionGridSkeletonProps {
  className?: string;
}

const ContributionGridSkeleton: React.FC<ContributionGridSkeletonProps> = ({
  className,
}) => {
  return (
    <div className={`w-full flex justify-center ${className || ""}`}>
      <SkeletonGrid />
    </div>
  );
};

export default ContributionGridSkeleton;
