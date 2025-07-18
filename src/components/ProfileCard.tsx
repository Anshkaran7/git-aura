"use client";
import React from "react";
import {
  Users,
  UserPlus,
  Coffee,
  Twitter,
  Linkedin,
  Download,
} from "lucide-react";
import { Theme, GitHubProfile, GitHubContributions } from "./types";
import ContributionGrid from "./ContributionGrid";
import MontlyContribution from "./MontlyContribution";

interface ProfileCardProps {
  profile: GitHubProfile;
  contributions: GitHubContributions;
  selectedTheme: Theme;
  profileRef?: React.RefObject<HTMLDivElement | null>;
  handleShareTwitter: () => void;
  handleShareLinkedin: () => void;
  handleDownload: () => void;
  isGenerating?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  contributions,
  selectedTheme,
  profileRef,
  handleShareTwitter,
  handleShareLinkedin,
  handleDownload,
  isGenerating = false,
}) => {
  return (
    <div
      ref={profileRef}
      data-profile-card
      className="bg-[#161b21] backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-[#21262d] mx-1 sm:mx-0"
    >
      {/* Browser Window Controls */}
      <div className="flex items-center gap-1 px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-[#0d1117] backdrop-blur-sm border-b border-[#21262d]">
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/90" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/90" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/90" />
        </div>
        <div className="flex-1 flex items-center justify-center mx-2 sm:mx-auto text-white text-xs sm:text-sm font-mona-sans">
          <a
            href={`https://github.com/${profile?.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-2 px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-4 md:py-1 rounded-md bg-[#161b21] hover:bg-[#21262d] backdrop-blur-sm border border-[#30363d] transition-all touch-manipulation max-w-full overflow-hidden"
          >
            <span className="opacity-60 m-0 p-0 shrink-0 text-xs sm:text-sm">
              github.com/
            </span>
            <span className="truncate text-xs sm:text-sm">
              {profile?.login}
            </span>
          </a>
        </div>
        {/* Share Buttons with ShareButtons component styling */}
        {/* {isGenerating ? (
          <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 rounded-lg text-white font-mona-sans">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
            <span className="text-sm">Generating...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="bg-[#161b21] text-white cursor-pointer hover:scale-105 rounded-md 
            p-2"
              onClick={handleShareTwitter}
            >
              <Twitter className="h-4 w-4" />
            </button>

            <button
              className="bg-[#161b21] text-white cursor-pointer hover:scale-105 rounded-md 
            p-2"
              onClick={handleShareLinkedin}
            >
              <Linkedin className="h-4 w-4" />
            </button>
            <button
              className="bg-[#161b21] text-white cursor-pointer hover:scale-105 rounded-md 
            p-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        )} */}
      </div>

      {/* Profile Content */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-b from-[#161b21] to-[#0d1117]">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-4 lg:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full lg:w-auto">
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full ring-2 ring-[#30363d] shadow-md mx-auto sm:mx-0"
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-1 font-mona-sans truncate">
                {profile.name || profile.login}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base mb-2 sm:mb-3 font-mona-sans truncate">
                @{profile.login}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm font-mona-sans">
                <div className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">
                    {profile.followers.toLocaleString()} Followers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">
                    {profile.following.toLocaleString()} Following
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center lg:text-right w-full sm:w-auto lg:w-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-white font-mona-sans">
              {profile.public_repos.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm font-mona-sans">
              Repositories
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <p className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm sm:text-base leading-relaxed text-gray-200 font-mona-sans">
              <Coffee className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="break-words">{profile.bio}</span>
            </p>
          </div>
        )}

        {/* Contribution section */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 md:gap-4">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white font-mona-sans">
              {contributions.totalContributions.toLocaleString()} contributions
            </h2>
            <div className="text-gray-400 text-xs sm:text-sm font-mona-sans whitespace-nowrap">
              {new Date(profile.created_at).getFullYear()} - Present
            </div>
          </div>

          <div className="overflow-x-auto">
            <ContributionGrid
              contributions={contributions}
              selectedTheme={selectedTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
