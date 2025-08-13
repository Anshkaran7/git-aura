"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Shield } from "lucide-react";

interface BanInfo {
  reason?: string;
  bannedAt?: string;
  expiresAt?: string;
  bannedBy?: string;
}

export default function BannedPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchBanInfo();
    } else if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user]);

  const fetchBanInfo = async () => {
    try {
      const response = await fetch(`/api/check-ban-status?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isBanned) {
          setBanInfo({
            reason: data.banReason,
            bannedAt: data.bannedAt,
            expiresAt: data.banExpiresAt,
            bannedBy: data.bannedBy,
          });
        } else {
          // User is not banned, redirect to home
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error fetching ban info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    window.location.href = "/sign-in";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isTemporaryBan = banInfo?.expiresAt;
  const timeRemaining = isTemporaryBan
    ? Math.max(0, new Date(banInfo.expiresAt!).getTime() - Date.now())
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/20 rounded-full">
              <Shield className="w-12 h-12 text-red-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Account Suspended
          </h1>

          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div className="space-y-3">
                <p className="text-gray-300">
                  Your account has been suspended from GitAura.
                </p>

                {banInfo?.reason && (
                  <div>
                    <p className="text-sm text-gray-400 font-medium">Reason:</p>
                    <p className="text-gray-200">{banInfo.reason}</p>
                  </div>
                )}

                {banInfo?.bannedAt && (
                  <div>
                    <p className="text-sm text-gray-400 font-medium">
                      Suspended on:
                    </p>
                    <p className="text-gray-200">
                      {formatDate(banInfo.bannedAt)}
                    </p>
                  </div>
                )}

                {isTemporaryBan && timeRemaining > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-900/20 border border-orange-500/30 rounded">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <div>
                      <p className="text-sm text-orange-200 font-medium">
                        Temporary Suspension
                      </p>
                      <p className="text-xs text-orange-300">
                        Expires: {formatDate(banInfo.expiresAt!)}
                      </p>
                    </div>
                  </div>
                )}

                {isTemporaryBan && timeRemaining <= 0 && (
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <p className="text-green-200 text-sm">
                      Your suspension has expired. Please try signing in again.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              If you believe this is a mistake or would like to appeal, please
              contact our support team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {timeRemaining <= 0 && (
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
              )}

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
