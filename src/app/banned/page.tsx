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
        <div className="gh-box flex items-center gap-2 px-5 py-4 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
          Loading account status...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <HugeIcon
            icon={ShieldUserIcon}
            size={32}
            className="mx-auto text-danger"
          />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Account suspended
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access to GitAura is temporarily restricted for this account.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger-subtle px-4 py-3 text-sm text-foreground">
          <HugeIcon icon={AlertCircleIcon} size={16} className="mt-0.5 shrink-0 text-danger" />
          <p>
            {banInfo?.reason
              ? banInfo.reason
              : "This account has been suspended by an administrator."}
          </p>
        </div>

        {(banInfo?.bannedAt || banInfo?.expiresAt) && (
          <dl className="gh-box mt-4 text-sm">
            {banInfo?.bannedAt ? (
              <div className="gh-box-row flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Suspended on</dt>
                <dd className="text-right text-foreground">{formatDate(banInfo.bannedAt)}</dd>
              </div>
            ) : null}
            {banInfo?.expiresAt ? (
              <div className="gh-box-row flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <HugeIcon icon={ClockAlertIcon} size={16} className="text-attention" />
                  Restriction ends
                </dt>
                <dd className="text-right text-foreground">{formatDate(banInfo.expiresAt)}</dd>
              </div>
            ) : null}
          </dl>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()}>Check again</Button>
          <Button onClick={() => router.push("/sign-in")} variant="outline">
            Return to sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
