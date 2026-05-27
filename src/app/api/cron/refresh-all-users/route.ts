import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export const runtime = "nodejs";
export const maxDuration = 300;

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 75;

function clampLimit(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

async function refreshAllUsers(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by Vercel cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      batchSize = 5,
      delay = 1000,
      limit,
      skipRankUpdate = false,
    } = await request
      .json()
      .catch(() => ({}));
    const maxUsers = clampLimit(limit);
    const safeBatchSize = Math.min(clampLimit(batchSize), maxUsers);

    // Get the next chunk of active users. Nulls are handled first so restored
    // Supabase data gets refreshed before users enter the normal rotation.
    const users = await prisma.user.findMany({
      where: {
        isBanned: false,
        githubUsername: { not: null },
      },
      select: {
        id: true,
        githubUsername: true,
        displayName: true,
        lastContributionDate: true,
        lastAuraRefreshAt: true,
      },
      orderBy: {
        lastAuraRefreshAt: "asc",
      },
      take: maxUsers,
    });

    console.log(
      `[Cron] Starting refresh for ${users.length} users (limit ${maxUsers})`
    );

    const results = {
      total: users.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process users in batches
    for (let i = 0; i < users.length; i += safeBatchSize) {
      const batch = users.slice(i, i + safeBatchSize);

      console.log(
        `[Cron] Processing batch ${Math.floor(i / safeBatchSize) + 1}/${Math.ceil(
          users.length / safeBatchSize
        )}`
      );

      // Process batch concurrently
      const batchPromises = batch.map(async (user) => {
        try {
          // Fetch fresh GitHub contributions
          const contributionsResult = await fetchGitHubContributions(
            user.githubUsername!
          );

          if (!contributionsResult.success || !contributionsResult.data) {
            throw new Error(
              `Failed to fetch contributions: ${contributionsResult.error}`
            );
          }

          // Recalculate and store aura
          const auraResult = await calculateAndStoreUserAura(
            user.id,
            user.githubUsername!,
            contributionsResult.data.contributionDays
          );

          if (!auraResult.success) {
            throw new Error(`Failed to calculate aura: ${auraResult.error}`);
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastAuraRefreshAt: new Date(),
              refreshError: null,
              refreshAttempts: 0,
            },
          });

          return { success: true, username: user.githubUsername };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastAuraRefreshAt: new Date(),
              refreshError: errorMessage.slice(0, 1000),
              refreshAttempts: { increment: 1 },
            },
          });

          return {
            success: false,
            username: user.githubUsername,
            error: errorMessage,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      // Update results
      batchResults.forEach((result) => {
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`${result.username}: ${result.error}`);
        }
      });

      // Delay between batches to respect rate limits
      if (i + safeBatchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (!skipRankUpdate) {
      // Update ranks after all refreshes when this endpoint is called directly.
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";
      const rankUpdateResponse = await fetch(`${baseUrl}/api/cron/update-ranks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      });

      if (!rankUpdateResponse.ok) {
        console.error("[Cron] Failed to update ranks after refresh");
      }
    }

    console.log(
      `[Cron] Refresh completed: ${results.successful} successful, ${results.failed} failed`
    );

    return NextResponse.json({
      success: true,
      results,
      message: `Refreshed ${results.successful}/${results.total} users successfully`,
    });
  } catch (error) {
    console.error("[Cron] Error in refresh-all-users:", error);
    return NextResponse.json(
      { error: "Failed to refresh user data" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return refreshAllUsers(request);
}

export async function POST(request: NextRequest) {
  return refreshAllUsers(request);
}
