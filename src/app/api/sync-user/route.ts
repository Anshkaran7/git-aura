import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's GitHub data from the request body
    const { githubData } = await request.json();

    if (!githubData) {
      return NextResponse.json(
        { error: "GitHub data is required" },
        { status: 400 }
      );
    }

    // First, ensure the user exists in our database
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        githubUsername: githubData.username,
        displayName: githubData.name || githubData.username,
        avatarUrl: githubData.avatar_url,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        email: `${githubData.username}@github.local`, // Required field
        githubUsername: githubData.username,
        displayName: githubData.name || githubData.username,
        avatarUrl: githubData.avatar_url,
        totalAura: 0,
        currentStreak: 0,
      },
    });

    // Calculate total contributions and aura
    const contributionsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/github/contributions/${githubData.username}`
    );

    if (!contributionsResponse.ok) {
      throw new Error("Failed to fetch GitHub contributions");
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
      },
    });

    // Return the updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        monthlyLeaderboard: {
          where: { monthYear: currentMonthYear },
        },
        globalLeaderboard: true,
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
      { error: "Failed to sync user data" },
      { status: 500 }
    );
  }
}
