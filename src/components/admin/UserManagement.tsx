"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircleIcon,
  ClockAlertIcon,
  ShieldUserIcon,
} from "@hugeicons/core-free-icons";
import { Ban, CheckCircle, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HugeIcon } from "@/components/ui/huge-icon";

interface UserInfo {
  id: string;
  displayName?: string;
  githubUsername?: string;
  email: string;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  banExpiresAt?: string;
  createdAt: string;
}

interface BanAction {
  action: "ban" | "unban";
  reason?: string;
  expiresIn?: number;
}

interface SearchUser {
  id: string;
  displayName?: string;
  githubUsername?: string;
  email: string;
  avatarUrl?: string;
  isBanned: boolean;
  label: string;
  value: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<number | "">("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString();
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchLoading(false);
      searchAbortRef.current?.abort();
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setSearchLoading(true);

    try {
      const response = await fetch(
        `/api/admin/search-users?q=${encodeURIComponent(query.trim())}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      const data = await response.json();
      setSearchResults(data.users || []);
      setShowDropdown(true);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const searchUser = useCallback(async (userId?: string) => {
    const targetId = (userId || searchTerm).trim();
    if (!targetId) {
      return;
    }

    setLoading(true);
    setError(null);
    setUserInfo(null);
    setShowDropdown(false);
    setSearchResults([]);

    try {
      const isUserId = targetId.startsWith("user_");
      const queryParam = isUserId
        ? `userId=${encodeURIComponent(targetId)}`
        : `username=${encodeURIComponent(targetId)}`;

      const response = await fetch(`/api/admin/ban-user?${queryParam}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have admin permissions.");
        }
        if (response.status === 404) {
          throw new Error("User not found.");
        }
        throw new Error("Failed to fetch user information.");
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchTerm && !userInfo) {
        void searchUsers(searchTerm);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchTerm, searchUsers, userInfo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      searchAbortRef.current?.abort();
    };
  }, []);

  const handleBanAction = useCallback(async (action: BanAction) => {
    if (!userInfo) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: userInfo.id,
          action: action.action,
          reason: action.reason,
          expiresIn: action.expiresIn,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to perform action.");
      }

      setBanReason("");
      setBanDuration("");
      await searchUser(userInfo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setActionLoading(false);
    }
  }, [searchUser, userInfo]);

  const selectUser = useCallback((user: SearchUser) => {
    setSearchTerm(user.githubUsername || user.displayName || user.email);
    setShowDropdown(false);
    setSearchResults([]);
    void searchUser(user.id);
  }, [searchUser]);

  const isTemporaryBan = Boolean(userInfo?.banExpiresAt);
  const isBanExpired =
    Boolean(userInfo?.banExpiresAt) &&
    new Date(userInfo?.banExpiresAt ?? 0) < new Date();

  return (
    <div className="space-y-5">
      <section>
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="rounded-full border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          >
            Admin tools
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground">
            Manage user access cleanly.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Search for a user, review their account status, and apply a ban or
            unban action with clear context.
          </p>
        </div>
      </section>

      <Card className="rounded-[28px] border-border/80 bg-card/80 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground sm:text-[15px]">
              User lookup
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Search by GitHub username, display name, email, or Clerk user ID.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background">
            <HugeIcon icon={ShieldUserIcon} size={18} className="text-primary" />
          </div>
        </div>

        <div className="mt-5" ref={dropdownRef}>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search users..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void searchUser();
                  }
                }}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2 && !userInfo) {
                    setShowDropdown(true);
                  }
                }}
                className="pr-10"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                {searchLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {showDropdown && !userInfo && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_25px_60px_-40px_rgba(15,23,42,0.4)]">
                  {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectUser(user)}
                        className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-background"
                      >
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            @{user.githubUsername || user.displayName || "Unknown"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        {user.isBanned && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-red-300"
                          >
                            Banned
                          </Badge>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                      No users found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={() => void searchUser()}
              disabled={loading || !searchTerm.trim()}
              className="h-11"
            >
              {loading ? "Searching..." : "Search user"}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="rounded-[24px] border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <HugeIcon icon={AlertCircleIcon} size={18} className="mt-0.5 text-red-300" />
            <p className="text-sm leading-6 text-red-100">{error}</p>
          </div>
        </Card>
      )}

      {userInfo && (
        <Card className="rounded-[28px] border-border/80 bg-card/80 p-5 sm:p-6">
          <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border bg-background">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                  {userInfo.displayName || userInfo.githubUsername || "Unknown user"}
                </h2>
                <Badge
                  variant="outline"
                  className={
                    userInfo.isBanned
                      ? "rounded-full border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-red-300"
                      : "rounded-full border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                  }
                >
                  {userInfo.isBanned
                    ? isBanExpired
                      ? "Ban expired"
                      : "Banned"
                    : "Active"}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-background px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    GitHub
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    @{userInfo.githubUsername || "Not connected"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-border bg-background px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm text-foreground">
                    {userInfo.email}
                  </p>
                </div>
                <div className="rounded-[22px] border border-border bg-background px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    User ID
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-foreground">
                    {userInfo.id}
                  </p>
                </div>
                <div className="rounded-[22px] border border-border bg-background px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Joined
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {formatDate(userInfo.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {userInfo.isBanned && (
            <div className="mt-5 rounded-[24px] border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <HugeIcon icon={AlertCircleIcon} size={18} className="mt-0.5 text-red-300" />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Ban details
                  </h3>
                  {userInfo.banReason && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Reason: {userInfo.banReason}
                    </p>
                  )}
                  {userInfo.bannedAt && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Banned at: {formatDate(userInfo.bannedAt)}
                    </p>
                  )}
                  {isTemporaryBan && userInfo.banExpiresAt && (
                    <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                      <HugeIcon icon={ClockAlertIcon} size={16} className="mt-1 text-amber-300" />
                      <span>
                        Expires: {formatDate(userInfo.banExpiresAt)}
                        {isBanExpired && " (expired)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-border pt-5">
            {userInfo.isBanned ? (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  Remove the restriction and restore account access.
                </p>
                <Button
                  onClick={() => void handleBanAction({ action: "unban" })}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Unban user
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Restrict access with a clear reason. Leave duration empty for a
                  permanent ban.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Ban reason
                    </label>
                    <Input
                      value={banReason}
                      onChange={(event) => setBanReason(event.target.value)}
                      placeholder="Explain why this access is being restricted"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Duration in hours
                    </label>
                    <Input
                      type="number"
                      value={banDuration}
                      onChange={(event) =>
                        setBanDuration(
                          event.target.value === "" ? "" : Number(event.target.value)
                        )
                      }
                      min="1"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <Button
                  onClick={() =>
                    void handleBanAction({
                      action: "ban",
                      reason: banReason.trim(),
                      expiresIn: banDuration || undefined,
                    })
                  }
                  disabled={actionLoading || !banReason.trim()}
                  variant="destructive"
                >
                  {actionLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Ban className="h-4 w-4" />
                      Ban user
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
