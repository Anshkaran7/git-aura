import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Debug logging for user ID issue
    console.log(`🔍 [Sync] Auth userId: ${userId}`);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's GitHub data from the request body
    const body = await request.json();
    console.log(`🔍 [Sync] Request body userId: ${body.userId}`);

    const githubData = {
      username: body.githubUsername,
      name: body.displayName,
      avatar_url: body.avatarUrl,
    };

    console.log("🔍 [Sync] githubData", githubData);
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
      console.log(
        `🔍 [Sync] Found existing user with GitHub username: ${githubData.username}, current ID: ${user.id}, new ID: ${userId}`
      );
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
        console.log(
          `🔍 [Sync] Found existing user by ID: ${userId}, updating with GitHub info`
        );
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
        console.log(`🔍 [Sync] Creating new user: ${userId}`);
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

    console.log(`🔍 [Sync] Final user ID: ${user.id}`);

    // Fetch GitHub contributions using the existing utility function
    console.log(`Fetching GitHub contributions for ${githubData.username}`);
    const contributionsResult = await fetchGitHubContributions(
      githubData.username
    );

    if (!contributionsResult.success || !contributionsResult.data) {
      console.error(
        "Failed to fetch GitHub contributions:",
        contributionsResult.error
      );
      return NextResponse.json(
        {
          error: `Failed to fetch GitHub contributions: ${contributionsResult.error}`,
        },
        { status: 500 }
      );
    }

    const contributionsData = contributionsResult.data;
    const totalContributions = contributionsData.totalContributions || 0;

    // Get the current month's contributions
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const monthlyContributions = contributionsData.contributionDays
      .filter((day: { date: string }) => {
        const date = new Date(day.date);
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      })
      .reduce(
        (sum: number, day: { contributionCount: number }) =>
          sum + day.contributionCount,
        0
      );

    // Calculate aura based on contributions
    const monthlyAura = monthlyContributions * 10; // 10 points per contribution
    const totalAura = totalContributions * 10; // 10 points per contribution

    // Only update basic data without expensive rank calculations
    // The rank calculations will be handled by a separate cron job
    await prisma.monthlyLeaderboard.upsert({
      where: {
        userId_monthYear: {
          userId: user.id,
          monthYear: currentMonthYear,
        },
      },
      update: {
        totalAura: monthlyAura,
        // Don't update rank here to avoid connection pool issues
      },
      create: {
        userId: user.id,
        monthYear: currentMonthYear,
        totalAura: monthlyAura,
        rank: 999999, // Will be updated by cron job
      },
    });

    // Update global leaderboard without rank calculation
    await prisma.globalLeaderboard.upsert({
      where: { userId: user.id },
      update: {
        totalAura: totalAura,
        lastUpdated: now,
        // Don't update rank here to avoid connection pool issues
      },
      create: {
        userId: user.id,
        totalAura: totalAura,
        rank: 999999, // Will be updated by cron job
        year: now.getFullYear().toString(),
        yearlyAura: totalAura,
      },
    });

    // Update user's total aura
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalAura: totalAura,
      },
    });

    // Return the updated user data without expensive joins
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log(
      `✅ Successfully synced user data for ${githubData.username} (ID: ${user.id})`
    );
    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        monthlyAura,
        totalContributions,
        monthlyContributions,
      },
    });
  } catch (error) {
    console.error("❌ [Sync] Error syncing user:", error);

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
