import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

    // Get current month-year for monthly leaderboard
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Create or update user with a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or update user
      const user = await tx.user.upsert({
        where: { githubUsername },
        create: {
          email: `${githubUsername}@github.local`, // Temporary email
          githubUsername,
          displayName: displayName || githubUsername,
          avatarUrl: avatarUrl || `https://github.com/${githubUsername}.png`,
          totalAura: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastContributionDate: new Date(),
        },
        update: {
          displayName: displayName || githubUsername,
          avatarUrl: avatarUrl || `https://github.com/${githubUsername}.png`,
          updatedAt: new Date(),
        },
      });

      // Initialize monthly leaderboard entry if it doesn't exist
      await tx.monthlyLeaderboard.upsert({
        where: {
          userId_monthYear: {
            userId: user.id,
            monthYear: currentMonthYear,
          },
        },
        create: {
          userId: user.id,
          monthYear: currentMonthYear,
          totalAura: 0,
          contributionsCount: 0,
          rank: 0,
        },
        update: {}, // No updates needed if entry exists
      });

      // Initialize global leaderboard entry if it doesn't exist
      await tx.globalLeaderboard.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalAura: 0,
          rank: 0,
          yearlyAura: 0,
          year: new Date().getFullYear().toString(),
        },
        update: {}, // No updates needed if entry exists
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        githubUsername: result.githubUsername,
        displayName: result.displayName,
        avatarUrl: result.avatarUrl,
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
