import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GitHubProfileCard, {
  ProfileSkeleton,
} from "@/components/GitHubProfileCard";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

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
    <div className="flex min-h-screen flex-col bg-background">
      <Header leaderboard={false} profile={true} />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
              <ProfileSkeleton />
            </div>
          }
        >
          <GitHubProfileCard initialUsername={username} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
