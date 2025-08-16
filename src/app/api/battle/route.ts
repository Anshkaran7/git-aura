import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubProfile } from "../../../lib/github-fetch";
import { fetchGitHubContributions } from "../../../lib/github-contributions";
import {
  calculateTotalAura,
  calculateStreak,
} from "../../../lib/aura-calculations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user1 = searchParams.get("user1");
  const user2 = searchParams.get("user2");

  if (!user1 || !user2) {
    return NextResponse.json({ error: "Missing usernames" }, { status: 400 });
  }

  try {
    // Fetch both profiles and contributions in parallel
    const [profile1Res, profile2Res, contributions1Res, contributions2Res] =
      await Promise.all([
        fetchGitHubProfile(user1),
        fetchGitHubProfile(user2),
        fetchGitHubContributions(user1),
        fetchGitHubContributions(user2),
      ]);

    // Check for profile fetch errors first
    if (!profile1Res.success || !profile1Res.data) {
      if (profile1Res.error?.includes("not found")) {
        return NextResponse.json(
          { error: `Username "${user1}" does not exist on GitHub` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch profile for ${user1}: ${profile1Res.error}` },
        { status: 404 }
      );
    }

    if (!profile2Res.success || !profile2Res.data) {
      if (profile2Res.error?.includes("not found")) {
        return NextResponse.json(
          { error: `Username "${user2}" does not exist on GitHub` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch profile for ${user2}: ${profile2Res.error}` },
        { status: 404 }
      );
    }

    // Check for contributions fetch errors (these are not critical, we can proceed with basic metrics)
    if (!contributions1Res.success) {
      console.warn(
        `Failed to fetch contributions for ${user1}:`,
        contributions1Res.error
      );
    } else {
      // console.log(`Successfully fetched contributions for ${user1}:`, {
      //   totalContributions: contributions1Res.data?.totalContributions,
      //   totalStars: contributions1Res.data?.totalStars,
      //   totalIssues: contributions1Res.data?.totalIssues,
      //   totalPRs: contributions1Res.data?.totalPullRequests,
      // });
    }

    if (!contributions2Res.success) {
      console.warn(
        `Failed to fetch contributions for ${user2}:`,
        contributions2Res.error
      );
    } else {
      // console.log(`Successfully fetched contributions for ${user2}:`, {
      //   totalContributions: contributions2Res.data?.totalContributions,
      //   totalStars: contributions2Res.data?.totalStars,
      //   totalIssues: contributions2Res.data?.totalIssues,
      //   totalPRs: contributions2Res.data?.totalPullRequests,
      // });
    }

    // Fetch aura score from internal API for both users
    async function fetchAura(username: string) {
      try {
        const url = `${
          process.env.INTERNAL_API_BASE_URL || "http://localhost:3000"
        }/api/github/profile/${username}`;
        const res = await fetch(url, {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return 0;
        const data = await res.json();
        return typeof data.aura === "number" ? data.aura : 0;
      } catch {
        return 0;
      }
    }

    const [user1Aura, user2Aura] = await Promise.all([
      fetchAura(user1),
      fetchAura(user2),
    ]);

    // Debug Aura calculation
    // console.log(`Debug Aura calculation for ${user1}:`, {
    //   contributionsSuccess: contributions1Res.success,
    //   contributionDays: contributions1Res.data?.contributionDays?.length || 0,
    //   totalContributions: contributions1Res.data?.totalContributions || 0,
    //   calculatedAura: user1Aura,
    // });

    // console.log(`Debug Aura calculation for ${user2}:`, {
    //   contributionsSuccess: contributions2Res.success,
    //   contributionDays: contributions2Res.data?.contributionDays?.length || 0,
    //   totalContributions: contributions2Res.data?.totalContributions || 0,
    //   calculatedAura: user2Aura,
    // });

    // Calculate account age in years (use contributions data if available, fallback to profile data)
    const user1Age =
      contributions1Res.success && contributions1Res.data
        ? contributions1Res.data.accountAge
        : Math.max(
            0,
            (Date.now() - new Date(profile1Res.data.created_at).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25)
          );

    const user2Age =
      contributions2Res.success && contributions2Res.data
        ? contributions2Res.data.accountAge
        : Math.max(
            0,
            (Date.now() - new Date(profile2Res.data.created_at).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25)
          );

    // Create comprehensive metrics array with fallbacks
    const metrics = [
      {
        key: "aura",
        label: "Aura Score",
        value1: user1Aura,
        value2: user2Aura,
        description: "Composite score based on contributions and activity",
      },
      {
        key: "totalContributions",
        label: "Contributions (1yr)",
        value1:
          contributions1Res.success && contributions1Res.data
            ? contributions1Res.data.totalContributions
            : 0,
        value2:
          contributions2Res.success && contributions2Res.data
            ? contributions2Res.data.totalContributions
            : 0,
        description: "Total contributions in the last year",
      },
      {
        key: "totalIssues",
        label: "Issues Raised",
        value1:
          contributions1Res.success && contributions1Res.data
            ? contributions1Res.data.totalIssues
            : 0,
        value2:
          contributions2Res.success && contributions2Res.data
            ? contributions2Res.data.totalIssues
            : 0,
        description: "Total issues opened by the user (open and closed)",
      },
      {
        key: "totalPullRequests",
        label: "PRs Merged",
        value1:
          contributions1Res.success && contributions1Res.data
            ? contributions1Res.data.totalPullRequests
            : 0,
        value2:
          contributions2Res.success && contributions2Res.data
            ? contributions2Res.data.totalPullRequests
            : 0,
        description: "Total pull requests merged by the user",
      },
      {
        key: "totalStars",
        label: "Total Stars",
        value1:
          contributions1Res.success && contributions1Res.data
            ? contributions1Res.data.totalStars
            : 0,
        value2:
          contributions2Res.success && contributions2Res.data
            ? contributions2Res.data.totalStars
            : 0,
        description: "Stars from non-fork repositories",
      },
      {
        key: "followers",
        label: "Followers",
        value1: profile1Res.data.followers,
        value2: profile2Res.data.followers,
        description: "Number of followers",
      },
      // {
      //   key: "created_at",
      //   label: "Account Age (yrs)",
      //   value1: Math.round(user1Age * 10) / 10,
      //   value2: Math.round(user2Age * 10) / 10,
      //   description: "Account age in years",
      // },
    ];

    // Add a note about which metrics are available
    const availableMetrics = metrics.filter(
      (m) =>
        m.key === "aura" ||
        m.key === "followers" ||
        m.key === "created_at" ||
        (contributions1Res.success && contributions2Res.success)
    ).length;

    // Determine winner for each metric
    const results = metrics.map((m) => {
      let winner = null;
      if (m.key === "created_at") {
        // Older account wins (greater age in years)
        winner =
          m.value1 > m.value2 ? "user1" : m.value1 < m.value2 ? "user2" : null;
      } else {
        winner =
          m.value1 > m.value2 ? "user1" : m.value1 < m.value2 ? "user2" : null;
      }
      return { ...m, winner };
    });

    // Count wins
    const user1Wins = results.filter((r) => r.winner === "user1").length;
    const user2Wins = results.filter((r) => r.winner === "user2").length;
    let overallWinner = null;
    if (user1Wins > user2Wins) overallWinner = "user1";
    else if (user2Wins > user1Wins) overallWinner = "user2";

    return NextResponse.json({
      user1: profile1Res.data,
      user2: profile2Res.data,
      results,
      winner: overallWinner,
      metrics: {
        user1Wins,
        user2Wins,
        totalMetrics: results.length,
        enhancedMetricsAvailable:
          contributions1Res.success && contributions2Res.success,
        note:
          contributions1Res.success && contributions2Res.success
            ? "Full metrics including contributions, stars, issues, and PRs"
            : "Basic metrics only (GitHub token required for enhanced data)",
      },
    });
  } catch (e) {
    console.error("Battle API error:", e);
    return NextResponse.json(
      { error: "Failed to fetch profiles. Please try again." },
      { status: 500 }
    );
  }
}
