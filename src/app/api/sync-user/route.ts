import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";
import { shouldRefreshUserData } from "@/lib/refresh-utils";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Debug logging for user ID issue

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's GitHub data from the request body
    const body = await request.json();

    const githubData = {
      username: body.githubUsername,
      name: body.displayName,
      avatar_url: body.avatarUrl,
    };

    if (!githubData.username) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    // First, ensure the user exists in our database
    // Handle the unique constraint on githubUsername by checking if it exists first
    let user = await prisma.user.findUnique({
      where: { githubUsername: githubData.username },
    });

    if (user) {
      // User with this GitHub username already exists, update their Clerk user ID and other data
      user = await prisma.user.update({
        where: { githubUsername: githubData.username },
        data: {
          id: userId, // Update to current Clerk user ID
          displayName: githubData.name || githubData.username,
          avatarUrl: githubData.avatar_url,
          updatedAt: new Date(),
        },
      });
    } else {
      // Check if user exists by Clerk ID but with different/no GitHub username
      const existingUserById = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (existingUserById) {
        // Update existing user with GitHub info
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            githubUsername: githubData.username,
            displayName: githubData.name || githubData.username,
            avatarUrl: githubData.avatar_url,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${githubData.username}@github.local`, // Required field
            githubUsername: githubData.username,
            displayName: githubData.name || githubData.username,
            avatarUrl: githubData.avatar_url,
            totalAura: 0,
            currentStreak: 0,
          },
        });
      }
    }

    // Check if we should refresh user data
    const refreshDecision = await shouldRefreshUserData(userId);

    // Only fetch fresh contributions if refresh is needed
    if (refreshDecision.shouldRefresh) {
      console.log(
        `[Sync] Refreshing data for ${githubData.username}: ${refreshDecision.reason}`
      );

      const contributionsResult = await fetchGitHubContributions(
        githubData.username
      );

      if (contributionsResult.success && contributionsResult.data) {
        // Recalculate aura with fresh data using the aura calculations
        const auraResult = await calculateAndStoreUserAura(
          user.id,
          githubData.username,
          contributionsResult.data.contributionDays
        );

        if (!auraResult.success) {
          console.error(
            `[Sync] Failed to calculate aura for ${githubData.username}: ${auraResult.error}`
          );
        }
      } else {
        console.error(
          `[Sync] Failed to fetch contributions for ${githubData.username}: ${contributionsResult.error}`
        );
      }
    } else {
      console.log(
        `[Sync] Skipping refresh for ${githubData.username}: ${refreshDecision.reason}`
      );
    }

    // Return the updated user data without expensive joins
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      refreshInfo: {
        wasRefreshed: refreshDecision.shouldRefresh,
        reason: refreshDecision.reason,
        lastRefresh: refreshDecision.lastRefresh,
      },
    });
  } catch (error) {
    // More specific error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to sync user data: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to sync user data" },
      { status: 500 }
    );
  }
}
