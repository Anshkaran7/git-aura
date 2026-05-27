import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function requireCronAuth(request: NextRequest) {
  return request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!requireCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const staleCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentCutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      neverRefreshed,
      staleUsers,
      recentlyRefreshed,
      failedUsers,
      recentFailures,
      nextUsers,
      latestRefresh,
      latestFailure,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          isBanned: false,
          githubUsername: { not: null },
        },
      }),
      prisma.user.count({
        where: {
          isBanned: false,
          githubUsername: { not: null },
          lastAuraRefreshAt: null,
        },
      }),
      prisma.user.count({
        where: {
          isBanned: false,
          githubUsername: { not: null },
          OR: [{ lastAuraRefreshAt: null }, { lastAuraRefreshAt: { lt: staleCutoff } }],
        },
      }),
      prisma.user.count({
        where: {
          isBanned: false,
          githubUsername: { not: null },
          lastAuraRefreshAt: { gte: recentCutoff },
          refreshError: null,
        },
      }),
      prisma.user.count({
        where: {
          isBanned: false,
          githubUsername: { not: null },
          refreshError: { not: null },
        },
      }),
      prisma.user.findMany({
        where: {
          isBanned: false,
          githubUsername: { not: null },
          refreshError: { not: null },
        },
        orderBy: [{ lastAuraRefreshAt: "desc" }],
        take: 10,
        select: {
          githubUsername: true,
          refreshAttempts: true,
          refreshError: true,
          lastAuraRefreshAt: true,
        },
      }),
      prisma.user.findMany({
        where: {
          isBanned: false,
          githubUsername: { not: null },
        },
        orderBy: [{ lastAuraRefreshAt: "asc" }],
        take: 10,
        select: {
          githubUsername: true,
          lastAuraRefreshAt: true,
          refreshAttempts: true,
        },
      }),
      prisma.user.findFirst({
        where: {
          isBanned: false,
          githubUsername: { not: null },
          lastAuraRefreshAt: { not: null },
        },
        orderBy: { lastAuraRefreshAt: "desc" },
        select: {
          githubUsername: true,
          lastAuraRefreshAt: true,
        },
      }),
      prisma.user.findFirst({
        where: {
          isBanned: false,
          githubUsername: { not: null },
          refreshError: { not: null },
        },
        orderBy: { lastAuraRefreshAt: "desc" },
        select: {
          githubUsername: true,
          refreshError: true,
          refreshAttempts: true,
          lastAuraRefreshAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      checkedAt: now.toISOString(),
      database: "supabase",
      cron: {
        refreshSchedule: "0 */2 * * *",
        chunkLimit: 40,
      },
      users: {
        total: totalUsers,
        refreshable: activeUsers,
        neverRefreshed,
        staleOver24h: staleUsers,
        refreshedInLast2h: recentlyRefreshed,
        withRefreshErrors: failedUsers,
      },
      latestRefresh,
      latestFailure,
      nextUsers,
      recentFailures,
    });
  } catch (error) {
    console.error("[Cron Status] Failed to load cron status:", error);
    return NextResponse.json(
      {
        error: "Failed to load cron status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
