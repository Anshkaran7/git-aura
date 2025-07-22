"use client";

import { Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Header } from "@/components/home";
import { CustomLeaderboard } from "@/components/leaderboard/CustomLeaderboard";
import { LoadingState } from "@/components/leaderboard/LoadingState";

export default function LeaderboardPage() {
  const { userId } = useAuth();
  const [banStatus, setBanStatus] = useState<{
    isBanned: boolean;
    reason?: string;
    expiresAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-black transition-colors duration-300">
        <Header leaderboard={false} dashboard={true} />
        <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (banStatus?.isBanned) {
    return (
      <div className="min-h-screen bg-black transition-colors duration-300">
        <Header leaderboard={false} dashboard={true} />
        <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                  />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Access Restricted
              </h1>
              <p className="text-lg text-[#7d8590] mb-6">
                Your account has been suspended from accessing the leaderboard.
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-950/40 to-orange-950/20 border border-red-500/30 rounded-lg p-6 sm:p-8 backdrop-blur-sm">
              <div className="space-y-4">
                {banStatus.reason && (
                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/20">
                    <p className="text-gray-400 text-sm mb-2">
                      <strong>Reason:</strong>
                    </p>
                    <p className="text-red-200 font-medium">
                      {banStatus.reason}
                    </p>
                  </div>
                )}

                {banStatus.expiresAt && (
                  <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/20">
                    <p className="text-gray-400 text-sm mb-2">
                      <strong>Ban Expires:</strong>
                    </p>
                    <p className="text-orange-200 font-medium">
                      {new Date(banStatus.expiresAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-300 text-sm">
                    If you believe this is an error, please contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black transition-colors duration-300">
      <Header leaderboard={false} dashboard={true} />
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            🏆 Global Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-[#7d8590]">
            Compete with developers worldwide and see your ranking
          </p>
        </div>

        <Suspense fallback={<LoadingState />}>
          <CustomLeaderboard username="" />
        </Suspense>
      </div>
    </div>
  );
}
