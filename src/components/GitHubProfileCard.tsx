"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { toPng, toJpeg } from "html-to-image";

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
import { ProfileCardSkeleton } from "./skeletons/ProfileCardSkeleton";
import { MonthlyContributionSkeleton, AuraPanelSkeleton } from "./skeletons/ContributionSkeleton";
import { motion, AnimatePresence } from "framer-motion";

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

  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>('png');
  const profileRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
      console.log("Skipping duplicate fetchProfile call for:", username);
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

  const handleExportImage = async (format: 'png' | 'jpg' = 'png') => {

    if (!profileRef.current) return;

    try {
      setIsGenerating(true);
      let dataUrl: string;
      
      if (format === 'jpg') {
        dataUrl = await toJpeg(profileRef.current, {
          cacheBust: true,
          backgroundColor: undefined,
          pixelRatio: 2,
          skipFonts: false,
          quality: 0.95,
        });
      } else {
        dataUrl = await toPng(profileRef.current, {
          cacheBust: true,
          backgroundColor: undefined,
          pixelRatio: 2,
          skipFonts: false,
        });
      }
      
      const githubHandle = searchedUsername || 'profile';
      const date = new Date().toISOString().slice(0, 10);
      const filename = `${githubHandle}-profile-${date}.${format}`;
      const link = document.createElement("a");
      link.download = filename;

      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (typeof window !== 'undefined' && 'toast' in window) {
        (window as any).toast.success('Image downloaded!');
      } else {
        alert('Image downloaded!');
      }
    } catch (err) {
      console.error("Failed to export image:", err);
      if (typeof window !== 'undefined' && 'toast' in window) {
        (window as any).toast.error('Failed to download image. Check browser settings.');
      } else {
        alert('Failed to download image. Check browser settings.');
      }

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
        className={`relative w-[320px] md:w-[340px] rounded-xl border ${
          highlight
            ? "border-yellow-400 shadow-[0_0_0_1px_rgba(250,204,21,0.4)]"
            : "border-border"
        } bg-gradient-to-b from-card to-card/80 p-5 flex flex-col gap-4`}
      >
        {/* Winner badge */}
        {highlight && (
          <span className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-yellow-400 text-black shadow">
            WINNER
          </span>
        )}
        {/* Header */}
        <div className="flex items-center gap-3">
          <img
            src={directProfile.avatar_url}
            alt={directProfile.login}
            className="w-16 h-16 rounded-full border border-border object-cover"
          />
          <div className="flex flex-col min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">
              {directProfile.name || directProfile.login}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              @{directProfile.login}
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-muted/60 rounded border border-border">
                {directProfile.public_repos} repos
              </span>
              <span className="px-1.5 py-0.5 bg-muted/60 rounded border border-border">
                {directProfile.followers} followers
              </span>
              <span className="px-1.5 py-0.5 bg-muted/60 rounded border border-border">
                {directProfile.following} following
              </span>
            </div>
          </div>
        </div>
        {/* Bio */}
        {directProfile.bio && (
          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-4">
            {directProfile.bio}
          </p>
        )}
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="flex flex-col gap-1 bg-muted/30 rounded-lg p-2 border border-border/60">
            <span className="text-muted-foreground">Joined</span>
            <span className="text-foreground font-medium">{joinedYear}</span>
          </div>
          <div className="flex flex-col gap-1 bg-muted/30 rounded-lg p-2 border border-border/60">
            <span className="text-muted-foreground">Age</span>
            <span className="text-foreground font-medium">
              {accountAgeYears} yrs
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background font-mona-sans transition-colors duration-300">
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6">
        {/* Error Message - Only show on profile view */}
        {currentView === "profile" && error && (
          <div className="bg-gray-900/60 backdrop-blur-sm text-gray-200 p-3 sm:p-4 md:p-5 rounded-lg mb-4 sm:mb-6 border border-gray-700/50 mx-1 sm:mx-0">
            <p className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs sm:text-sm">
              <span className="text-red-400 text-base sm:text-lg">⚠️</span>
              <span className="flex-1">{error}</span>
            </p>
          </div>
        )}

        {/* Content based on current view */}
        {currentView === "profile" && (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">

            <AnimatePresence mode="wait">
              {/* Loading State */}
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 sm:space-y-6 md:space-y-8"
                >
                  <ProfileCardSkeleton />
                  <MonthlyContributionSkeleton />
                  <AuraPanelSkeleton />
                </motion.div>
              ) : profile ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-4 sm:space-y-6 md:space-y-8"
                >
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
                </motion.div>
              ) : (
                !error && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmptyState
                      selectedTheme={selectedTheme}
                      onLoadProfile={(username) => {
                        if (username !== searchedUsername && !loading) {
                          setUsername(username);
                          fetchProfile(username);
                        }
                      }}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
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
        <footer className="fixed inset-x-0 bottom-0 py-2 sm:py-3 md:py-4 px-2 sm:px-4 text-gray-300 bg-background/80 backdrop-blur-sm border-t border-gray-800/50">
          <p className="text-[10px] sm:text-xs md:text-sm max-w-screen-xl mx-auto text-center">
            Made with ❤️ by{" "}
            <a
              href="https://karandev.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline transition-all duration-200 text-gray-300 hover:text-foreground"
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
