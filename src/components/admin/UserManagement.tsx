"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircleIcon,
  ClockAlertIcon,
  ShieldUserIcon,
} from "@hugeicons/core-free-icons";
import { Ban, CheckCircle, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const statusLabel = userInfo?.isBanned
    ? isBanExpired
      ? { text: "Ban expired", className: "border-transparent bg-attention-subtle text-attention" }
      : { text: "Banned", className: "border-transparent bg-danger-subtle text-danger" }
    : { text: "Active", className: "border-transparent bg-success-subtle text-success" };

  return (
    <div className="space-y-6">
      <section className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          User management
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Search for a user, review their account status, and apply a ban or
          unban action.
        </p>
      </section>

      <div className="gh-box">
        <div className="gh-box-header">
          <div className="flex items-center gap-2">
            <HugeIcon icon={ShieldUserIcon} size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">User lookup</h2>
          </div>
        </div>
        <div className="p-4" ref={dropdownRef}>
          <label htmlFor="admin-user-search" className="mb-1.5 block text-xs text-muted-foreground">
            Search by GitHub username, display name, email, or Clerk user ID.
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-user-search"
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
                className="pl-8 pr-8"
              />
              {searchLoading && (
                <span className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
              )}

              {showDropdown && !userInfo && (
                <div className="gh-box gh-shadow absolute z-20 mt-1 w-full overflow-hidden">
                  {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectUser(user)}
                        className="flex w-full items-center gap-3 border-t border-border-muted px-3 py-2 text-left first:border-t-0 hover:bg-accent"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-canvas-subtle">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            @{user.githubUsername || user.displayName || "Unknown"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        {user.isBanned && (
                          <span className="gh-label border-transparent bg-danger-subtle text-danger">
                            Banned
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                      No users found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => void searchUser()}
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger-subtle px-4 py-3 text-sm text-foreground">
          <HugeIcon icon={AlertCircleIcon} size={16} className="mt-0.5 shrink-0 text-danger" />
          <p>{error}</p>
        </div>
      )}

      {userInfo && (
        <div className="gh-box">
          <div className="gh-box-header">
            <div className="flex min-w-0 items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h2 className="truncate text-sm font-semibold text-foreground">
                {userInfo.displayName || userInfo.githubUsername || "Unknown user"}
              </h2>
            </div>
            <span className={`gh-label ${statusLabel.className}`}>{statusLabel.text}</span>
          </div>

          <dl className="text-sm">
            {[
              ["GitHub", `@${userInfo.githubUsername || "Not connected"}`, ""],
              ["Email", userInfo.email, "break-all"],
              ["User ID", userInfo.id, "break-all font-mono text-xs"],
              ["Joined", formatDate(userInfo.createdAt), ""],
            ].map(([label, value, className]) => (
              <div
                key={label}
                className="gh-box-row grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className={`text-foreground ${className}`}>{value}</dd>
              </div>
            ))}
          </dl>

          {userInfo.isBanned && (
            <div className="border-t border-border-muted p-4">
              <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger-subtle px-4 py-3 text-sm">
                <HugeIcon icon={AlertCircleIcon} size={16} className="mt-0.5 shrink-0 text-danger" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">Ban details</h3>
                  {userInfo.banReason && (
                    <p className="text-muted-foreground">Reason: {userInfo.banReason}</p>
                  )}
                  {userInfo.bannedAt && (
                    <p className="text-muted-foreground">
                      Banned at: {formatDate(userInfo.bannedAt)}
                    </p>
                  )}
                  {isTemporaryBan && userInfo.banExpiresAt && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <HugeIcon icon={ClockAlertIcon} size={14} className="text-attention" />
                      Expires: {formatDate(userInfo.banExpiresAt)}
                      {isBanExpired && " (expired)"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border p-4">
            {userInfo.isBanned ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
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
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-danger">Ban this user</h3>
                <p className="text-sm text-muted-foreground">
                  Restrict access with a clear reason. Leave duration empty for a
                  permanent ban.
                </p>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
                  <div className="space-y-1.5">
                    <label htmlFor="ban-reason" className="text-xs font-semibold text-foreground">
                      Ban reason
                    </label>
                    <Input
                      id="ban-reason"
                      value={banReason}
                      onChange={(event) => setBanReason(event.target.value)}
                      placeholder="Explain why this access is being restricted"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="ban-duration" className="text-xs font-semibold text-foreground">
                      Duration in hours
                    </label>
                    <Input
                      id="ban-duration"
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
        </div>
      )}
    </div>
  );
}
