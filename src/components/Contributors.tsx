"use client";

import { useEffect, useState } from "react";
import { Github, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";

interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

interface ContributorsResponse {
  contributors: Contributor[];
  total: number;
}

export default function Contributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/contributors");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch contributors");
      }

      const data: ContributorsResponse = await response.json();
      setContributors(data.contributors);
    } catch (err) {
      console.error("Error fetching contributors:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getContributionLabel = (contributions: number) => {
    if (contributions >= 100) return { text: "Core", className: "border-transparent bg-done-subtle text-done" };
    if (contributions >= 50) return { text: "Active", className: "border-transparent bg-success-subtle text-success" };
    if (contributions >= 10) return { text: "Regular", className: "border-transparent bg-accent-subtle text-link" };
    return { text: "New", className: "" };
  };

  const header = (
    <div className="gh-box-header">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        Contributors
        {!loading && !error && (
          <span className="gh-counter">{contributors.length}</span>
        )}
      </h2>
      <a
        href="https://github.com/Anshkaran7/git-aura/graphs/contributors"
        target="_blank"
        rel="noopener noreferrer"
        className="gh-link text-xs"
      >
        View on GitHub
      </a>
    </div>
  );

  if (loading) {
    return (
      <div className="gh-box" aria-busy="true">
        {header}
        <div className="grid grid-cols-4 gap-3 p-4 sm:grid-cols-8 md:grid-cols-10">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 animate-pulse rounded-full bg-accent" />
              <div className="h-2.5 w-12 animate-pulse rounded bg-accent" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gh-box">
        {header}
        <div className="px-4 py-10 text-center">
          <Github className="mx-auto h-6 w-6 text-muted-foreground" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            Unable to load contributors
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchContributors}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="gh-box">
        {header}
        <div className="px-4 py-10 text-center">
          <Users className="mx-auto h-6 w-6 text-muted-foreground" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No contributors found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to contribute to GitAura!
          </p>
        </div>
      </div>
    );
  }

  const topContributors = contributors.slice(0, 2);
  const otherContributors = contributors.slice(2);

  return (
    <div className="gh-box overflow-hidden">
      {header}

      {/* Top contributors */}
      <div className="grid gap-px bg-border-muted sm:grid-cols-2">
        {topContributors.map((contributor, index) => {
          const label = getContributionLabel(contributor.contributions);
          return (
            <a
              key={contributor.id}
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-background px-4 py-3 hover:bg-canvas-subtle"
            >
              <UserAvatar
                src={contributor.avatar_url}
                githubUsername={contributor.login}
                className="h-10 w-10"
                initialsClassName="text-xs tracking-normal"
                size={80}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground group-hover:text-link">
                    {contributor.login}
                  </span>
                  <span className={`gh-label ${label.className}`}>{label.text}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold tabular-nums text-foreground">
                    {contributor.contributions.toLocaleString()}
                  </span>{" "}
                  contribution{contributor.contributions !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                #{index + 1}
              </span>
            </a>
          );
        })}
      </div>

      {/* Everyone else */}
      {otherContributors.length > 0 && (
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 border-t border-border-muted p-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {otherContributors.map((contributor) => (
            <a
              key={contributor.id}
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${contributor.login} · ${contributor.contributions} contributions`}
              className="group flex min-w-0 flex-col items-center gap-1.5 text-center"
            >
              <UserAvatar
                src={contributor.avatar_url}
                githubUsername={contributor.login}
                className="h-10 w-10 transition-colors group-hover:border-border-strong"
                initialsClassName="text-[11px] tracking-normal"
                size={80}
              />
              <span className="w-full truncate text-xs text-foreground group-hover:text-link">
                {contributor.login}
              </span>
              <span className="-mt-1 text-[11px] tabular-nums text-muted-foreground">
                {contributor.contributions}
              </span>
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-2 border-t border-border-muted bg-canvas-subtle px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <span>Want to see your face here?</span>
        <a
          href="https://github.com/Anshkaran7/git-aura"
          target="_blank"
          rel="noopener noreferrer"
          className="gh-link font-medium"
        >
          Start contributing →
        </a>
      </div>
    </div>
  );
}
