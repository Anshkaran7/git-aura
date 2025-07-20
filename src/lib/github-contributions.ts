interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GitHubContributions {
  totalContributions: number;
  contributionDays: ContributionDay[];
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
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    lastYear.setDate(lastYear.getDate() + 1);

    const graphqlQuery = {
      query: `query($userName:String!) { 
        user(login: $userName){
          contributionsCollection(from: "${lastYear.toISOString()}", to: "${today.toISOString()}") {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
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

      return {
        success: false,
        error: errorData.message || `GitHub API error: ${response.status}`,
      };
    }

    const contributionsData = await response.json();

    // Handle GraphQL errors
    if (contributionsData.errors) {
      console.error("GitHub GraphQL Errors:", contributionsData.errors);
      return {
        success: false,
        error: contributionsData.errors[0].message,
      };
    }

    if (!contributionsData.data?.user?.contributionsCollection) {
      return {
        success: false,
        error: "No contributions data found",
      };
    }

    // Process contributions data
    const calendar =
      contributionsData.data.user.contributionsCollection.contributionCalendar;
    const allContributions = calendar.weeks.flatMap(
      (week: { contributionDays: any[] }) => week.contributionDays
    );

    const contributionsResult = {
      totalContributions: calendar.totalContributions,
      contributionDays: allContributions,
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
