import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubProfile } from "@/lib/github-fetch";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { githubUsername, displayName, avatarUrl } = body;

    if (!githubUsername) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    // Fetch complete GitHub profile data
    console.log(
      `[Sync User] Fetching GitHub profile for username: ${githubUsername}`
    );
    const githubResult = await fetchGitHubProfile(githubUsername);

    let githubData = null;
    let githubId = null;
    let actualEmail = `${githubUsername}@github.local`; // Fallback email
    let actualDisplayName = displayName || githubUsername;
    let actualAvatarUrl =
      avatarUrl || `https://github.com/${githubUsername}.png`;

    if (githubResult.success && githubResult.data) {
      githubData = githubResult.data;
      githubId = githubResult.data.id.toString();

      // Use GitHub email if available
      if (githubResult.data.email) {
        actualEmail = githubResult.data.email;
      }

      // Use GitHub display name if available
      if (githubResult.data.name) {
        actualDisplayName = displayName || githubResult.data.name;
      }

      // Use GitHub avatar URL
      actualAvatarUrl = avatarUrl || githubResult.data.avatar_url;

      console.log(
        `✅ [Sync User] Successfully fetched GitHub profile for ${githubUsername}`
      );
    } else {
      console.warn(
        `⚠️ [Sync User] Failed to fetch GitHub profile for ${githubUsername}:`,
        githubResult.error
      );
    }

    // Create or update user with complete GitHub data
    const user = await prisma.user.upsert({
      where: { githubUsername },
      create: {
        email: actualEmail,
        githubUsername,
        githubId: githubId,
        displayName: actualDisplayName,
        avatarUrl: actualAvatarUrl,
        githubData: githubData ? (githubData as any) : undefined,
        totalAura: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastContributionDate: new Date(),
      },
      update: {
        email: actualEmail,
        githubId: githubId,
        displayName: actualDisplayName,
        avatarUrl: actualAvatarUrl,
        githubData: githubData ? (githubData as any) : undefined,
        updatedAt: new Date(),
      },
    });

    // Calculate and store aura for the user
    console.log(
      `[Sync User] Starting aura calculation for user: ${githubUsername}`
    );

    const contributionsResult = await fetchGitHubContributions(githubUsername);

    if (contributionsResult.success && contributionsResult.data) {
      const auraResult = await calculateAndStoreUserAura(
        user.id,
        githubUsername,
        contributionsResult.data.contributionDays
      );

      if (auraResult.success) {
        console.log(
          `✅ [Sync User] Successfully calculated aura for ${githubUsername}: ${auraResult.totalAura} total aura`
        );
      } else {
        console.error(
          `❌ [Sync User] Failed to calculate aura for ${githubUsername}:`,
          auraResult.error
        );
      }
    } else {
      console.warn(
        `⚠️ [Sync User] Failed to fetch contributions for ${githubUsername}:`,
        contributionsResult.error
      );
    }

    console.log(
      `✅ [Sync User] Successfully synced user: ${user.githubUsername}`
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        githubUsername: user.githubUsername,
        githubId: user.githubId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        email: user.email,
        githubData: user.githubData,
        totalAura: user.totalAura,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    });
  } catch (error) {
    console.error("Error in sync-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
