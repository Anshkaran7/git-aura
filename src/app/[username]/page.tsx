import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GitHubProfileCard from "@/components/GitHubProfileCard";
import { Header } from "@/components/home/header";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;

  // Get authentication state
  const { userId } = await auth();

  // Require authentication
  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user data
  const user = await currentUser();

  // Only allow access to own profile
  // Users can only view their own profile page
  if (user?.username !== username) {
    // If user has a username, redirect to their own profile
    if (user?.username) {
      redirect(`/${user.username}`);
    } else {
      // If no username set, redirect to sign-in to complete setup
      redirect("/sign-in");
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-black">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading GitHub profile...</p>
              </div>
            </div>
          }
        >
          <Header leaderboard={false} profile={true} />
          <GitHubProfileCard initialUsername={username} />
        </Suspense>
      </div>
    </div>
  );
}
