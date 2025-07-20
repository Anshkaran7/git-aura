import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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
    };

    // Fetch contributors from the GitAura repository
    const response = await fetch(
      "https://api.github.com/repos/Anshkaran7/git-aura/contributors",
      {
        headers,
        // Cache for 1 hour to avoid hitting rate limits too often
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GitHub API Error:", errorData);

      if (
        response.status === 403 &&
        errorData.message?.includes("rate limit")
      ) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: errorData.message || "Failed to fetch contributors" },
        { status: response.status }
      );
    }

    const contributors = await response.json();

    // Filter out bots and sort by contributions
    const filteredContributors = contributors
      .filter((contributor: any) => contributor.type === "User")
      .sort((a: any, b: any) => b.contributions - a.contributions);

    return NextResponse.json({
      contributors: filteredContributors,
      total: filteredContributors.length,
    });
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}
