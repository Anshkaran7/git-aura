import { Suspense } from "react";
import Leaderboard from "@/components/Leaderboard";
import { themes } from "@/components/themes";
import { Header } from "@/components/home";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function LeaderboardPage({ params }: PageProps) {
  const { username } = await params;

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Header leaderboard={false} dashboard={true} />
      <div className="max-w-6xl mx-auto pt-28 px-4 py-8">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See where {username} ranks among all developers
          </p>
        </div> */}
        <LeaderboardWrapper username={username} />
      </div>
    </div>
  );
}

// Wrapper component to handle the leaderboard display
function LeaderboardWrapper({ username }: { username: string }) {
  const defaultTheme = themes[1]; // Dark theme

  // Create empty contributions data for the leaderboard component
  const emptyContributions = {
    totalContributions: 0,
    contributionDays: [],
  };

  return (
    <Leaderboard
      currentUserId={undefined} // No current user ID since we're viewing someone else's profile
      selectedTheme={defaultTheme}
      contributions={emptyContributions}
    />
  );
}
