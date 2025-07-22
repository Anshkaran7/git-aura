"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Clock,
  Shield,
  User,
  ChevronDown,
} from "lucide-react";

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
  expiresIn?: number; // hours
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

  // Autocomplete states
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for user suggestions
  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/admin/search-users?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get detailed user info
  const searchUser = async (userId?: string) => {
    const targetId = userId || searchTerm;
    if (!targetId.trim()) return;

    setLoading(true);
    setError(null);
    setUserInfo(null);
    setShowDropdown(false);
    setSearchResults([]); // Clear search results when searching

    try {
      const isUserId = targetId.startsWith("user_"); // Clerk user ID format check
      const queryParam = isUserId
        ? `userId=${targetId}`
        : `username=${targetId}`;

      const response = await fetch(`/api/admin/ban-user?${queryParam}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have admin permissions");
        } else if (response.status === 404) {
          throw new Error("User not found");
        } else {
          throw new Error("Failed to fetch user information");
        }
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection from dropdown
  const selectUser = (user: SearchUser) => {
    setSearchTerm(user.githubUsername || user.displayName || user.email);
    setShowDropdown(false);
    setSearchResults([]); // Clear search results
    searchUser(user.id);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && !userInfo) {
        // Only search if no user is currently selected
        searchUsers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, userInfo]);

  // Click outside to close dropdown
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

  const handleBanAction = async (action: BanAction) => {
    if (!userInfo) return;

    setActionLoading(true);
    setError(null);

    try {
      const payload = {
        targetUserId: userInfo.id,
        action: action.action,
        reason: action.reason,
        expiresIn: action.expiresIn,
      };

      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to perform action");
      }

      const result = await response.json();

      // Refresh user info
      await searchUser();

      // Clear form
      setBanReason("");
      setBanDuration("");

      console.log(`✅ Action completed: ${result.message}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isTemporaryBan = userInfo?.banExpiresAt;
  const isBanExpired =
    isTemporaryBan && new Date(userInfo.banExpiresAt!) < new Date();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      {/* <div className="text-center">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
          User Management
        </h1>
        <p className="text-[#7d8590] text-sm sm:text-base">
          Search and manage user accounts with advanced controls
        </p>
      </div> */}

      {/* Search Section */}
      <Card className="p-4 sm:p-6 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2 sm:mb-3">
              Search User
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search users... (GitHub username, name, or email)"
                    className="w-full p-3 sm:p-4 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 pr-10"
                    onKeyPress={(e) => e.key === "Enter" && searchUser()}
                    onFocus={() => {
                      if (searchTerm.length >= 2 && !userInfo) {
                        setShowDropdown(true);
                      }
                    }}
                  />
                  {searchLoading && (
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                </div>
                <Button
                  onClick={() => searchUser()}
                  disabled={loading || !searchTerm.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Searching...
                    </div>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>

              {/* Dropdown Results */}
              {showDropdown && searchResults.length > 0 && !userInfo && (
                <div className="absolute z-10 w-full mt-2 bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className="p-3 sm:p-4 hover:bg-gray-800/80 cursor-pointer border-b border-gray-700/50 last:border-b-0 flex items-center gap-3 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border border-gray-600/50">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium truncate">
                            @
                            {user.githubUsername ||
                              user.displayName ||
                              "Unknown"}
                          </span>
                          {user.isBanned && (
                            <Badge
                              variant="destructive"
                              className="text-xs bg-red-500/20 text-red-300 border border-red-500/30"
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Banned
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {user.displayName &&
                            user.githubUsername !== user.displayName && (
                              <span className="text-gray-300">
                                {user.displayName} •{" "}
                              </span>
                            )}
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown &&
                searchTerm.length >= 2 &&
                searchResults.length === 0 &&
                !searchLoading &&
                !userInfo && (
                  <div className="absolute z-10 w-full mt-2 bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-2xl p-4 backdrop-blur-sm">
                    <div className="text-gray-400 text-center flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      No users found
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 sm:p-6 border-red-500/30 bg-red-900/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-red-300">
            <div className="p-2 bg-red-500/20 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="font-medium">{error}</span>
          </div>
        </Card>
      )}

      {/* User Information */}
      {userInfo && (
        <Card className="p-4 sm:p-6 bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm space-y-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border border-gray-600/50">
              <User className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300" />
            </div>
            <div className="flex-1 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {userInfo.displayName ||
                    userInfo.githubUsername ||
                    "Unknown User"}
                </h3>
                <Badge
                  variant={userInfo.isBanned ? "destructive" : "default"}
                  className={
                    userInfo.isBanned
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                  }
                >
                  {userInfo.isBanned ? (
                    <>
                      <Ban className="w-3 h-3 mr-1" />
                      {isBanExpired ? "Expired Ban" : "Banned"}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  )}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                  <p className="text-gray-400 mb-1">
                    <strong>GitHub:</strong>
                  </p>
                  <p className="text-white font-medium">
                    @{userInfo.githubUsername || "Not connected"}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                  <p className="text-gray-400 mb-1">
                    <strong>Email:</strong>
                  </p>
                  <p className="text-white font-medium">{userInfo.email}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                  <p className="text-gray-400 mb-1">
                    <strong>User ID:</strong>
                  </p>
                  <p className="text-white font-mono text-xs sm:text-sm break-all">
                    {userInfo.id}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                  <p className="text-gray-400 mb-1">
                    <strong>Joined:</strong>
                  </p>
                  <p className="text-white font-medium">
                    {formatDate(userInfo.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ban Information */}
          {userInfo.isBanned && (
            <div className="bg-gradient-to-r from-red-950/40 to-orange-950/20 border border-red-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div className="space-y-3 flex-1">
                  <h4 className="font-semibold text-red-300 text-lg">
                    Ban Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userInfo.banReason && (
                      <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/20">
                        <p className="text-gray-400 text-sm mb-1">
                          <strong>Reason:</strong>
                        </p>
                        <p className="text-red-200 font-medium">
                          {userInfo.banReason}
                        </p>
                      </div>
                    )}
                    {userInfo.bannedAt && (
                      <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/20">
                        <p className="text-gray-400 text-sm mb-1">
                          <strong>Banned on:</strong>
                        </p>
                        <p className="text-red-200 font-medium">
                          {formatDate(userInfo.bannedAt)}
                        </p>
                      </div>
                    )}
                    {isTemporaryBan && (
                      <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/20 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <p className="text-gray-400 text-sm">
                            <strong>Expires:</strong>
                          </p>
                        </div>
                        <p className="text-orange-200 font-medium">
                          {formatDate(userInfo.banExpiresAt!)}
                          {isBanExpired && (
                            <span className="text-green-400 ml-2 font-semibold">
                              (Expired)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Section */}
          <div className="border-t border-gray-700/50 pt-6">
            {userInfo.isBanned ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-white text-lg">
                    Unban User
                  </h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Remove the ban and restore user access to the platform.
                </p>
                <Button
                  onClick={() => handleBanAction({ action: "unban" })}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    "Unban User"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-full">
                    <Ban className="w-5 h-5 text-red-400" />
                  </div>
                  <h4 className="font-semibold text-white text-lg">Ban User</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Restrict user access to the platform. You can set a temporary
                  ban or make it permanent.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Ban Reason
                    </label>
                    <input
                      type="text"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Enter ban reason"
                      className="w-full p-3 sm:p-4 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Duration (hours, leave empty for permanent)
                    </label>
                    <input
                      type="number"
                      value={banDuration}
                      onChange={(e) =>
                        setBanDuration(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="Optional: hours until unban"
                      className="w-full p-3 sm:p-4 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      handleBanAction({
                        action: "ban",
                        reason: banReason || "No reason provided",
                        expiresIn: banDuration || undefined,
                      })
                    }
                    disabled={actionLoading || !banReason.trim()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      "Ban User"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
