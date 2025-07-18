"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { saveUserAura, calculateTotalAura } from "@/lib/aura";
import { calculateStreak } from "@/lib/utils2";
import Leaderboard from "./Leaderboard";
import BadgeDisplay from "./BadgeDisplay";
import SearchBar from "./SearchBar";
import ProfileCard from "./ProfileCard";
import EmptyState from "./EmptyState";
import ShareButtons from "./ShareButtons";
import AuraPanel from "./AuraPanel";
import { themes } from "./themes";
import {
  GitHubProfile,
  GitHubContributions,
  ShareableProfile,
  Theme,
  ViewType,
  ContributionDay,
} from "./types";
import MontlyContribution from "./MontlyContribution";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface GitHubProfileCardProps {
  initialUsername?: string;
}

const GitHubProfileCard: React.FC<GitHubProfileCardProps> = ({
  initialUsername,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [contributions, setContributions] = useState<GitHubContributions>({
    totalContributions: 0,
    contributionDays: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [shareableId, setShareableId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("profile");
  const [userAura, setUserAura] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isCalculatingAura, setIsCalculatingAura] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we have a share ID or username in the URL or props
    const shareId = searchParams.get("share");
    const urlUsername = searchParams.get("username") || initialUsername;

    if (shareId) {
      loadSharedProfile(shareId);
    } else if (urlUsername && urlUsername !== searchedUsername && !loading) {
      setUsername(urlUsername);
      fetchProfile(urlUsername);
    }
  }, [searchParams, initialUsername]);

  // Auto-load user's own profile when they sign in (only if no URL username exists)
  useEffect(() => {
    if (
      isSignedIn &&
      user &&
      !searchParams.get("username") &&
      !initialUsername &&
      !searchParams.get("share")
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

  const loadSharedProfile = async (shareId: string) => {
    try {
      const { data, error } = await supabase
        .from("github_profiles")
        .select("*")
        .eq("id", shareId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data.profile_data);
        setContributions({
          totalContributions: data.contributions.totalContributions,
          contributionDays: data.contributions.contributionDays,
        });
        setSearchedUsername(data.username);
        setShareableId(data.id);
      }
    } catch (err) {
      console.error("Error loading shared profile:", err);
    }
  };

  const generateShareableProfile = async () => {
    if (!profile || !contributions.contributionDays.length) return null;

    setIsGenerating(true);
    try {
      // Generate image
      let imageUrl = null;
      if (profileRef.current) {
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
          formData.append("name", `${searchedUsername}-github-profile`);

          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            imageUrl = uploadData.url;
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        }
      }

      const id = nanoid(10);
      const shareableProfile: ShareableProfile = {
        id,
        username: searchedUsername,
        profile_data: profile,
        contributions,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("github_profiles")
        .insert(shareableProfile);

      if (error) throw error;

      setShareableId(id);

      // Update URL
      const baseUrl = window.location.origin;
      const params = new URLSearchParams();
      params.set("share", id);
      params.set("username", searchedUsername);

      if (imageUrl) {
        params.set("og_image", imageUrl);
      }

      const newUrl = `${baseUrl}/?${params.toString()}`;
      await router.push(newUrl);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return id;
    } catch (err) {
      console.error("Error generating shareable profile:", err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

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
      // Fetch user profile and contributions in a single call
      // Include userId for authenticated users to enable background aura saving
      const url = new URL(
        `/api/github/profile/${username}`,
        window.location.origin
      );
      if (isSignedIn && user?.id) {
        url.searchParams.set("userId", user.id);
      }

      const response = await fetch(url);
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

      // Calculate aura
      if (isSignedIn && user?.id) {
        await calculateAndSaveAura(
          profileData,
          contributionsData.contributionDays
        );
      } else {
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
      setShareableId(null);

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
      if (!shareableId) {
        const newShareableId = await generateShareableProfile();
        if (!newShareableId) return;
      }

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
      let currentShareableId = shareableId;

      if (!currentShareableId) {
        currentShareableId = await generateShareableProfile();
        if (!currentShareableId) return;
      }

      const shareUrl = window.location.href;
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

      window.open(shareLink, "_blank", "width=600,height=400");
    } catch (err) {
      console.error("Error sharing profile:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black font-mona-sans transition-colors duration-300">
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
            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center w-full py-12 sm:py-16 md:py-20">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-gray-300"></div>
              </div>
            ) : profile ? (
              <>
                <ProfileCard
                  profile={profile}
                  contributions={contributions}
                  selectedTheme={selectedTheme}
                  profileRef={profileRef}
                  handleShareTwitter={() => handleShare("twitter")}
                  handleShareLinkedin={() => handleShare("linkedin")}
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
        <footer className="fixed inset-x-0 bottom-0 py-2 sm:py-3 md:py-4 px-2 sm:px-4 text-gray-300 bg-black/80 backdrop-blur-sm border-t border-gray-800/50">
          <p className="text-[10px] sm:text-xs md:text-sm max-w-screen-xl mx-auto text-center">
            Made with ❤️ by{" "}
            <a
              href="https://karandev.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline transition-all duration-200 text-gray-300 hover:text-white"
            >
              Karan
            </a>
          </p>
        </footer>
      )}
    </div>
  );
};

export default GitHubProfileCard;
