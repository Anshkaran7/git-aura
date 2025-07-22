import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user data from the request body
    const body = await request.json();
    const {
      userId: requestUserId,
      githubUsername,
      displayName,
      avatarUrl,
    } = body;

    console.log("Sync request data:", { userId, githubUsername, displayName });

    if (!githubUsername) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    // First, ensure the user exists in our database
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        githubUsername: githubUsername,
        displayName: displayName || githubUsername,
        avatarUrl: avatarUrl,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        email: `${githubUsername}@github.local`, // Required field
        githubUsername: githubUsername,
        displayName: displayName || githubUsername,
        avatarUrl: avatarUrl,
        totalAura: 0,
        currentStreak: 0,
      },
    });

    // Calculate total contributions and aura
    const contributionsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/contributions/${githubUsername}`
    );

    if (!contributionsResponse.ok) {
      console.error(
        "Contributions API failed:",
        contributionsResponse.status,
        await contributionsResponse.text()
      );
      throw new Error(
        `Failed to fetch GitHub contributions: ${contributionsResponse.status}`
      );
    }

    const contributionsData = await contributionsResponse.json();
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

    // Update monthly leaderboard
    await prisma.monthlyLeaderboard.upsert({
      where: {
        userId_monthYear: {
          userId: user.id,
          monthYear: currentMonthYear,
        },
      },
      update: {
        totalAura: monthlyAura,
        rank: 0, // Rank will be updated by a separate cron job
      },
      create: {
        userId: user.id,
        monthYear: currentMonthYear,
        totalAura: monthlyAura,
        rank: 0, // Rank will be updated by a separate cron job
      },
    });

    // Update global leaderboard
    await prisma.globalLeaderboard.upsert({
      where: { userId: user.id },
      update: {
        totalAura: totalAura,
        rank: 0, // Rank will be updated by a separate cron job
      },
      create: {
        userId: user.id,
        totalAura: totalAura,
        rank: 0, // Rank will be updated by a separate cron job
      },
    });

    // Update user's total aura
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalAura: totalAura,
        currentStreak: 0, // Reset streak for now, will be calculated properly later
      },
    });

    // Return the updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        githubUsername: true,
        displayName: true,
        avatarUrl: true,
        totalAura: true,
        currentStreak: true,
        monthlyLeaderboard: {
          where: { monthYear: currentMonthYear },
          select: {
            totalAura: true,
            rank: true,
          },
        },
        globalLeaderboard: {
          select: {
            totalAura: true,
            rank: true,
          },
        },
      },
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
    console.error("Error syncing user:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
