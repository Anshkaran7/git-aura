"use client";

import React from "react";
import { Coffee, Download, Linkedin, UserPlus, Users } from "lucide-react";
import ContributionGrid from "./ContributionGrid";
import { GitHubContributions, GitHubProfile, Theme } from "./types";
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
}

const actionButtonBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

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
  void selectedTheme;

  return (
    <div
      ref={profileRef}
      data-profile-card
      className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-55px_rgba(15,23,42,0.45)]"
    >
      <div className="flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#a3a3a3]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#737373]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#404040]" />
        </div>

        <a
          href={`https://github.com/${profile.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center justify-center rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="truncate">github.com/{profile.login}</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareTwitter}
            disabled={isGenerating}
            className={actionButtonBase}
            title={isGenerating ? "Generating image..." : "Share"}
          >
            {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
            ) : (
              <Image
                alt="X logo"
                width={16}
                height={16}
                src="/twitter.png"
                className="h-4 w-4"
              />
            )}
          </button>
          <button
            onClick={handleShareLinkedin}
            disabled={isGenerating}
            className={actionButtonBase}
            title={isGenerating ? "Generating image..." : "Share on LinkedIn"}
          >
            {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
            ) : (
              <Linkedin className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={actionButtonBase}
            title={isGenerating ? "Generating image..." : "Download image"}
          >
            {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-card to-background px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row">
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="h-20 w-20 rounded-full border border-border object-cover sm:h-24 sm:w-24"
            />

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
                {profile.name || profile.login}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                @{profile.login}
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>{profile.followers.toLocaleString()} followers</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{profile.following.toLocaleString()} following</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-background px-4 py-3 text-left sm:min-w-[140px] sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Repositories
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {profile.public_repos.toLocaleString()}
            </p>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-5 rounded-[24px] border border-border bg-background px-4 py-4">
            <p className="flex gap-3 text-sm leading-6 text-muted-foreground">
              <Coffee className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{profile.bio}</span>
            </p>
          </div>
        )}

        <div className="mt-6 rounded-[24px] border border-border bg-background px-4 py-4 sm:px-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground sm:text-[15px]">
                Contribution history
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {contributions.totalContributions.toLocaleString()} total
                contributions
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(profile.created_at).getFullYear()} to present
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
