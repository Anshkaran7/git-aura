"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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
  const { isSignedIn, user } = useUser();
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
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

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
      const shareUrl = window.location.href;
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

      window.open(shareLink, "_blank", "width=600,height=400");
    } catch (err) {
      console.error("Error sharing profile:", err);
    }
  };

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
                    fetchUserProfile(username);
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
