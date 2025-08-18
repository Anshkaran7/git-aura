import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GitHubProfileCard from "@/components/GitHubProfileCard";
import { Header } from "@/components/home/header";
import ProfileCopyRows from "@/components/ui/ProfileCopyRows";

interface PageProps {
  params: { username: string };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = params;

  // Require authentication
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user data
  const user = await currentUser();

  // Only allow access to own profile
  if (user?.username !== username) {
    if (user?.username) {
      redirect(`/${user.username}`);
    } else {
      redirect("/sign-in");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading GitHub profile...</p>
              </div>
            </div>
          }
        >
          {/* Header */}
          <Header leaderboard={false} profile={true} />

          {/* Copy buttons UI */}
          <main className="p-6 space-y-6">
            <ProfileCopyRows username={username} />
          </main>

          {/* GitHub profile card */}
          <GitHubProfileCard initialUsername={username} />
        </Suspense>
      </div>
    </div>
  );
}
