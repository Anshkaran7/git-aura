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

    // Filter out bots and known automated accounts
    const botPatterns = [
      /bot$/i,
      /\[bot\]/i,
      /imgbot/i,
      /dependabot/i,
      /renovate/i,
      /snyk-bot/i,
      /greenkeeper/i,
      /codecov/i,
      /deepsource/i,
      /whitesource/i,
      /allcontributors/i,
      /stale/i,
      /semantic-release/i,
    ];

    const knownBotNames = [
      "imgbot",
      "imgbotapp",
      "dependabot[bot]",
      "renovate[bot]",
      "snyk-bot",
      "greenkeeper[bot]",
      "codecov-io",
      "deepsource-autofix[bot]",
      "whitesource-bolt-for-github[bot]",
      "allcontributors[bot]",
      "stale[bot]",
      "semantic-release-bot",
    ];

    const filteredContributors = contributors
      .filter((contributor: any) => {
        // Filter by type first
        if (contributor.type !== "User") return false;

        // Check against known bot names (case insensitive)
        const loginLower = contributor.login.toLowerCase();
        if (
          knownBotNames.some((botName) => loginLower === botName.toLowerCase())
        ) {
          return false;
        }

        // Check against bot patterns
        if (botPatterns.some((pattern) => pattern.test(contributor.login))) {
          return false;
        }

        return true;
      })
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
