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

    if (
      !profile1Res.success ||
      !profile1Res.data ||
      !profile2Res.success ||
      !profile2Res.data
    ) {
      return NextResponse.json(
        { error: "Failed to fetch one or both profiles" },
        { status: 404 }
      );
    }

    // Calculate full aura for both users
    const user1Aura =
      contributions1Res.success && contributions1Res.data
        ? calculateTotalAura(contributions1Res.data.contributionDays)
        : 0;

    const user2Aura =
      contributions2Res.success && contributions2Res.data
        ? calculateTotalAura(contributions2Res.data.contributionDays)
        : 0;

    // Calculate account age in years
    const user1Age = Math.max(
      0,
      (Date.now() - new Date(profile1Res.data.created_at).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
    );
    const user2Age = Math.max(
      0,
      (Date.now() - new Date(profile2Res.data.created_at).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
    );

    // Create metrics array with proper aura calculation
    const metrics = [
      {
        key: "aura",
        label: "Aura",
        value1: user1Aura,
        value2: user2Aura,
      },
      {
        key: "public_repos",
        label: "Repositories",
        value1: profile1Res.data.public_repos,
        value2: profile2Res.data.public_repos,
      },
      {
        key: "followers",
        label: "Followers",
        value1: profile1Res.data.followers,
        value2: profile2Res.data.followers,
      },
      {
        key: "following",
        label: "Following",
        value1: profile1Res.data.following,
        value2: profile2Res.data.following,
      },
      {
        key: "created_at",
        label: "Account Age (yrs)",
        value1: Math.round(user1Age * 10) / 10, // Round to 1 decimal place
        value2: Math.round(user2Age * 10) / 10,
      },
    ];

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
    });
  } catch (e) {
    console.error("Battle API error:", e);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}
