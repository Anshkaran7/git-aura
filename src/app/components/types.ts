export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubCommit {
  date: string;
  repo: string;
  message?: string;
  sha?: string;
}

export interface GitHubRepo {
  name: string;
  pushed_at: string;
}

export interface GitHubContributions {
  totalContributions: number;
  contributionDays: ContributionDay[];
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface Theme {
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

export interface ShareableProfile {
  id: string;
  username: string;
  profile_data: GitHubProfile;
  contributions: GitHubContributions;
  created_at: string;
}

export type ViewType = "profile" | "leaderboard" | "badges";
