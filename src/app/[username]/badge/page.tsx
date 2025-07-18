import { Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import BadgeDisplay from "@/components/BadgeDisplay";
import { themes } from "@/components/themes";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function BadgePage({ params }: PageProps) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {username}'s Badges
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Achievement badges and leaderboard position
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <BadgeDisplayWrapper username={username} />
        </Suspense>
      </div>
    </div>
  );
}

// Wrapper component to handle the badge display logic
function BadgeDisplayWrapper({ username }: { username: string }) {
  // For now, we'll use a default theme and show a message about signing in
  // In a real implementation, you'd need to determine the user ID from the username
  const defaultTheme = themes[1]; // Dark theme

  return (
    <div className="text-center py-20">
      <div className="text-gray-600 dark:text-gray-400">
        <h3 className="text-xl font-semibold mb-4">Badge View</h3>
        <p className="mb-4">
          Badges are currently only available for authenticated users.
        </p>
        <p className="text-sm">
          Sign in to view your own badges and achievements!
        </p>
      </div>
    </div>
  );
}
