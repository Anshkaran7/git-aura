interface GitHubProfileData {
  id: number;
  login: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface FetchGitHubProfileResult {
  success: boolean;
  data?: GitHubProfileData;
  error?: string;
}

export async function fetchGitHubProfile(
  username: string
): Promise<FetchGitHubProfileResult> {
  if (!username || !username.trim()) {
    return {
      success: false,
      error: "Username is required",
    };
  }

  if (!process.env.GITHUB_TOKEN) {
    console.warn("GitHub token not found in environment variables");
    return {
      success: false,
      error: "GitHub token not configured",
    };
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "GitAura-App",
  };

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GitHub API Error:", errorData);

      if (
        response.status === 403 &&
        errorData.message?.includes("rate limit")
      ) {
        return {
          success: false,
          error: "GitHub API rate limit exceeded",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "GitHub user not found",
        };
      }

      return {
        success: false,
        error: errorData.message || `GitHub API error: ${response.status}`,
      };
    }

    const profileData = (await response.json()) as GitHubProfileData;

    return {
      success: true,
      data: profileData,
    };
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Helper function to extract GitHub username from various sources
export function extractGitHubUsername(user: any): string | null {
  // Try external accounts first (Clerk)
  if (user.externalAccounts && user.externalAccounts.length > 0) {
    const githubAccount = user.externalAccounts.find(
      (account: any) => account.provider === "github"
    );
    if (githubAccount?.username) {
      return githubAccount.username;
    }
  }

  // Try username field
  if (user.username) {
    return user.username;
  }

  // Try email prefix as fallback
  if (user.primaryEmailAddress?.emailAddress) {
    const emailPrefix = user.primaryEmailAddress.emailAddress.split("@")[0];
    if (emailPrefix && !emailPrefix.includes("+")) {
      return emailPrefix;
    }
  }

  return null;
}

export type { GitHubProfileData, FetchGitHubProfileResult };
