"use client";

import React from "react";
import { LogoMark } from "@/components/ui/logo";
import {
  BookMarked,
  CalendarDays,
  Download,
  Link2,
  Linkedin,
  RefreshCw,
  Share2,
  Users,
} from "lucide-react";
import ContributionGrid from "./ContributionGrid";
import { GitHubContributions, GitHubProfile, Theme } from "./types";
import { Button } from "@/components/ui/button";
import { BadgeIcon } from "./badges/BadgeIcon";
import { formatBadgeName } from "./badges/RankMedal";
import { AllTimeEntry, fetchAllTimeEntry } from "./AuraPanel";
import { calculateTotalAura } from "@/lib/aura";
import { calculateStreak, formatNumber, getAuraStatus } from "@/lib/utils2";

interface ProfileCardProps {
  profile: GitHubProfile;
  contributions: GitHubContributions;
  selectedTheme: Theme;
  /** Attached to the off-screen share card (exported with html-to-image). */
  profileRef?: React.RefObject<HTMLDivElement | null>;
  handleShareTwitter: () => void;
  handleShareLinkedin: () => void;
  handleDownload: () => void;
  isGenerating?: boolean;
  /** When provided, a single "Share" button is shown instead of X / LinkedIn. */
  onShare?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** Rendered at the top of the main column (e.g. Aura overview). */
  overview?: React.ReactNode;
  /** Rendered below the contribution graph in the main column. */
  children?: React.ReactNode;
  /** Aura / streak shown on the exported share card (falls back to local calc). */
  aura?: number;
  streak?: number;
}

const Spinner = () => (
  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
);

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  contributions,
  selectedTheme,
  profileRef,
  handleShareTwitter,
  handleShareLinkedin,
  handleDownload,
  isGenerating = false,
  onShare,
  onRefresh,
  isRefreshing = false,
  overview,
  children,
  aura,
  streak,
}) => {
  const joined = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* Sidebar */}
      <aside className="w-full shrink-0 md:w-64 lg:w-[296px]">
        <div className="flex items-center gap-4 md:block">
          <img
            src={profile.avatar_url}
            alt={profile.name || profile.login}
            className="aspect-square h-16 w-16 shrink-0 rounded-full border border-border object-cover md:h-auto md:w-full"
          />
          <div className="min-w-0 md:mt-4">
            <h1 className="truncate text-xl font-semibold leading-tight text-foreground md:text-2xl">
              {profile.name || profile.login}
            </h1>
            <p className="truncate text-lg font-light leading-6 text-muted-foreground md:text-xl">
              @{profile.login}
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm leading-6 text-foreground">{profile.bio}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          {onShare ? (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onShare}
              disabled={isGenerating}
            >
              {isGenerating ? <Spinner /> : <Share2 />}
              Share
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShareTwitter}
                disabled={isGenerating}
                title="Share on X"
              >
                {isGenerating ? (
                  <Spinner />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                )}
                Share
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareLinkedin}
                disabled={isGenerating}
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <Linkedin />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isGenerating}
            title={isGenerating ? "Generating image..." : "Download image"}
            aria-label="Download image"
          >
            {isGenerating ? <Spinner /> : <Download />}
          </Button>
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh GitHub data"
              aria-label="Refresh GitHub data"
            >
              <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
            </Button>
          )}
        </div>

        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold text-foreground tabular-nums">
                {profile.followers.toLocaleString()}
              </span>{" "}
              followers ·{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {profile.following.toLocaleString()}
              </span>{" "}
              following
            </span>
          </li>
          <li className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold text-foreground tabular-nums">
                {profile.public_repos.toLocaleString()}
              </span>{" "}
              public repositories
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>Joined {joined}</span>
          </li>
          <li className="flex min-w-0 items-center gap-2">
            <Link2 className="h-4 w-4 shrink-0" />
            <a
              href={`https://github.com/${profile.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-foreground hover:text-link hover:underline"
            >
              github.com/{profile.login}
            </a>
          </li>
        </ul>
      </aside>

      {/* Main column */}
      <div className="min-w-0 flex-1 space-y-6">
        {overview}

        <div className="gh-box p-4">
          <h2 className="mb-3 text-base font-normal text-foreground">
            <span className="font-semibold tabular-nums">
              {contributions.totalContributions.toLocaleString()}
            </span>{" "}
            contributions in the last year
          </h2>
          <ContributionGrid
            contributions={contributions}
            selectedTheme={selectedTheme}
          />
        </div>

        {children}
      </div>

      {/* Off-screen shareable card — exported as an image via profileRef */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-[-10000px] top-0"
      >
        <ProfileShareCard
          cardRef={profileRef}
          profile={profile}
          contributions={contributions}
          selectedTheme={selectedTheme}
          aura={aura}
          streak={streak}
        />
      </div>
    </div>
  );
};

interface ProfileShareCardProps {
  profile: GitHubProfile;
  contributions: GitHubContributions;
  selectedTheme: Theme;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  aura?: number;
  streak?: number;
}

/**
 * Fixed-size (1200px wide, OG-ish) social card. Rendered off-screen and
 * captured with html-to-image; uses theme tokens so it matches the current
 * light/dark theme, with a solid background.
 */
export function ProfileShareCard({
  profile,
  contributions,
  selectedTheme,
  cardRef,
  aura,
  streak,
}: ProfileShareCardProps) {
  const [allTime, setAllTime] = React.useState<AllTimeEntry | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetchAllTimeEntry(profile.login).then((entry) => {
      if (!cancelled) setAllTime(entry);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.login]);

  const totalAura =
    aura && aura > 0 ? aura : calculateTotalAura(contributions.contributionDays);
  const currentStreak =
    streak && streak > 0 ? streak : calculateStreak(contributions.contributionDays);
  const level = getAuraStatus(totalAura).level;

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthContributions = contributions.contributionDays
    .filter((day) => day.date.startsWith(monthPrefix))
    .reduce((sum, day) => sum + day.contributionCount, 0);

  const topBadge = allTime?.badges?.length
    ? [...allTime.badges].sort(
        (a, b) =>
          (a.rank ?? 99) - (b.rank ?? 99) ||
          (b.month_year ?? "").localeCompare(a.month_year ?? "")
      )[0]
    : null;

  const stats = [
    { label: "Total aura", value: formatNumber(totalAura) },
    { label: "All-time rank", value: allTime?.rank ? `#${allTime.rank}` : "—" },
    { label: "Current streak", value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}` },
    { label: "Level", value: level },
    { label: "This month", value: monthContributions.toLocaleString() },
  ];

  return (
    <div
      ref={cardRef}
      data-profile-card
      className="flex w-[1200px] flex-col gap-7 bg-background p-12 font-sans text-foreground"
      style={{ minHeight: 630 }}
    >
      {/* Brand row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-lg font-semibold">GitAura</span>
        </div>
        <span className="text-base text-muted-foreground">
          git-aura.karandev.in
        </span>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-6">
        <img
          src={profile.avatar_url}
          alt=""
          crossOrigin="anonymous"
          className="h-24 w-24 shrink-0 rounded-full border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className="truncate text-3xl font-semibold leading-tight">
              {profile.name || profile.login}
            </span>
            <span className="truncate text-xl font-light text-muted-foreground">
              @{profile.login}
            </span>
          </div>
          {profile.bio && (
            <p className="mt-2 line-clamp-2 text-base leading-6 text-muted-foreground">
              {profile.bio}
            </p>
          )}
        </div>
        {topBadge && (
          <div className="flex shrink-0 items-center gap-3 rounded-md border border-border bg-canvas-subtle px-4 py-3">
            <BadgeIcon icon={topBadge.icon} name={formatBadgeName(topBadge.name)} className="h-12 w-12" />
            <div>
              <p className="text-xs text-muted-foreground">Top badge</p>
              <p className="max-w-[220px] truncate text-sm font-semibold">
                {formatBadgeName(topBadge.name)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-px overflow-hidden rounded-md border border-border bg-border">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 bg-background px-5 py-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 truncate text-2xl font-semibold tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Contribution graph — full year, never scroll-clipped */}
      <div className="rounded-md border border-border bg-background px-6 py-5">
        <ContributionGrid
          contributions={contributions}
          selectedTheme={selectedTheme}
          cellSize={15}
          cellGap={4}
          scrollable={false}
          footer={
            <span className="text-sm text-foreground">
              <span className="font-semibold tabular-nums">
                {contributions.totalContributions.toLocaleString()}
              </span>{" "}
              contributions in the last year
            </span>
          }
        />
      </div>
    </div>
  );
}

export default ProfileCard;
