import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export const runtime = "nodejs";
export const maxDuration = 60;

// Re-fetch one user's GitHub contributions and recalculate their aura.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, githubUsername: true, totalAura: true, isBanned: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!user.githubUsername) {
    return NextResponse.json(
      { error: "User has no GitHub username" },
      { status: 400 }
    );
  }

  try {
    const contributions = await fetchGitHubContributions(user.githubUsername);
    if (!contributions.success || !contributions.data) {
      throw new Error(contributions.error || "Failed to fetch contributions");
    }
    const aura = await calculateAndStoreUserAura(
      user.id,
      user.githubUsername,
      contributions.data.contributionDays
    );
    if (!aura.success) {
      throw new Error(aura.error || "Failed to calculate aura");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastAuraRefreshAt: new Date(), refreshError: null, refreshAttempts: 0 },
    });

    return NextResponse.json({
      success: true,
      username: user.githubUsername,
      before: { totalAura: user.totalAura },
      after: {
        totalAura: aura.totalAura,
        currentStreak: aura.currentStreak,
        longestStreak: aura.longestStreak,
      },
      totalContributions: contributions.data.totalContributions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.user
      .update({
        where: { id: user.id },
        data: {
          lastAuraRefreshAt: new Date(),
          refreshError: message.slice(0, 1000),
          refreshAttempts: { increment: 1 },
        },
      })
      .catch(() => undefined);
    return NextResponse.json(
      { error: "Refresh failed", details: message },
      { status: 502 }
    );
  }
}
