"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  GitBranch,
  Users,
  UserPlus,
  Calendar,
  Coffee,
  Download,
  Settings,
  Twitter,
  Linkedin,
  Share2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubCommit {
  date: string;
  repo: string;
  message?: string;
  sha?: string;
}

interface GitHubRepo {
  name: string;
  pushed_at: string;
}

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GitHubContributions {
  totalContributions: number;
  weeks: {
    contributionDays: ContributionDay[];
  }[];
}

interface Theme {
  name: string;
  background: string;
  cardBackground: string;
  text: string;
  border: string;
  contribution: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
  };
}

const themes: Theme[] = [
  {
    name: "Light",
    background: "bg-gray-50",
    cardBackground: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
    contribution: {
      level0: "bg-gray-100",
      level1: "bg-emerald-200",
      level2: "bg-emerald-400",
      level3: "bg-emerald-500",
      level4: "bg-emerald-600",
    },
  },
  {
    name: "Dark",
    background: "bg-[#0d1117]",
    cardBackground: "bg-[#161b22]",
    text: "text-gray-200",
    border: "border-gray-800",
    contribution: {
      level0: "bg-[#161b22]",
      level1: "bg-[#0e4429]",
      level2: "bg-[#006d32]",
      level3: "bg-[#26a641]",
      level4: "bg-[#39d353]",
    },
  },
  {
    name: "Ocean Dark",
    background: "bg-[#0f172a]",
    cardBackground: "bg-[#1e293b]",
    text: "text-[#e2e8f0]",
    border: "border-[#1e293b]",
    contribution: {
      level0: "bg-[#0f172a]",
      level1: "bg-[#0c4a6e]",
      level2: "bg-[#0369a1]",
      level3: "bg-[#0ea5e9]",
      level4: "bg-[#38bdf8]",
    },
  },
];

interface ShareableProfile {
  id: string;
  username: string;
  profile_data: GitHubProfile;
  contributions: ContributionDay[];
  created_at: string;
}

const GitHubProfileCard = () => {
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [shareableId, setShareableId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we have a share ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get("share");
    if (shareId) {
      loadSharedProfile(shareId);
    }
  }, []);

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
        setContributions(data.contributions);
        setSearchedUsername(data.username);
        setShareableId(data.id);
      }
    } catch (err) {
      console.error("Error loading shared profile:", err);
    }
  };

  const generateShareableProfile = async () => {
    if (!profile || !contributions.length) return null;

    setIsGenerating(true);
    try {
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

      // Update URL without refreshing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("share", id);
      window.history.pushState({}, "", newUrl);

      return id;
    } catch (err) {
      console.error("Error generating shareable profile:", err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchProfile = async (user: string) => {
    if (!user.trim()) return;

    setLoading(true);
    setError(null);
    setSearchedUsername(user);

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
        `https://api.github.com/users/${user}`,
        { headers }
      );
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || "User not found");
      }

      const profileData = await profileResponse.json();
      console.log("📊 Profile Data:", {
        name: profileData.name,
        login: profileData.login,
        repos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        created_at: profileData.created_at,
      });
      setProfile(profileData);

      // Fetch contributions using GraphQL
      console.log("🔍 Fetching contributions...");
      const graphqlQuery = {
        query: `query($userName:String!) { 
          user(login: $userName){
            contributionsCollection {
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
        variables: { userName: user },
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
      console.log("📊 Contributions Response:", contributionsData);

      if (contributionsData.errors) {
        throw new Error(contributionsData.errors[0].message);
      }

      const calendar =
        contributionsData.data.user.contributionsCollection
          .contributionCalendar;
      console.log("📊 Total Contributions:", calendar.totalContributions);

      // Flatten the contributions data
      const allContributions = calendar.weeks.flatMap(
        (week: { contributionDays: ContributionDay[] }) => week.contributionDays
      );

      console.log("📅 First 5 days of activity:", allContributions.slice(0, 5));
      setContributions(allContributions);
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(
        errorMessage === "API rate limit exceeded. Please try again later."
          ? "GitHub API rate limit exceeded. Please try again in a minute."
          : errorMessage
      );
      setProfile(null);
      setContributions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && username !== searchedUsername) {
      fetchProfile(username.trim());
    }
  };

  const generateCommitGrid = () => {
    const weekdays = ["Mon", "", "Wed", "", "Fri"];
    const grid = [];

    // Add weekday labels column
    grid.push(
      <div
        key="weekdays"
        className="flex flex-col gap-[3px] text-xs text-gray-400 pr-2 pt-6"
      >
        {weekdays.map((day, i) => (
          <div key={i} className="h-[10px] flex items-center">
            {day}
          </div>
        ))}
      </div>
    );

    // Create a map of date to contribution count
    const contributionMap: Record<string, number> = {};
    contributions.forEach((day) => {
      contributionMap[day.date] = day.contributionCount;
    });

    // Generate columns (weeks)
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    for (let week = 0; week < 53; week++) {
      const weekCells = [];
      // Generate cells for each day in the week
      for (let day = 0; day < 7; day++) {
        const date = new Date(oneYearAgo);
        date.setDate(date.getDate() + week * 7 + day);
        const dateStr = date.toISOString().split("T")[0];
        const contributionCount = contributionMap[dateStr] || 0;

        weekCells.push(
          <div
            key={`${week}-${day}`}
            className={`w-[10px] h-[10px] rounded-sm ${getContributionColor(
              contributionCount
            )} hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:ring-offset-[#0d1117] transition-all`}
            title={`${date.toDateString()}: ${contributionCount} contributions`}
          />
        );
      }
      grid.push(
        <div key={week} className="flex flex-col gap-[3px]">
          {weekCells}
        </div>
      );
    }

    return <div className="flex gap-[3px]">{grid}</div>;
  };

  const getMonthLabels = () => {
    const months = [
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
    ];

    return (
      <div className="grid grid-cols-[repeat(12,_minmax(0,_1fr))] text-xs text-gray-400 ml-8 mb-2">
        {months.map((month, i) => (
          <div key={i}>{month}</div>
        ))}
      </div>
    );
  };

  const handleExportImage = async () => {
    if (!profileRef.current) return;

    try {
      // Generate shareable ID if not exists
      if (!shareableId) {
        const newShareableId = await generateShareableProfile();
        if (!newShareableId) {
          console.error("Failed to generate shareable ID");
          return;
        }
      }

      setIsGenerating(true);
      try {
        // Use html-to-image for high-quality PNG export
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
      } finally {
        setIsGenerating(false);
      }
    } catch (err) {
      console.error("Failed to export image:", err);
      setIsGenerating(false);
    }
  };

  const handleShare = async (platform: "twitter" | "linkedin") => {
    try {
      let currentShareableId = shareableId;

      if (!currentShareableId) {
        currentShareableId = await generateShareableProfile();
        if (!currentShareableId) {
          console.error("Failed to generate shareable ID");
          return;
        }
      }

      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set("share", currentShareableId);

      // Generate image from profile card and upload to imgbb
      let imageUrl = "";
      if (profileRef.current) {
        try {
          const dataUrl = await toPng(profileRef.current, {
            cacheBust: true,
            backgroundColor: undefined,
            pixelRatio: 2,
            skipFonts: false,
          });

          const base64 = dataUrl.split(",")[1];
          const formData = new FormData();
          formData.append("image", base64);
          formData.append("name", `${searchedUsername}-github-profile.png`);
          const imgbbUrl = `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`;
          const imgbbRes = await fetch(imgbbUrl, {
            method: "POST",
            body: formData,
          });
          const imgbbData = await imgbbRes.json();
          if (imgbbData.success && imgbbData.data) {
            imageUrl = imgbbData.data.display_url || imgbbData.data.url || "";
          }
        } catch (imgErr) {
          console.error("Image upload failed:", imgErr);
        }
      }

      // Add og:image param to shareUrl if imageUrl exists
      if (imageUrl) {
        shareUrl.searchParams.set("og_image", imageUrl);
      }

      const text = `Check out ${searchedUsername}'s GitHub contributions! 🚀`;
      let shareLink = "";
      if (platform === "twitter") {
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareUrl.toString())}`;
      } else if (platform === "linkedin") {
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(
          `${text} ${shareUrl.toString()}`
        )}`;
      }

      window.open(shareLink, "_blank", "width=600,height=400");
    } catch (err) {
      console.error("Error sharing profile:", err);
    }
  };

  const getContributionColor = (count: number): string => {
    if (count > 12) return selectedTheme.contribution.level4;
    if (count > 7) return selectedTheme.contribution.level3;
    if (count > 3) return selectedTheme.contribution.level2;
    if (count > 0) return selectedTheme.contribution.level1;
    return selectedTheme.contribution.level0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${selectedTheme.background} p-6 font-anek-devanagari transition-colors duration-300`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Theme Selector and Export/Share Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setSelectedTheme(theme)}
                className={`px-4 py-2 font-medium rounded-lg ${
                  selectedTheme.name === theme.name
                    ? "ring-2 ring-blue-500 bg-blue-500 text-white"
                    : selectedTheme.name === "Light"
                    ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                    : "bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-600"
                } transition-all shadow-sm font-anek-devanagari`}
              >
                {theme.name}
              </button>
            ))}
          </div>
          {profile && (
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-500 rounded-lg text-white font-anek-devanagari">
                  <span className="animate-pulse">Generating...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a94e0] rounded-lg text-white transition-colors font-anek-devanagari"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#094da1] rounded-lg text-white transition-colors font-anek-devanagari"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={handleExportImage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors font-anek-devanagari"
                    title="Download as Image"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search
              className={`absolute left-3 top-3 h-5 w-5 ${
                selectedTheme.name === "Light"
                  ? "text-gray-400"
                  : "text-gray-400/80"
              }`}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username and press Enter"
              className={`w-full pl-10 pr-24 py-3 ${
                selectedTheme.cardBackground
              } ${
                selectedTheme.name === "Light"
                  ? "text-gray-700 placeholder-gray-400 border-gray-300"
                  : "text-gray-100 placeholder-gray-500 border-gray-700"
              } rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-anek-devanagari shadow-sm`}
            />
            <button
              type="submit"
              disabled={
                !username.trim() || username === searchedUsername || loading
              }
              className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm font-anek-devanagari"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6 border border-red-800">
            <p className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {!profile && !error && !loading && (
          <div
            className={`text-center ${
              selectedTheme.name === "Light" ? "text-gray-600" : "text-gray-300"
            } mt-20 font-anek-devanagari`}
          >
            <Search
              className={`h-16 w-16 mx-auto mb-4 ${
                selectedTheme.name === "Light" ? "opacity-40" : "opacity-30"
              }`}
            />
            <p className="text-lg">
              Enter a GitHub username to view their profile
            </p>
          </div>
        )}

        {profile && (
          <div
            ref={profileRef}
            data-profile-card
            className={`${
              selectedTheme.cardBackground
            } rounded-2xl overflow-hidden shadow-lg border ${
              selectedTheme.border
            } ${
              selectedTheme.name === "Ocean Dark"
                ? "shadow-cyan-900/20 bg-opacity-90 backdrop-blur-sm"
                : selectedTheme.name === "Dark"
                ? "shadow-gray-900/30"
                : "shadow-gray-200/50"
            }`}
          >
            {/* Browser Window Controls */}
            <div
              className={`flex items-center gap-1.5 px-4 py-3 ${
                selectedTheme.name === "Light"
                  ? "bg-gray-50/80"
                  : selectedTheme.name === "Ocean Dark"
                  ? "bg-cyan-900/20"
                  : "bg-gray-900/20"
              } border-b ${selectedTheme.border}`}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/90" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/90" />
                <div className="w-3 h-3 rounded-full bg-green-500/90" />
              </div>
              <div
                className={`flex-1 flex items-center justify-center mx-auto ${selectedTheme.text} text-sm font-anek-devanagari`}
              >
                <div
                  className={`flex items-center gap-2 px-4 py-1 rounded-md ${
                    selectedTheme.name === "Light"
                      ? "bg-white/80"
                      : selectedTheme.name === "Ocean Dark"
                      ? "bg-cyan-950/50"
                      : "bg-gray-950/50"
                  } border ${selectedTheme.border}`}
                >
                  <span className="opacity-60">github.com/</span>
                  {profile?.login}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="opacity-50 hover:opacity-100 transition-opacity">
                  <Download className="w-4 h-4" />
                </button>
                <button className="opacity-50 hover:opacity-100 transition-opacity">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className={`p-8 ${
                selectedTheme.name === "Ocean Dark"
                  ? "bg-gradient-to-b from-transparent to-cyan-950/20"
                  : ""
              }`}
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || profile.login}
                    className="w-20 h-20 rounded-full ring-2 ring-blue-500/30 shadow-md"
                  />
                  <div>
                    <h1
                      className={`text-2xl font-semibold ${
                        selectedTheme.name === "Light"
                          ? "text-gray-800"
                          : "text-gray-100"
                      } mb-1 font-anek-devanagari`}
                    >
                      {profile.name || profile.login}
                    </h1>
                    <p
                      className={`${
                        selectedTheme.name === "Light"
                          ? "text-gray-500"
                          : "text-gray-400"
                      } text-base mb-3 font-anek-devanagari`}
                    >
                      @{profile.login}
                    </p>
                    <div className="flex items-center gap-4 text-sm font-anek-devanagari">
                      <div
                        className={`flex items-center gap-1.5 ${
                          selectedTheme.name === "Light"
                            ? "text-gray-600 hover:text-gray-800"
                            : "text-gray-300 hover:text-white"
                        } transition-colors`}
                      >
                        <Users className="h-4 w-4" />
                        <span>
                          {profile.followers.toLocaleString()} Followers
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          selectedTheme.name === "Light"
                            ? "text-gray-600 hover:text-gray-800"
                            : "text-gray-300 hover:text-white"
                        } transition-colors`}
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>
                          {profile.following.toLocaleString()} Following
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-2xl font-semibold ${
                      selectedTheme.name === "Light"
                        ? "text-gray-800"
                        : "text-gray-100"
                    } font-anek-devanagari`}
                  >
                    {profile.public_repos.toLocaleString()}
                  </div>
                  <div
                    className={`${
                      selectedTheme.name === "Light"
                        ? "text-gray-500"
                        : "text-gray-400"
                    } text-sm font-anek-devanagari`}
                  >
                    Repositories
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-8">
                  <p
                    className={`flex items-center gap-2 text-base ${
                      selectedTheme.name === "Light"
                        ? "text-gray-700"
                        : "text-gray-200"
                    } font-anek-devanagari`}
                  >
                    <Coffee
                      className={`h-4 w-4 ${
                        selectedTheme.name === "Light"
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    />
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Contribution section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-xl font-semibold ${
                      selectedTheme.name === "Light"
                        ? "text-gray-800"
                        : "text-gray-100"
                    } font-anek-devanagari`}
                  >
                    {contributions.length.toLocaleString()} contributions
                  </h2>
                  <div
                    className={`${
                      selectedTheme.name === "Light"
                        ? "text-gray-500"
                        : "text-gray-400"
                    } text-sm font-anek-devanagari`}
                  >
                    {new Date(profile.created_at).getFullYear()} - Present
                  </div>
                </div>

                <div
                  className={`${
                    selectedTheme.name === "Light"
                      ? "bg-white"
                      : selectedTheme.name === "Ocean Dark"
                      ? "bg-[#0f172a]/50"
                      : "bg-[#0d1117]/50"
                  } rounded-xl p-6 ${
                    selectedTheme.border
                  } border backdrop-blur-sm`}
                >
                  {getMonthLabels()}
                  {generateCommitGrid()}

                  <div className="flex items-center justify-end mt-4 gap-2">
                    <span
                      className={`text-xs ${
                        selectedTheme.name === "Light"
                          ? "text-gray-500"
                          : "text-gray-400"
                      } font-anek-devanagari`}
                    >
                      Less
                    </span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`w-2.5 h-2.5 rounded-sm ${getContributionColor(
                            level * 4
                          )}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs ${
                        selectedTheme.name === "Light"
                          ? "text-gray-500"
                          : "text-gray-400"
                      } font-anek-devanagari`}
                    >
                      More
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubProfileCard;
