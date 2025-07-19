import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by the cron job
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Update monthly ranks
    const monthlyLeaderboard = await prisma.monthlyLeaderboard.findMany({
      where: {
        monthYear: currentMonthYear,
      },
      orderBy: {
        totalAura: "desc",
      },
    });

    // Update ranks in batches to avoid timeout
    for (let i = 0; i < monthlyLeaderboard.length; i++) {
      const entry = monthlyLeaderboard[i];
      await prisma.monthlyLeaderboard.update({
        where: {
          userId_monthYear: {
            userId: entry.userId,
            monthYear: currentMonthYear,
          },
        },
        data: {
          rank: i + 1,
        },
      });
    }

    // Update global ranks
    const globalLeaderboard = await prisma.globalLeaderboard.findMany({
      orderBy: {
        totalAura: "desc",
      },
    });

    // Update ranks in batches
    for (let i = 0; i < globalLeaderboard.length; i++) {
      const entry = globalLeaderboard[i];
      await prisma.globalLeaderboard.update({
        where: {
          userId: entry.userId,
        },
        data: {
          rank: i + 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Ranks updated successfully",
      monthlyUpdates: monthlyLeaderboard.length,
      globalUpdates: globalLeaderboard.length,
    });
  } catch (error) {
    console.error("Error updating ranks:", error);
    return NextResponse.json(
      { error: "Failed to update ranks" },
      { status: 500 }
    );
  }
}
