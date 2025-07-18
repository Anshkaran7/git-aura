import { Suspense } from "react";
import GitHubProfileCard from "@/components/GitHubProfileCard";
import { Header } from "@/components/home/header";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;

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
