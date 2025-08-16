import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Extract username from the URL path
  const username = request.nextUrl.pathname.split("/").pop();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const shouldRefresh = searchParams.get("refresh") === "true";

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  // Check if GitHub token is available
  if (!process.env.GITHUB_TOKEN) {
    console.warn("GitHub token not found in environment variables");
    return NextResponse.json(
      {
        error:
          "GitHub token not configured. Please set GITHUB_TOKEN environment variable.",
      },
      { status: 500 }
    );
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "GitAura-App",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  };

  try {
    // Fetch user profile and contributions in parallel
    const [profileResponse, contributionsResponse] = await Promise.all([
      // Fetch user profile
      fetch(`https://api.github.com/users/${username}`, {
        headers,
        cache: "no-store",
      }),

      // Fetch contributions using GraphQL
      (async () => {
        const today = new Date();
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        lastYear.setDate(lastYear.getDate() + 1);

        const graphqlQuery = {
          query: `query($userName:String!) { 
            user(login: $userName) {
              followers { totalCount }
              following { totalCount }
              issues(states: [OPEN, CLOSED]) { totalCount }
              pullRequests(states: MERGED) { totalCount }
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
              repositories(privacy: PUBLIC, isFork: false) { totalCount }
              gists(privacy: PUBLIC) { totalCount }
              createdAt
            }
          }`,
          variables: { userName: username },
        };

        return fetch("https://api.github.com/graphql", {
          method: "POST",
          headers,
          body: JSON.stringify(graphqlQuery),
          cache: "no-store",
        });
      })(),
    ]);

    // Handle profile response
    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      console.error("GitHub API Error:", errorData);

      if (
        profileResponse.status === 403 &&
        errorData.message?.includes("rate limit")
      ) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: errorData.message || "User not found" },
        { status: profileResponse.status }
      );
    }

    // Handle contributions response
    if (!contributionsResponse.ok) {
      const errorData = await contributionsResponse.json().catch(() => ({}));
      console.error("GitHub GraphQL API Error:", errorData);

      if (contributionsResponse.status === 403) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch contributions" },
        { status: contributionsResponse.status }
      );
    }

    // Parse responses
    const profileData = await profileResponse.json();
    const contributionsData = await contributionsResponse.json();

    // Handle GraphQL errors
    if (contributionsData.errors) {
      console.error("GitHub GraphQL Errors:", contributionsData.errors);
      return NextResponse.json(
        { error: contributionsData.errors[0].message },
        { status: 400 }
      );
    }

    if (!contributionsData.data?.user?.contributionsCollection) {
      return NextResponse.json(
        {
          error:
            "No contributions data found. This might be due to API rate limits or missing GitHub token.",
        },
        { status: 404 }
      );
    }

    // Process contributions data
    const userData = contributionsData.data.user;
    const calendar = userData.contributionsCollection.contributionCalendar;
    const allContributions = calendar.weeks.flatMap(
      (week: { contributionDays: any[] }) => week.contributionDays
    );

    // Parse additional stats from GraphQL response
    const totalIssues = userData.issues?.totalCount ?? 0;
    const totalPullRequests = userData.pullRequests?.totalCount ?? 0;
    const totalRepositories = userData.repositories?.totalCount ?? 0;
    const totalGists = userData.gists?.totalCount ?? 0;
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
    const totalStars = 0; // Not fetched in this query

    // Calculate aura using allContributions
    let aura = 0;
    try {
      // Dynamically import to avoid circular dependency
      const { calculateTotalAura } = await import("@/lib/aura-calculations");
      aura = calculateTotalAura(
        Array.isArray(allContributions) ? allContributions : []
      );
    } catch (e) {
      aura = 0;
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

    // Return combined data with aura and no-cache headers
    const response = NextResponse.json(
      {
        profile: profileData,
        contributions: contributionsResult,
        aura,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    if (userId) {
      // Find user in database to get GitHub username
      prisma.user
        .findUnique({
          where: { id: userId },
          select: { githubUsername: true },
        })
        .then((user) => {
          if (user?.githubUsername) {
            // Only calculate aura if the logged-in user is viewing their own profile
            if (user.githubUsername.toLowerCase() === username.toLowerCase()) {
              // Force refresh if requested
              if (shouldRefresh) {
                console.log(`[Profile API] Forcing refresh for ${username}`);
              }

              calculateAndStoreUserAura(
                userId,
                user.githubUsername,
                contributionsResult.contributionDays
              ).catch((err) => {
                console.error("Background aura calculation failed:", err);
              });
            }
          }
        })
        .catch((err) => {
          console.error(
            "Error finding user for background aura calculation:",
            err
          );
        });
    }

    return response;
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
