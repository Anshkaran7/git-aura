import { Suspense } from "react";
import Leaderboard from "@/components/Leaderboard";
import { themes } from "@/components/themes";
import { Header } from "@/components/home";
import { auth } from "@clerk/nextjs/server";

export default async function LeaderboardPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Header leaderboard={false} dashboard={true} />
      <div className="max-w-6xl mx-auto pt-28 px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🏆 Global Leaderboard
          </h1>
          <p className="text-gray-400">
            Compete with developers worldwide and see your ranking
          </p>
        </div>
        <LeaderboardWrapper currentUserId={userId} />
      </div>
    </div>
  );
}

// Wrapper component to handle the leaderboard display
function LeaderboardWrapper({
  currentUserId,
}: {
  currentUserId: string | null;
}) {
  const defaultTheme = themes[1]; // Dark theme

  // Create empty contributions data for the leaderboard component
  const emptyContributions = {
    totalContributions: 0,
    contributionDays: [],
  };

  return (
    <Leaderboard
      currentUserId={currentUserId || undefined}
      selectedTheme={defaultTheme}
      contributions={emptyContributions}
    />
  );
}
