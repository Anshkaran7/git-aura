"use client";
import React from "react";
import { Users, UserPlus, Coffee } from "lucide-react";
import { Theme, GitHubProfile, GitHubContributions } from "./types";
import ContributionGrid from "./ContributionGrid";
import MontlyContribution from "./MontlyContribution";

interface ProfileCardProps {
  profile: GitHubProfile;
  contributions: GitHubContributions;
  selectedTheme: Theme;
  profileRef?: React.RefObject<HTMLDivElement | null>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  contributions,
  selectedTheme,
  profileRef,
}) => {
  return (
    <div
      ref={profileRef}
      data-profile-card
      className={`${
        selectedTheme.cardBackground
      } rounded-2xl overflow-hidden shadow-lg border ${selectedTheme.border} ${
        selectedTheme.name === "Ocean Dark"
          ? "shadow-cyan-900/20 bg-opacity-90 backdrop-blur-sm"
          : selectedTheme.name === "Dark"
          ? "shadow-gray-900/30"
          : "shadow-gray-200/50"
      }`}
    >
      {/* Browser Window Controls */}
      <div
        className={`flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-3 ${
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
          className={`flex-1 flex items-center justify-center mx-auto ${selectedTheme.text} text-xs sm:text-sm font-mona-sans`}
        >
          <a
            href={`https://github.com/${profile?.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-2 sm:px-4 py-0.5 sm:py-1 rounded-md ${
              selectedTheme.name === "Light"
                ? "bg-white/80"
                : selectedTheme.name === "Ocean Dark"
                ? "bg-cyan-950/50"
                : "bg-gray-950/50"
            } border ${selectedTheme.border}`}
          >
            <span className="opacity-60 m-0 p-0">github.com/</span>
            {profile?.login}
          </a>
        </div>
      </div>

      {/* Profile Content */}
      <div
        className={`p-4 sm:p-8 ${
          selectedTheme.name === "Ocean Dark"
            ? "bg-gradient-to-b from-transparent to-cyan-950/20"
            : ""
        }`}
      >
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-6">
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-blue-500/30 shadow-md"
            />
            <div>
              <h1
                className={`text-xl sm:text-2xl font-semibold ${
                  selectedTheme.name === "Light"
                    ? "text-gray-800"
                    : "text-gray-100"
                } mb-1 font-mona-sans`}
              >
                {profile.name || profile.login}
              </h1>
              <p
                className={`${
                  selectedTheme.name === "Light"
                    ? "text-gray-500"
                    : "text-gray-400"
                } text-sm sm:text-base mb-1 font-mona-sans`}
              >
                @{profile.login}
              </p>
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-mona-sans">
                <div
                  className={`flex items-center gap-1.5 ${
                    selectedTheme.name === "Light"
                      ? "text-gray-600 hover:text-gray-800"
                      : "text-gray-300 hover:text-white"
                  } transition-colors`}
                >
                  <Users className="h-4 w-4" />
                  <span>{profile.followers.toLocaleString()} Followers</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    selectedTheme.name === "Light"
                      ? "text-gray-600 hover:text-gray-800"
                      : "text-gray-300 hover:text-white"
                  } transition-colors`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{profile.following.toLocaleString()} Following</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right mt-3 sm:mt-0">
            <div
              className={`text-xl sm:text-2xl font-semibold ${
                selectedTheme.name === "Light"
                  ? "text-gray-800"
                  : "text-gray-100"
              } font-mona-sans`}
            >
              {profile.public_repos.toLocaleString()}
            </div>
            <div
              className={`${
                selectedTheme.name === "Light"
                  ? "text-gray-500"
                  : "text-gray-400"
              } text-xs sm:text-sm font-mona-sans`}
            >
              Repositories
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-4 sm:mb-8">
            <p
              className={`flex items-center gap-2 text-sm sm:text-base ${
                selectedTheme.name === "Light"
                  ? "text-gray-700"
                  : "text-gray-200"
              } font-mona-sans`}
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
        <div className="mt-4 sm:mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-6 gap-2 sm:gap-0">
            <h2
              className={`text-lg sm:text-xl font-semibold ${
                selectedTheme.name === "Light"
                  ? "text-gray-800"
                  : "text-gray-100"
              } font-mona-sans`}
            >
              {contributions.totalContributions.toLocaleString()} contributions
            </h2>
            <div
              className={`${
                selectedTheme.name === "Light"
                  ? "text-gray-500"
                  : "text-gray-400"
              } text-xs sm:text-sm font-mona-sans`}
            >
              {new Date(profile.created_at).getFullYear()} - Present
            </div>
          </div>

          <ContributionGrid
            contributions={contributions}
            selectedTheme={selectedTheme}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
