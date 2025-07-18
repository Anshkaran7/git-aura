"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import { createClient } from "@supabase/supabase-js";
import { calculateTotalAura, saveUserAura } from "@/lib/aura";
import { calculateStreak } from "@/lib/utils2";
import { Header } from "@/components/home";
import MontlyContribution from "@/components/MontlyContribution";
import ProfileCard from "@/components/ProfileCard";
import AuraPanel from "@/components/AuraPanel";
import EmptyState from "@/components/EmptyState";
import { themes } from "@/components/themes";
import {
  GitHubProfile,
  GitHubContributions,
  Theme,
  ContributionDay,
} from "@/components/types";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function UserPage() {
  const params = useParams();
  const { isSignedIn, user, isLoaded } = useUser();
  const userId = params.id as string;

  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [contributions, setContributions] = useState<GitHubContributions>({
    totalContributions: 0,
    contributionDays: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userAura, setUserAura] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isCalculatingAura, setIsCalculatingAura] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState<boolean | null>(
    null
  );
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId && isLoaded) {
      checkUserRegistration(userId);
    }
  }, [userId, isLoaded]);

  const checkUserRegistration = async (username: string) => {
    setCheckingRegistration(true);
    try {
      // Check if user exists in our users table (meaning they're registered)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, github_username")
        .eq("github_username", username)
        .single();

      if (userError && userError.code !== "PGRST116") {
        console.error("Error checking user registration:", userError);
        setIsUserRegistered(false);
        return;
      }

      // User found = registered
      if (userData) {
        setIsUserRegistered(true);
        // Only fetch profile if user is registered
        await fetchUserProfile(username);
      } else {
        // User not found = not registered
        setIsUserRegistered(false);
      }
    } catch (err) {
      console.error("Error checking registration:", err);
      setIsUserRegistered(false);
    } finally {
      setCheckingRegistration(false);
      setLoading(false);
    }
  };

  const fetchUserProfile = async (username: string) => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch user profile and contributions
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
      link.download = `${profile?.login}-github-profile.png`;
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
      let shareUrl = window.location.href;
      
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
          formData.append("name", `${profile?.login}-github-profile-og`);

          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.url;

            // Add og_image parameter to the current URL
            const url = new URL(shareUrl);
            url.searchParams.set("og_image", imageUrl);
            shareUrl = url.toString();
          }
        } catch (uploadError) {
          console.error("Error uploading OG image:", uploadError);
          // Continue with sharing even if image upload fails
        }
        setIsGenerating(false);
      }

      // Generate share text and links after image upload is complete
      const text = `Check out ${
        profile?.login || "this user"
      }'s GitHub contributions! 🚀`;

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
      window.open(shareLink, "_blank", "width=600,height=400");
    } catch (err) {
      console.error("Error sharing profile:", err);
      setIsGenerating(false);
    }
  };

  // Show loading while checking Clerk auth status or user registration
  if (!isLoaded || checkingRegistration) {
    return (
      <div className="min-h-screen bg-black">
        <div className="pt-20">
          <Header leaderboard={false} profile={true} />
          <div className="flex items-center justify-center w-full py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth required message if user is not registered
  if (isUserRegistered === false) {
    return (
      <div className="min-h-screen bg-black">
        <div className="pt-20">
          <Header leaderboard={false} profile={true} />
          <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="bg-gray-900/60 backdrop-blur-sm text-gray-200 p-8 rounded-lg border border-gray-700/50 text-center">
              <div className="mb-6">
                <span className="text-6xl mb-4 block">🔒</span>
                <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
                <p className="text-gray-400 mb-6">
                  The user{" "}
                  <span className="text-white font-mono">@{userId}</span> is not
                  registered on our platform.
                  {!isSignedIn && " You need to sign in to view user profiles."}
                </p>
              </div>

              {!isSignedIn ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Sign in with GitHub to join our community and view profiles
                  </p>
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      Sign In to Continue
                    </button>
                  </SignInButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Only registered users can be viewed on our platform
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20">
        <Header leaderboard={false} profile={true} />

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="bg-gray-900/60 backdrop-blur-sm text-gray-200 p-4 rounded-lg border border-gray-700/50">
              <p className="flex items-center gap-2 text-sm">
                <span className="text-red-400 text-lg">⚠️</span>
                <span>{error}</span>
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center w-full py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
          </div>
        ) : profile ? (
          <div className="space-y-8 max-w-6xl mx-auto">
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
          </div>
        ) : (
          !error && (
            <div className="max-w-4xl mx-auto px-4">
              <EmptyState
                selectedTheme={selectedTheme}
                onLoadProfile={(username) => {
                  if (username !== userId && !loading) {
                    // Redirect to new user page
                    window.location.href = `/user/${username}`;
                  }
                }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default UserPage;
