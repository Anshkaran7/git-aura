import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by Vercel cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { batchSize = 10, delay = 1000 } = await request
      .json()
      .catch(() => ({}));

    // Get all active users
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
      },
      orderBy: {
        lastContributionDate: "asc", // Refresh oldest data first
      },
    });

    console.log(`[Cron] Starting refresh for ${users.length} users`);

    const results = {
      total: users.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      console.log(
        `[Cron] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          users.length / batchSize
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

          return { success: true, username: user.githubUsername };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
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
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Update ranks after all refreshes
    const rankUpdateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/update-ranks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );

    if (!rankUpdateResponse.ok) {
      console.error("[Cron] Failed to update ranks after refresh");
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
