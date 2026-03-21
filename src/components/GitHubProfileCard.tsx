"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import { saveUserAura, calculateTotalAura } from "@/lib/aura";
import { calculateStreak } from "@/lib/utils2";
import Leaderboard from "./Leaderboard";
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

  const fetchProfile = async (username: string) => {
    if (!username.trim()) return;

    // Prevent duplicate calls for the same username or if already loading
    if (loading || searchedUsername === username.trim()) {
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
        backgroundColor: undefined,
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
            backgroundColor:
              selectedTheme.name === "Light" ? "#f9fafb" : "#0d1117",
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

  // If directProfile is provided (battle mode), render a simple card
  if (directProfile) {
    const joinedYear = new Date(directProfile.created_at).getFullYear();
    const accountAgeYears = (
      (Date.now() - new Date(directProfile.created_at).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    ).toFixed(1);
    return (
      <div
        className={`relative w-full max-w-[340px] rounded-[28px] border ${
          highlight
            ? "border-foreground/20 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.6)]"
            : "border-border shadow-[0_25px_70px_-45px_rgba(15,23,42,0.35)]"
        } bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-5 flex flex-col gap-4`}
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_70%)]" />
        {/* Winner badge */}
        {highlight && (
          <span className="absolute -top-3 left-4 rounded-full border border-border bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-background shadow-[0_10px_30px_-18px_rgba(255,255,255,0.45)]">
            WINNER
          </span>
        )}
        {/* Header */}
        <div className="relative flex items-center gap-3">
          <UserAvatar
            src={directProfile.avatar_url}
            githubUsername={directProfile.login}
            displayName={directProfile.name || directProfile.login}
            alt={directProfile.login}
            className="h-16 w-16 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.55)]"
            initialsClassName="text-sm"
            size={128}
          />
          <div className="flex flex-col min-w-0">
            <h2 className="truncate text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground">
              {directProfile.name || directProfile.login}
            </h2>
            <p className="truncate text-[15px] text-muted-foreground">
              @{directProfile.login}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              <span className="rounded-full border border-border bg-background/90 px-2.5 py-1">
                {directProfile.public_repos} repos
              </span>
              <span className="rounded-full border border-border bg-background/90 px-2.5 py-1">
                {directProfile.followers} followers
              </span>
              <span className="rounded-full border border-border bg-background/90 px-2.5 py-1">
                {directProfile.following} following
              </span>
            </div>
          </div>
        </div>
        {/* Bio */}
        {directProfile.bio && (
          <p className="text-[12px] leading-6 text-muted-foreground line-clamp-4">
            {directProfile.bio}
          </p>
        )}
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="flex flex-col gap-1 rounded-[20px] border border-border bg-background/90 p-3.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Joined
            </span>
            <span className="text-foreground font-medium">{joinedYear}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-[20px] border border-border bg-background/90 p-3.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Age
            </span>
            <span className="text-foreground font-medium">
              {accountAgeYears} yrs
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background font-mona-sans">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Error Message - Only show on profile view */}
        {currentView === "profile" && error && (
          <div className="mb-4 rounded-[24px] border border-red-500/20 bg-red-500/10 p-4">
            <p className="flex flex-col gap-2 text-xs text-red-100 sm:text-sm">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">
                Error
              </span>
              <span className="flex-1">{error}</span>
            </p>
          </div>
        )}

        {/* Content based on current view */}
        {currentView === "profile" && (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Loading State */}
            {loading ? (
              <div className="flex w-full items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border border-foreground/20 border-t-foreground"></div>
              </div>
            ) : profile ? (
              <>
                <ProfileCard
                  profile={profile}
                  contributions={contributions}
                  selectedTheme={selectedTheme}
                  profileRef={profileRef}
                  handleShareTwitter={openShareModal}
                  handleShareLinkedin={openShareModal}
                  handleDownload={handleExportImage}
                  isGenerating={isGenerating}
                />
                <MontlyContribution
                  selectedTheme={selectedTheme}
                  contributions={contributions}
                />
                <AuraPanel
                  selectedTheme={selectedTheme}
                  userAura={userAura}
                  currentStreak={currentStreak}
                  contributions={contributions}
                  isCalculatingAura={isCalculatingAura}
                />
              </>
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
          </div>
        )}

        {/* Leaderboard View */}
        {/* {currentView === "leaderboard" && (
          <div className="mt-4 sm:mt-6 md:mt-8">
            <Leaderboard
              currentUserId={user?.id}
              selectedTheme={selectedTheme}
              contributions={contributions}
            />
          </div>
        )} */}

        {/* Badges View */}
        {/* {currentView === "badges" && isSignedIn && user?.id && (
          <div className="mt-4 sm:mt-6 md:mt-8">
            <BadgeDisplay userId={user.id} selectedTheme={selectedTheme} />
          </div>
        )} */}
      </div>

      {/* Footer - Hide on badges view */}
      {currentView !== "badges" && (
        <footer className="border-t border-border bg-background/90 px-4 py-4 backdrop-blur-sm">
          <p className="mx-auto max-w-screen-xl text-center text-[11px] text-muted-foreground sm:text-xs">
            Made with ❤️ by{" "}
            <a
              href="https://karandev.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              Karan
            </a>
          </p>
        </footer>
      )}

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

export default GitHubProfileCard;
