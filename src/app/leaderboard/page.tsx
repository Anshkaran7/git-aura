"use client";

import { Suspense, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Ban } from "lucide-react";
import { Footer, Header } from "@/components/home";
import { CustomLeaderboard } from "@/components/leaderboard/CustomLeaderboard";
import { LoadingState } from "@/components/leaderboard/LoadingState";

function BannedNotice({
  reason,
  expiresAt,
}: {
  reason?: string;
  expiresAt?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Access restricted
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Your account has been suspended from accessing the leaderboard.
        </p>
      </div>
      <div className="mt-6 rounded-md border border-danger/40 bg-danger-subtle px-4 py-3 text-sm text-foreground">
        <div className="flex items-start gap-2">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div className="space-y-1">
            {reason ? (
              <p>
                <span className="font-semibold">Reason:</span> {reason}
              </p>
            ) : null}
            {expiresAt ? (
              <p>
                <span className="font-semibold">Ban expires:</span>{" "}
                {new Date(expiresAt).toLocaleString()}
              </p>
            ) : null}
            <p className="text-muted-foreground">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [banStatus, setBanStatus] = useState<{
    isBanned: boolean;
    reason?: string;
    expiresAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const githubUsername =
    user?.externalAccounts?.find((account) => account.provider === "github")
      ?.username || "";

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/check-ban-status?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.isBanned) {
            setBanStatus({
              isBanned: true,
              reason: data.banReason,
              expiresAt: data.banExpiresAt,
            });
          }
        }
      } catch (error) {
        console.error("Error checking ban status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkBanStatus();
  }, [userId]);

  if (loading) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    );
  }

  if (banStatus?.isBanned) {
    return (
      <PageShell>
        <BannedNotice
          reason={banStatus.reason}
          expiresAt={banStatus.expiresAt}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Suspense fallback={<LoadingState />}>
        <CustomLeaderboard
          username={githubUsername}
          title="Leaderboard"
          description="Compete with developers worldwide and see where you rank."
        />
      </Suspense>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header leaderboard={false} dashboard={true} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
