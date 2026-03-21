"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, ClockAlertIcon, ShieldUserIcon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { Button } from "@/components/ui/button";

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
      void fetchBanInfo();
    } else if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, router, user]);

  const fetchBanInfo = async () => {
    try {
      const response = await fetch(`/api/check-ban-status?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ban status");
      }

      const data = await response.json();
      if (data.isBanned) {
        setBanInfo({
          reason: data.banReason,
          bannedAt: data.bannedAt,
          expiresAt: data.banExpiresAt,
          bannedBy: data.bannedBy,
        });
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching ban info:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleString();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-[1.75rem] border border-border bg-card p-6 text-center shadow-[0_18px_60px_-42px_rgba(0,0,0,0.38)]">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-red-500/20 bg-red-500/8 text-red-300">
            <HugeIcon icon={ShieldUserIcon} size={28} />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            Account suspended
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Access to GitAura is temporarily restricted for this account.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {banInfo?.reason ? (
            <div className="rounded-[1.4rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <HugeIcon icon={AlertCircleIcon} size={16} className="mt-0.5 text-red-300" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Reason
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{banInfo.reason}</p>
                </div>
              </div>
            </div>
          ) : null}

          {banInfo?.bannedAt ? (
            <div className="rounded-[1.4rem] border border-border bg-background p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Suspended on
              </p>
              <p className="mt-2 text-sm text-foreground">{formatDate(banInfo.bannedAt)}</p>
            </div>
          ) : null}

          {banInfo?.expiresAt ? (
            <div className="rounded-[1.4rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <HugeIcon icon={ClockAlertIcon} size={16} className="mt-0.5 text-amber-300" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Temporary restriction
                  </p>
                  <p className="mt-2 text-sm text-foreground">{formatDate(banInfo.expiresAt)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => window.location.reload()}
            className="h-10 rounded-full px-4 text-sm font-semibold"
          >
            Check again
          </Button>
          <Button
            onClick={() => router.push("/sign-in")}
            variant="outline"
            className="h-10 rounded-full px-4 text-sm font-semibold"
          >
            Return to sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
