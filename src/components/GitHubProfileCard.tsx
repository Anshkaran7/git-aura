"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import { saveUserAura, calculateTotalAura } from "@/lib/aura";
import { calculateStreak } from "@/lib/utils2";
import BadgeDisplay from "./BadgeDisplay";
import ProfileCard from "./ProfileCard";
import EmptyState from "./EmptyState";
// import ShareButtons from "./ShareButtons";
import AuraPanel from "./AuraPanel";
import { themes } from "./themes";
import {
  GitHubProfile,
  GitHubContributions,
  Theme,
  ViewType,
  ContributionDay,
} from "./types";
import MontlyContribution from "./MontlyContribution";
import ShareModal from "./ShareModal";
import { UserAvatar } from "./ui/user-avatar";

interface GitHubProfileCardProps {
  initialUsername?: string;
  profile?: GitHubProfile;
  highlight?: boolean;
}

const GitHubProfileCard: React.FC<GitHubProfileCardProps> = ({
  initialUsername,
  profile: directProfile,
  highlight = false,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");
  const [profile, setProfile] = useState<GitHubProfile | null>(
    directProfile || null
  );
  const [contributions, setContributions] = useState<GitHubContributions>({
    totalContributions: 0,
    contributionDays: [],
    totalIssues: 0,
    totalPullRequests: 0,
    totalRepositories: 0,
    totalGists: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    accountAge: 0,
    totalStars: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("profile");
  const [userAura, setUserAura] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isCalculatingAura, setIsCalculatingAura] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (directProfile) {
      setProfile(directProfile);
      return;
    }
    // Check if we have a username in the URL or props
    const urlUsername = searchParams.get("username") || initialUsername;
    if (urlUsername && urlUsername !== searchedUsername && !loading) {
      setUsername(urlUsername);
      fetchProfile(urlUsername);
    }
  }, [searchParams, initialUsername, directProfile]);

  // Auto-load user's own profile when they sign in (only if no URL username exists)
  useEffect(() => {
    if (
      isSignedIn &&
      user &&
      !searchParams.get("username") &&
      !initialUsername
    ) {
      let githubUsername = null;

      // Check externalAccounts for GitHub
      if (user.externalAccounts && user.externalAccounts.length > 0) {
        const githubAccount = user.externalAccounts.find(
          (account) => account.provider === "github"
        );
        if (githubAccount) {
          githubUsername = githubAccount.username;
        }
      }

      if (
        githubUsername &&
        !profile &&
        githubUsername !== searchedUsername &&
        !loading
      ) {
        setUsername(githubUsername);
        fetchProfile(githubUsername);
      }
    }
  }, [isSignedIn, user, searchParams]);

  const fetchProfile = async (username: string, force = false) => {
    if (!username.trim()) return;

    // Prevent duplicate calls for the same username or if already loading
    if (loading || (!force && searchedUsername === username.trim())) {
      return;
    }

    setLoading(true);
    setError(null);
    setSearchedUsername(username);

    try {
      // Check if current user is viewing their own profile
      const currentUserGithubUsername = user?.externalAccounts?.find(
        (account) => account.provider === "github"
      )?.username;

      const isViewingOwnProfile =
        isSignedIn &&
        currentUserGithubUsername &&
        currentUserGithubUsername.toLowerCase() === username.toLowerCase();

      // Fetch user profile and contributions in a single call
      const url = new URL(
        `/api/github/profile/${username}`,
        window.location.origin
      );

      // Only include userId for authenticated users viewing their own profile
      if (isViewingOwnProfile && user?.id) {
        url.searchParams.set("userId", user.id);
        // Force refresh for own profile
        url.searchParams.set("refresh", "true");
      }

      // Add timestamp to force fresh data
      url.searchParams.set("t", Date.now().toString());

      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch GitHub data");
      }

      const { profile: profileData, contributions: contributionsData } =
        await response.json();

      setProfile(profileData);
      setContributions(contributionsData);

      // Update URL with username - use the new route structure if no initial username
      if (!initialUsername) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("username", username);
        window.history.pushState({}, "", newUrl);
      }

      // Only calculate and save aura when viewing your own profile
      if (isViewingOwnProfile && user?.id) {
        await calculateAndSaveAura(
          profileData,
          contributionsData.contributionDays
        );
      } else {
        // For other profiles or unauthenticated users, just calculate locally
        const localAura = calculateTotalAura(
          contributionsData.contributionDays
        );
        const streak = calculateStreak(contributionsData.contributionDays);
        setUserAura(localAura);
        setCurrentStreak(streak);
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(
        errorMessage === "API rate limit exceeded. Please try again later."
          ? "GitHub API rate limit exceeded. Please try again in a minute."
          : errorMessage
      );
      setProfile(null);
      setContributions({
        totalContributions: 0,
        contributionDays: [],
        totalIssues: 0,
        totalPullRequests: 0,
        totalRepositories: 0,
        totalGists: 0,
        totalFollowers: 0,
        totalFollowing: 0,
        accountAge: 0,
        totalStars: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAndSaveAura = async (
    githubProfile: GitHubProfile,
    contributionDays: ContributionDay[]
  ) => {
    if (!user?.id) return;

    setIsCalculatingAura(true);
    try {
      const result = await saveUserAura(
        user.id,
        githubProfile,
        contributionDays
      );
      if (result.success) {
        setUserAura(result.aura);
        const streak = calculateStreak(contributionDays);
        setCurrentStreak(streak);
      }
    } catch (error) {
      console.error("Error calculating aura:", error);
    } finally {
      setIsCalculatingAura(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim() && username.trim() !== searchedUsername && !loading) {
      // Navigate to the new route structure
      if (initialUsername) {
        // If we're already in a username route, just fetch the new profile
        fetchProfile(username.trim());
      } else {
        // Navigate to the username route
        router.push(`/${username.trim()}`);
      }
    }
  };

  const handleExportImage = async () => {
    if (!profileRef.current) return;

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(profileRef.current, {
        cacheBust: true,
        backgroundColor: getComputedStyle(profileRef.current).backgroundColor,
        pixelRatio: 2,
        skipFonts: false,
      });
      const link = document.createElement("a");
      link.download = `${searchedUsername}-github-profile.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (
    platform: "twitter" | "linkedin",
    customText?: string
  ) => {
    try {
      // Construct the base share URL in the format /user/[username]
      let shareUrl = `${window.location.origin}/user/${searchedUsername}`;

      // Generate and upload image for OG meta tag
      if (profileRef.current) {
        setIsGenerating(true);
        try {
          const dataUrl = await toPng(profileRef.current, {
            cacheBust: true,
            // Solid card background (no transparent/light edges)
            backgroundColor: getComputedStyle(profileRef.current)
              .backgroundColor,
            pixelRatio: 2,
            skipFonts: false,
          });

          const response = await fetch(dataUrl);
          const blob = await response.blob();

          const formData = new FormData();
          formData.append("image", blob);
          formData.append("name", `${searchedUsername}-github-profile-og`);

          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.url;
            setShareImageUrl(imageUrl);

            // Add og_image parameter to the share URL
            shareUrl = `${shareUrl}?og_image=${encodeURIComponent(imageUrl)}`;
          }
        } catch (uploadError) {
          console.error("Error uploading OG image:", uploadError);
          // Continue with sharing even if image upload fails
        } finally {
          setIsGenerating(false);
        }
      }

      // Use custom text or default text
      const text = customText || `Check Out my Aura on Git-Aura 🌟✨ \n`;

      let shareLink = "";
      if (platform === "twitter") {
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareUrl)}`;
      } else if (platform === "linkedin") {
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(
          `${text} ${shareUrl}`
        )}`;
      }

      // Open share window only after everything is ready
      window.open(shareLink, "_blank");
    } catch (err) {
      console.error("Error sharing profile:", err);
      setIsGenerating(false);
    }
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleRefresh = () => {
    if (searchedUsername) {
      fetchProfile(searchedUsername, true);
    }
  };

  const currentUserGithubUsername = user?.externalAccounts?.find(
    (account) => account.provider === "github"
  )?.username;
  const isOwnProfile =
    !!isSignedIn &&
    !!profile &&
    !!currentUserGithubUsername &&
    currentUserGithubUsername.toLowerCase() === profile.login.toLowerCase();

  // If directProfile is provided (battle mode), render a simple card
  if (directProfile) {
    const joinedYear = new Date(directProfile.created_at).getFullYear();
    const accountAgeYears = (
      (Date.now() - new Date(directProfile.created_at).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    ).toFixed(1);
    return (
      <div
        className={`relative flex w-full max-w-[340px] flex-col gap-4 rounded-md border bg-card p-4 ${
          highlight ? "border-success-emphasis" : "border-border"
        }`}
      >
        {/* Winner badge */}
        {highlight && (
          <span className="gh-label absolute -top-2.5 left-4 border-success-emphasis bg-success-emphasis text-white">
            Winner
          </span>
        )}
        {/* Header */}
        <div className="flex items-center gap-3">
          <UserAvatar
            src={directProfile.avatar_url}
            githubUsername={directProfile.login}
            displayName={directProfile.name || directProfile.login}
            alt={directProfile.login}
            className="h-16 w-16 border border-border"
            initialsClassName="text-sm"
            size={128}
          />
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-xl font-semibold leading-tight text-foreground">
              {directProfile.name || directProfile.login}
            </h2>
            <p className="truncate text-base font-light text-muted-foreground">
              @{directProfile.login}
            </p>
          </div>
        </div>
        {/* Bio */}
        {directProfile.bio && (
          <p className="line-clamp-4 text-sm leading-6 text-foreground">
            {directProfile.bio}
          </p>
        )}
        {/* Counts */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold tabular-nums text-foreground">
              {directProfile.public_repos}
            </span>{" "}
            repos
          </span>
          <span>
            <span className="font-semibold tabular-nums text-foreground">
              {directProfile.followers}
            </span>{" "}
            followers
          </span>
          <span>
            <span className="font-semibold tabular-nums text-foreground">
              {directProfile.following}
            </span>{" "}
            following
          </span>
        </div>
        {/* Meta */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border-muted text-sm">
          <div className="flex flex-col gap-0.5 bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground">Joined</span>
            <span className="font-semibold tabular-nums text-foreground">
              {joinedYear}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground">Account age</span>
            <span className="font-semibold tabular-nums text-foreground">
              {accountAgeYears} yrs
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Error Message - Only show on profile view */}
        {currentView === "profile" && error && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-danger/40 bg-danger-subtle px-4 py-3 text-sm text-foreground"
          >
            <span className="font-semibold text-danger">Error: </span>
            {error}
          </div>
        )}

        {/* Content based on current view */}
        {currentView === "profile" && (
          <>
            {/* Loading State */}
            {loading ? (
              <ProfileSkeleton />
            ) : profile ? (
              <ProfileCard
                profile={profile}
                contributions={contributions}
                selectedTheme={selectedTheme}
                profileRef={profileRef}
                handleShareTwitter={openShareModal}
                handleShareLinkedin={openShareModal}
                handleDownload={handleExportImage}
                isGenerating={isGenerating}
                aura={userAura}
                streak={currentStreak}
                onShare={openShareModal}
                onRefresh={handleRefresh}
                isRefreshing={loading}
                overview={
                  <AuraPanel
                    selectedTheme={selectedTheme}
                    userAura={userAura}
                    currentStreak={currentStreak}
                    contributions={contributions}
                    isCalculatingAura={isCalculatingAura}
                    username={profile.login}
                  />
                }
              >
                {isOwnProfile && user?.id && (
                  <BadgeDisplay userId={user.id} selectedTheme={selectedTheme} />
                )}
                <MontlyContribution
                  selectedTheme={selectedTheme}
                  contributions={contributions}
                />
              </ProfileCard>
            ) : (
              !error && (
                <EmptyState
                  selectedTheme={selectedTheme}
                  onLoadProfile={(username) => {
                    if (username !== searchedUsername && !loading) {
                      setUsername(username);
                      fetchProfile(username);
                    }
                  }}
                />
              )
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
        onExportImage={handleExportImage}
        isGenerating={isGenerating}
        username={searchedUsername}
        defaultText={`Check Out my Aura on Git-Aura 🌟✨ \n`}
      />
    </div>
  );
};

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row" aria-busy="true">
      <div className="w-full shrink-0 md:w-64 lg:w-[296px]">
        <div className="flex items-center gap-4 md:block">
          <div className="aspect-square h-16 w-16 animate-pulse rounded-full bg-accent md:h-auto md:w-full" />
          <div className="flex-1 space-y-2 md:mt-4">
            <div className="h-5 w-40 animate-pulse rounded bg-accent" />
            <div className="h-4 w-28 animate-pulse rounded bg-accent" />
          </div>
        </div>
        <div className="mt-4 h-8 w-full animate-pulse rounded-md bg-accent" />
      </div>
      <div className="min-w-0 flex-1 space-y-6">
        <div className="h-36 animate-pulse rounded-md bg-accent" />
        <div className="h-44 animate-pulse rounded-md bg-accent" />
      </div>
    </div>
  );
}

export default GitHubProfileCard;
