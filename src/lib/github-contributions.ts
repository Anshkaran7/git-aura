interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GitHubContributions {
  totalContributions: number;
  contributionDays: ContributionDay[];
  // Additional metrics for battle comparison
  totalIssues: number;
  totalPullRequests: number;
  totalRepositories: number;
  totalGists: number;
  totalFollowers: number;
  totalFollowing: number;
  accountAge: number;
  totalStars: number;
}

interface FetchContributionsResult {
  success: boolean;
  data?: GitHubContributions;
  error?: string;
}

export async function fetchGitHubContributions(
  username: string
): Promise<FetchContributionsResult> {
  if (!username || !username.trim()) {
    return {
      success: false,
      error: "Username is required",
    };
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "GitAura-App",
  };

  try {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    lastYear.setDate(lastYear.getDate() + 1);

    console.log(
      `Debug: Attempting to fetch contributions for ${username} from ${lastYear.toISOString()} to ${today.toISOString()}`
    );

    const graphqlQuery = {
      query: `query($userName:String!) { 
        user(login: $userName) {
          createdAt
          followers { totalCount }
          following { totalCount }
          issues(states: [OPEN, CLOSED]) { totalCount }
          pullRequests(states: MERGED, first: 100) {
            totalCount
          }
          contributionsCollection { 
            contributionCalendar { 
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            } 
          }
          repositories(privacy: PUBLIC, isFork: false, first: 100) {
            totalCount
            nodes { stargazerCount }
          }
          bio
          websiteUrl
          avatarUrl
          pinnedItems(first: 6) {
            totalCount
            nodes { ... on Repository { name } }
          }
        }
      }`,
      variables: { userName: username },
    };

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GitHub GraphQL API Error:", errorData);

      if (response.status === 403) {
        return {
          success: false,
          error: "GitHub API rate limit exceeded",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: false,
        error: errorData.message || `GitHub API error: ${response.status}`,
      };
    }

    const contributionsData = await response.json();

    // Handle GraphQL errors
    if (contributionsData.errors) {
      console.error("GitHub GraphQL Errors:", contributionsData.errors);

      // Check if it's a user not found error
      const userNotFoundError = contributionsData.errors.find(
        (error: any) =>
          error.message?.includes("Could not resolve to a User") ||
          error.message?.includes("not found")
      );

      if (userNotFoundError) {
        return {
          success: false,
          error: "User not found",
        };
      }

      const hasUsableContributionData = Boolean(
        contributionsData.data?.user?.contributionsCollection
      );

      if (!hasUsableContributionData) {
        return {
          success: false,
          error: contributionsData.errors[0].message,
        };
      }

      console.warn(
        `GitHub GraphQL returned partial data for ${username}; continuing with available contribution data.`
      );
    }

    // console.log(`Debug: Raw GraphQL response for ${username}:`, {
    //   hasData: !!contributionsData.data,
    //   hasUser: !!contributionsData.data?.user,
    //   hasContributions: !!contributionsData.data?.user?.contributionsCollection,
    //   responseKeys: Object.keys(contributionsData.data?.user || {}),
    // });

    if (!contributionsData.data?.user?.contributionsCollection) {
      return {
        success: false,
        error: "No contributions data found",
      };
    }

    // Process contributions data
    const calendar =
      contributionsData.data.user.contributionsCollection.contributionCalendar;
    let allContributions: any[] = [];
    if (calendar.weeks && Array.isArray(calendar.weeks)) {
      allContributions = calendar.weeks.flatMap(
        (week: { contributionDays: any[] }) => week.contributionDays
      );
    }

    // console.log(`Debug: User ${username} contributions:`, {
    //   totalContributions: calendar.totalContributions,
    //   contributionDaysCount: allContributions.length,
    //   firstDay: allContributions[0] || "none",
    //   lastDay: allContributions[allContributions.length - 1] || "none",
    // });

    // Parse additional stats from GraphQL response
    const userData = contributionsData.data.user;
    const totalIssues = userData.issues?.totalCount ?? 0;
    const totalPullRequests = userData.pullRequests?.totalCount ?? 0;
    const totalRepositories = userData.repositories?.totalCount ?? 0;
    const totalGists = 0; // Gists removed from query due to Fine-Grained PAT limitations
    const totalFollowers = userData.followers?.totalCount ?? 0;
    const totalFollowing = userData.following?.totalCount ?? 0;
    // Account age in years
    const createdAt = userData.createdAt ? new Date(userData.createdAt) : null;
    const now = new Date();
    const accountAge = createdAt
      ? Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365)
        )
      : 0;
    // Sum stargazerCount for all repos (up to 100)
    let totalStars = 0;
    if (userData.repositories && userData.repositories.nodes) {
      totalStars = userData.repositories.nodes.reduce(
        (sum: number, repo: any) => sum + (repo.stargazerCount || 0),
        0
      );
    }

    const contributionsResult = {
      totalContributions: calendar.totalContributions,
      contributionDays: allContributions,
      totalIssues,
      totalPullRequests,
      totalRepositories,
      totalGists,
      totalFollowers,
      totalFollowing,
      accountAge,
      totalStars,
    };

    return {
      success: true,
      data: contributionsResult,
    };
  } catch (error) {
    console.error("Error fetching GitHub contributions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export type { ContributionDay, GitHubContributions, FetchContributionsResult };
