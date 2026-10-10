import { Suspense } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function BadgePage({ params }: PageProps) {
  const { username } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header leaderboard={false} profile={true} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 border-b border-border pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {username}&apos;s badges
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Achievement badges and leaderboard position
          </p>
        </div>

        <Suspense
          fallback={
            <div className="gh-box space-y-3 p-4">
              <div className="h-4 w-1/3 animate-pulse rounded bg-accent" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-accent" />
            </div>
          }
        >
          <BadgeDisplayWrapper username={username} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// Wrapper component to handle the badge display logic
function BadgeDisplayWrapper({ username }: { username: string }) {
  // Badges are currently shown on the user's own profile page
  // In a real implementation, you'd need to determine the user ID from the username
  return (
    <div className="gh-box px-4 py-12 text-center">
      <Award className="mx-auto h-6 w-6 text-muted-foreground" />
      <h2 className="mt-3 text-base font-semibold text-foreground">
        Badge view
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Badges are currently only available for authenticated users. Sign in to
        view your own badges and achievements.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link href={`/${username}`}>View profile</Link>
      </Button>
    </div>
  );
}
