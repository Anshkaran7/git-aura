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
  const [profile, setProfile] = useState<GitHubProfile | null>(directProfile || null);
  const [contributions, setContributions] = useState<GitHubContributions>({
    totalContributions: 0,
    contributionDays: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("profile");
  const [userAura, setUserAura] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isCalculatingAura, setIsCalculatingAura] = useState(false);
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
      setContributions({ totalContributions: 0, contributionDays: [] });
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

  const handleShare = async (platform: "twitter" | "linkedin") => {
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

            // Add og_image parameter to the share URL
            shareUrl = `${shareUrl}?og_image=${encodeURIComponent(imageUrl)}`;
          }
        } catch (uploadError) {
          console.error("Error uploading OG image:", uploadError);
          // Continue with sharing even if image upload fails
        }
        setIsGenerating(false);
      }

      // Generate share text and links after image upload is complete
      const text = `Check out my GitHub contributions! 🚀`;

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


  // If directProfile is provided (battle mode), render a simple card
  if (directProfile) {
    const joinedYear = new Date(directProfile.created_at).getFullYear();
    const accountAgeYears = ((Date.now() - new Date(directProfile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
    return (
      <div className={`relative w-[320px] md:w-[340px] rounded-xl border ${highlight ? 'border-yellow-400 shadow-[0_0_0_1px_rgba(250,204,21,0.4)]' : 'border-gray-800'} bg-gradient-to-b from-[#1d232c] to-[#161b21] p-5 flex flex-col gap-4`}>        
        {/* Winner badge */}
        {highlight && (
          <span className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-yellow-400 text-black shadow">WINNER</span>
        )}
        {/* Header */}
        <div className="flex items-center gap-3">
          <img src={directProfile.avatar_url} alt={directProfile.login} className="w-16 h-16 rounded-full border border-gray-700 object-cover" />
          <div className="flex flex-col min-w-0">
            <h2 className="text-base font-semibold text-white truncate">{directProfile.name || directProfile.login}</h2>
            <p className="text-xs text-gray-400 truncate">@{directProfile.login}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-gray-400">
              <span className="px-1.5 py-0.5 bg-gray-800/60 rounded border border-gray-700">{directProfile.public_repos} repos</span>
              <span className="px-1.5 py-0.5 bg-gray-800/60 rounded border border-gray-700">{directProfile.followers} followers</span>
              <span className="px-1.5 py-0.5 bg-gray-800/60 rounded border border-gray-700">{directProfile.following} following</span>
            </div>
          </div>
        </div>
        {/* Bio */}
        {directProfile.bio && (
          <p className="text-[11px] leading-relaxed text-gray-300 line-clamp-4">
            {directProfile.bio}
          </p>
        )}
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="flex flex-col gap-1 bg-gray-800/30 rounded-lg p-2 border border-gray-700/60">
            <span className="text-gray-400">Joined</span>
            <span className="text-white font-medium">{joinedYear}</span>
          </div>
          <div className="flex flex-col gap-1 bg-gray-800/30 rounded-lg p-2 border border-gray-700/60">
            <span className="text-gray-400">Age</span>
            <span className="text-white font-medium">{accountAgeYears} yrs</span>
          </div>
        </div>
      </div>
    );
  }

  // ...existing code...
};

export default GitHubProfileCard;
