import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";

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

    // Fetch GitHub contributions using the existing utility function
    const contributionsResult = await fetchGitHubContributions(
      githubData.username
    );

    if (!contributionsResult.success || !contributionsResult.data) {
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
    // const monthlyAura = monthlyContributions * 10; // 10 points per contribution
    const totalAura = totalContributions * 10; // 10 points per contribution
    const activeDays = contributionsData.contributionDays.filter((day) => {
      const date = new Date(day.date);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        day.contributionCount > 0
      );
    }).length;

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    // Correct monthly aura calculation
    const baseAura = monthlyContributions * 10; // 10 points per contribution
    const consistencyBonus = Math.round((activeDays / daysInMonth) * 1000); // Consistency bonus
    const monthlyAura = Math.round(
      baseAura + activeDays * 50 + consistencyBonus
    ); // Active days bonus

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
