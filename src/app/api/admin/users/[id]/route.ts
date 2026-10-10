import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Full detail for one user (admin "view" panel).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        githubUsername: true,
        githubId: true,
        displayName: true,
        avatarUrl: true,
        totalAura: true,
        currentStreak: true,
        longestStreak: true,
        lastContributionDate: true,
        createdAt: true,
        updatedAt: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
        bannedBy: true,
        banExpiresAt: true,
        lastAuraRefreshAt: true,
        refreshError: true,
        refreshAttempts: true,
        globalLeaderboard: {
          select: { rank: true, totalAura: true, lastUpdated: true, year: true },
        },
        monthlyLeaderboard: {
          orderBy: { monthYear: "desc" },
          take: 12,
          select: {
            monthYear: true,
            totalAura: true,
            contributionsCount: true,
            rank: true,
          },
        },
        monthlyWinners: {
          orderBy: { monthYear: "desc" },
          select: { monthYear: true, rank: true, totalAura: true },
        },
        userBadges: {
          orderBy: { earnedAt: "desc" },
          select: {
            id: true,
            earnedAt: true,
            monthYear: true,
            rank: true,
            badge: {
              select: { id: true, name: true, rarity: true, icon: true, color: true },
            },
          },
        },
        _count: { select: { auraCalculations: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[admin/users/:id]", error);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}
