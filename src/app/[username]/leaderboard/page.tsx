"use client";

import { Suspense } from "react";
import { Header } from "@/components/home";
import { CustomLeaderboard } from "@/components/leaderboard/CustomLeaderboard";
import { LoadingState } from "@/components/leaderboard/LoadingState";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function LeaderboardPage({ params }: PageProps) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-black transition-colors duration-300">
      <Header leaderboard={false} dashboard={true} />
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-[#7d8590]">
            See where {username} ranks among all developers
          </p>
        </div>

        <Suspense fallback={<LoadingState />}>
          <CustomLeaderboard username={username} />
        </Suspense>
      </div>
    </div>
  );
}
