"use client";
import React from "react";
import { Users, UserPlus, Coffee, Twitter, Linkedin, Download } from "lucide-react";
import { Theme, GitHubProfile, GitHubContributions } from "./types";
import ContributionGrid from "./ContributionGrid";
import MontlyContribution from "./MontlyContribution";

import Image from "next/image";

interface ProfileCardProps {
  profile: GitHubProfile;
  contributions: GitHubContributions;
  selectedTheme: Theme;
  profileRef?: React.RefObject<HTMLDivElement | null>;
  handleShareTwitter: () => void;
  handleShareLinkedin: () => void;
  handleDownload: () => void;
  isGenerating?: boolean;
  downloadFormat?: string;
  setDownloadFormat?: (format: string) => void;
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
  downloadFormat,
  setDownloadFormat,
}) => {
  return (
    <div
      ref={profileRef}
      data-profile-card
      className="bg-card backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border mx-1 sm:mx-0">
      {/* Browser Window Controls */}
      <div className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-background backdrop-blur-sm border-b border-border">
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/90" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/90" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/90" />
        </div>
        <div className="flex-1 flex items-center justify-center mx-2 sm:mx-auto text-foreground">
          <a
            href={`https://github.com/${profile?.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-2 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-md bg-secondary hover:bg-muted backdrop-blur-sm border border-border transition-all touch-manipulation max-w-full overflow-hidden group"
          >
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs md:text-sm">
              github.com/
            </span>
            <span className="truncate text-[10px] sm:text-xs md:text-sm group-hover:text-primary transition-colors">
              {profile?.login}
            </span>
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                      <button
              onClick={handleShareTwitter}
              disabled={isGenerating}
              className={`p-1.5 sm:p-2 rounded-md transition-colors text-white ${
                isGenerating
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-[#1DA1F2] hover:bg-[#1a94e0] active:bg-[#1785cc]"
              }`}
              title={isGenerating ? "Generating image..." : "Share on Twitter"}
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Twitter className="w-4 h-4" />
              )}
            </button>
          <button
            onClick={handleShareLinkedin}

            disabled={isGenerating}
            className={`p-1.5 sm:p-2 rounded-md transition-colors text-white ${
              isGenerating
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-[#0A66C2] hover:bg-[#094da1] active:bg-[#083d86]"
            }`}
            title={isGenerating ? "Generating image..." : "Share on LinkedIn"}
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Linkedin className="w-4 h-4" />
            )}
                      </button>

            {/* Format selector */}
            {setDownloadFormat && (
              <div className="relative">
                <select
                  value={downloadFormat}
                  onChange={e => setDownloadFormat(e.target.value)}
                  className="bg-gray-800 text-white px-2 py-1.5 sm:px-2 sm:py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-xs sm:text-sm hover:bg-gray-700 transition-colors relative z-50 font-medium appearance-none pr-6"
                  style={{ minWidth: 50, position: 'relative' }}
                  title={`Current format: ${downloadFormat?.toUpperCase()}`}
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`p-1.5 sm:p-2 rounded-md transition-colors text-white ${
              isGenerating
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
            title={isGenerating ? "Generating image..." : `Download as ${downloadFormat ? downloadFormat.toUpperCase() : 'Image'}`}
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-b from-card to-background">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ring-2 ring-border shadow-md"
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-1 font-mona-sans truncate">
                {profile.name || profile.login}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3 font-mona-sans truncate">
                @{profile.login}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm font-mona-sans">
                <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">
                    {profile.followers.toLocaleString()} Followers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">
                    {profile.following.toLocaleString()} Following
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right w-full sm:w-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground font-mona-sans">
              {profile.public_repos.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-mona-sans">
              Repositories
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <p className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-sm sm:text-base leading-relaxed text-foreground font-mona-sans">
              <Coffee className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-center sm:text-left break-words">
                {profile.bio}
              </span>
            </p>
          </div>
        )}

        {/* Contribution section */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground font-mona-sans text-center sm:text-left">
              {contributions.totalContributions.toLocaleString()} contributions
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground font-mona-sans whitespace-nowrap">
              {new Date(profile.created_at).getFullYear()} - Present
            </div>
          </div>

          <div className="w-full">
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
