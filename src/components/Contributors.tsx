"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, ExternalLink, Users, Heart } from "lucide-react";
import Link from "next/link";

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

  const getContributionBadge = (contributions: number) => {
    if (contributions >= 100)
      return { text: "🚀 Core", color: "bg-primary text-primary-foreground" };
    if (contributions >= 50)
      return { text: "⭐ Active", color: "bg-accent text-accent-foreground" };
    if (contributions >= 10)
      return {
        text: "💡 Regular",
        color: "bg-secondary text-secondary-foreground",
      };
    return { text: "🌱 New", color: "bg-muted text-muted-foreground" };
  };

  const getInitials = (login: string) => {
    return login.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading our amazing contributors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to load contributors
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchContributors}
            className="text-primary hover:text-primary/80 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No contributors found
        </h3>
        <p className="text-muted-foreground">
          Be the first to contribute to GitAura!
        </p>
      </div>
    );
  }

  const topContributors = contributors.slice(0, 2);
  const otherContributors = contributors.slice(2);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-red-500" />
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            Our Amazing Contributors
          </h3>
          <Heart className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Thank you to all {contributors.length} contributors who make GitAura
          possible!
        </p>
      </div>

      {/* Top Contributors Section */}
      {topContributors.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-xl font-semibold text-foreground mb-2">
              Git Aura's Top Contributors
            </h4>
            <p className="text-sm text-muted-foreground">
              Leading the way in contributions
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {topContributors.map((contributor, index) => {
              const badge = getContributionBadge(contributor.contributions);

              return (
                <Card
                  key={contributor.id}
                  className={`group p-6 w-full max-w-sm sm:max-w-md hover:scale-105 transition-all duration-300 
                    border-2 border-primary/20 bg-gradient-to-br from-card to-card/80 
                    hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40
                    animate-in fade-in-50 slide-in-from-bottom-10
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary/20 group-hover:border-primary transition-colors">
                        <AvatarImage
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-lg">
                          {getInitials(contributor.login)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Top contributor indicator */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                        {index + 1}
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {contributor.login}
                      </h4>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 w-full">
                      <Badge className={`${badge.color} text-sm px-3 py-1`}>
                        {badge.text}
                      </Badge>

                      <div className="text-base sm:text-lg text-muted-foreground">
                        <span className="font-bold text-xl sm:text-2xl text-foreground">
                          {contributor.contributions}
                        </span>{" "}
                        <span className="text-sm">
                          contribution{contributor.contributions !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <Link
                      href={contributor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium group/btn">
                        <Github className="w-4 h-4" />
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Contributors Section */}
      {otherContributors.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-xl font-semibold text-foreground mb-2">
              All Contributors
            </h4>
            <p className="text-sm text-muted-foreground">
            All those who are helping use to make Git Aura Better
            </p>
          </div>

          <div className="w-max-7xl w-full flex flex-wrap justify-center items-center gap-10">
            {otherContributors.map((contributor, index) => (
              <Link
                key={contributor.id}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-min-content items-center"
              >
                <div className="flex w-min-content flex-col items-center justify-center text-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border border-border group-hover:border-primary transition-colors">
                    <AvatarImage
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xs">
                      {getInitials(contributor.login)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h5 className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-full">
                      {contributor.login}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      {contributor.contributions}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center pt-6">
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">
          Want to see your face here?
        </p>
        <Link
          href="https://github.com/Anshkaran7/git-aura"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Github className="w-5 h-5" />
          Start Contributing
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
