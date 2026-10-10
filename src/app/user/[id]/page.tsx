"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import { calculateTotalAura, saveUserAura } from "@/lib/aura";
import { calculateStreak } from "@/lib/utils2";
import { Lock } from "lucide-react";
import { Header, Footer } from "@/components/home";
import { Button } from "@/components/ui/button";
import MontlyContribution from "@/components/MontlyContribution";
import ProfileCard from "@/components/ProfileCard";
import AuraPanel from "@/components/AuraPanel";
import EmptyState from "@/components/EmptyState";
import BadgeDisplay from "@/components/BadgeDisplay";
import { ProfileSkeleton } from "@/components/GitHubProfileCard";
import { themes } from "@/components/themes";

import {
  GitHubProfile,
  GitHubContributions,
  Theme,
  ContributionDay,
} from "@/components/types";

function UserPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isSignedIn, user, isLoaded } = useUser();
  const userId = params.id as string;

  const [profile, setProfile] = useState<GitHubProfile | null>(null);
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
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(
    null
  );
  const profileRef = useRef<HTMLDivElement>(null);

  // Get OG image from URL parameters
  const ogImageParam = searchParams.get("og_image");
  const ogImageUrl = ogImageParam ? decodeURIComponent(ogImageParam) : null;

  useEffect(() => {
    if (userId && isLoaded) {
      checkUserRegistration(userId);
    }
  }, [userId, isLoaded]);

  const checkUserRegistration = async (username: string) => {
    setCheckingRegistration(true);
    try {
      // Check if user exists via API
      const response = await fetch(`/api/check-user/${username}`);

      if (!response.ok) {
        console.error("Error checking user registration:", response.statusText);
        setIsUserRegistered(false);
        return;
      }

      const data = await response.json();

      if (data.isRegistered && data.user) {
        setIsUserRegistered(true);
        setRegisteredUserId(data.user.id ?? null);
        // Only fetch profile if user is registered, use the actual stored username for consistency
        await fetchUserProfile(data.user.githubUsername);
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
      // Check if current user is viewing their own profile
      const currentUserGithubUsername = user?.externalAccounts?.find(
        (account) => account.provider === "github"
      )?.username;

      const isViewingOwnProfile =
        isSignedIn &&
        currentUserGithubUsername &&
        currentUserGithubUsername.toLowerCase() === username.toLowerCase();

      // Fetch user profile and contributions
      const url = new URL(
        `/api/github/profile/${username}`,
        window.location.origin
      );

      // Only send userId parameter when viewing your own profile
      if (isViewingOwnProfile && user?.id) {
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
      window.open(shareLink, "_blank");
    } catch (err) {
      console.error("Error sharing profile:", err);
      setIsGenerating(false);
    }
  };

  const shell = (content: React.ReactNode) => (
    <div className="flex min-h-screen flex-col bg-background">
      <Header leaderboard={false} profile={true} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {content}
      </main>
      <Footer />
    </div>
  );

  // Show loading while checking Clerk auth status or user registration
  if (!isLoaded || checkingRegistration) {
    return shell(<ProfileSkeleton />);
  }

  // Show auth required message if user is not registered
  if (isUserRegistered === false) {
    return shell(
      <div className="gh-box mx-auto max-w-2xl px-6 py-12 text-center">
        <Lock className="mx-auto h-6 w-6 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-semibold text-foreground">
          User not found
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The user{" "}
          <span className="font-mono text-foreground">@{userId}</span> is not
          registered on GitAura.
          {!isSignedIn && " You need to sign in to view user profiles."}
        </p>

        {!isSignedIn ? (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-muted-foreground">
              Sign in with GitHub to join the community and view profiles
            </p>
            <SignInButton mode="modal">
              <Button>Sign in to continue</Button>
            </SignInButton>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-muted-foreground">
              Only registered users can be viewed on GitAura
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go back
            </Button>
          </div>
        )}
      </div>
    );
  }

  return shell(
    <>
      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-danger/40 bg-danger-subtle px-4 py-3 text-sm text-foreground"
        >
          <span className="font-semibold text-danger">Error: </span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ProfileCard
          profile={profile}
          contributions={contributions}
          selectedTheme={selectedTheme}
          profileRef={profileRef}
          handleShareTwitter={() => handleShare("twitter")}
          handleShareLinkedin={() => handleShare("linkedin")}
          handleDownload={handleExportImage}
          isGenerating={isGenerating}
          aura={userAura}
          streak={currentStreak}
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
          {registeredUserId && (
            <BadgeDisplay
              userId={registeredUserId}
              selectedTheme={selectedTheme}
            />
          )}
          <MontlyContribution
            selectedTheme={selectedTheme}
            contributions={contributions}
          />
        </ProfileCard>
      ) : (
        !error && (
          <div className="mx-auto max-w-4xl">
            <EmptyState
              selectedTheme={selectedTheme}
              onLoadProfile={(username) => {
                if (username !== userId && !loading) {
                  window.location.href = `/user/${username}`;
                }
              }}
            />
          </div>
        )
      )}
    </>
  );
}

export default UserPage;
