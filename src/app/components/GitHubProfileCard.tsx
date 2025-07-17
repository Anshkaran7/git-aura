"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { saveUserAura, calculateTotalAura } from "../../lib/aura";
import { calculateStreak } from "../../lib/utils";
import Leaderboard from "./Leaderboard";
import BadgeDisplay from "./BadgeDisplay";
import Header from "./Header";
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

const GitHubProfileCard = () => {
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
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[1]);
  const [shareableId, setShareableId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("profile");
  const [userAura, setUserAura] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isCalculatingAura, setIsCalculatingAura] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we have a share ID or username in the URL
    const shareId = searchParams.get("share");
    const urlUsername = searchParams.get("username");

    if (shareId) {
      loadSharedProfile(shareId);
    } else if (urlUsername) {
      setUsername(urlUsername);
      fetchProfile(urlUsername);
    }
  }, [searchParams]);

  // Auto-load user's own profile when they sign in
  useEffect(() => {
    if (isSignedIn && user) {
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

      if (githubUsername && !profile) {
        setUsername(githubUsername);
        fetchProfile(githubUsername);
      }
    }
  }, [isSignedIn, user, profile]);

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

          const imgbbResponse = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (imgbbResponse.ok) {
            const imgbbData = await imgbbResponse.json();
            imageUrl = imgbbData.data.url;
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

    setLoading(true);
    setError(null);
    setSearchedUsername(username);

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
      }),
    };

    try {
      // Fetch user profile
      const profileResponse = await fetch(
        `https://api.github.com/users/${username}`,
        { headers }
      );
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || "User not found");
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);

      // Update URL with username
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("username", username);
      window.history.pushState({}, "", newUrl);

      // Fetch contributions
      const today = new Date();
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      lastYear.setDate(lastYear.getDate() + 1);

      const graphqlQuery = {
        query: `query($userName:String!) { 
          user(login: $userName){
            contributionsCollection(from: "${lastYear.toISOString()}", to: "${today.toISOString()}") {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }`,
        variables: { userName: username },
      };

      const contributionsResponse = await fetch(
        "https://api.github.com/graphql",
        {
          method: "POST",
          headers,
          body: JSON.stringify(graphqlQuery),
        }
      );

      if (!contributionsResponse.ok) {
        throw new Error("Failed to fetch contributions");
      }

      const contributionsData = await contributionsResponse.json();

      if (contributionsData.errors) {
        throw new Error(contributionsData.errors[0].message);
      }

      if (!contributionsData.data?.user?.contributionsCollection) {
        throw new Error(
          "No contributions data found. This might be due to API rate limits or missing GitHub token."
        );
      }

      const calendar =
        contributionsData.data.user.contributionsCollection
          .contributionCalendar;

      const allContributions = calendar.weeks.flatMap(
        (week: { contributionDays: ContributionDay[] }) => week.contributionDays
      );

      const contributionsObj = {
        totalContributions: calendar.totalContributions,
        contributionDays: allContributions,
      };

      setContributions(contributionsObj);

      // Calculate aura
      if (isSignedIn && user?.id) {
        await calculateAndSaveAura(profileData, allContributions);
      } else {
        const localAura = calculateTotalAura(allContributions);
        const streak = calculateStreak(allContributions);
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

    if (username.trim() && username !== searchedUsername) {
      const params = new URLSearchParams();
      params.set("username", username.trim());

      setShareableId(null);
      router.push(`?${params.toString()}`);

      fetchProfile(username.trim());
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
    <div
      className={`${selectedTheme.background} min-h-screen p-3 sm:p-6 font-mona-sans transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto pb-20">
        <Header
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          currentView={currentView}
          setCurrentView={setCurrentView}
          userAura={userAura}
        />

        {/* Share Buttons - Only show for profile view */}
        {currentView === "profile" && profile && (
          <div className="flex justify-end mb-4">
            <ShareButtons
              isGenerating={isGenerating}
              onExportImage={handleExportImage}
              onShare={handleShare}
            />
          </div>
        )}

        {/* Search Bar - commented out as it was in original */}
        {/* <SearchBar
          username={username}
          setUsername={setUsername}
          searchedUsername={searchedUsername}
          loading={loading}
          selectedTheme={selectedTheme}
          onSearch={handleSearch}
        /> */}

        {/* Error Message - Only show on profile view */}
        {currentView === "profile" && error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6 border border-red-800">
            <p className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Content based on current view */}
        {currentView === "profile" && (
          <>
            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center w-full py-24">
                <img
                  src="/loading.gif"
                  alt="Loading..."
                  className="w-32 h-32"
                />
              </div>
            ) : profile ? (
              <>
                <ProfileCard
                  profile={profile}
                  contributions={contributions}
                  selectedTheme={selectedTheme}
                  profileRef={profileRef}
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
                    setUsername(username);
                    fetchProfile(username);
                  }}
                />
              )
            )}
          </>
        )}

        {/* Leaderboard View */}
        {currentView === "leaderboard" && (
          <div className="mt-8">
            <Leaderboard
              currentUserId={user?.id}
              selectedTheme={selectedTheme}
            />
          </div>
        )}

        {/* Badges View */}
        {currentView === "badges" && isSignedIn && user?.id && (
          <BadgeDisplay userId={user.id} selectedTheme={selectedTheme} />
        )}
      </div>

      {/* Footer - Hide on badges view */}
      {currentView !== "badges" && (
        <footer
          className={`text-center fixed bottom-0 w-full py-4 ${selectedTheme.text} ${selectedTheme.background}`}
        >
          <p className="text-sm">
            Made with ❤️ by{" "}
            <a
              href="https://karandev.in"
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${selectedTheme.text}`}
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
