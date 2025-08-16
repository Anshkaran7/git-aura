import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by Vercel cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Daily Tasks] Starting daily maintenance tasks...");

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://git-aura.karandev.in";
    const cronSecret = process.env.CRON_SECRET;

    // Step 1: Refresh all users
    console.log("[Daily Tasks] Step 1: Refreshing all users...");
    const refreshResponse = await fetch(
      `${baseUrl}/api/cron/refresh-all-users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cronSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchSize: 10,
          delay: 2000,
        }),
      }
    );

    if (!refreshResponse.ok) {
      const refreshError = await refreshResponse.text();
      console.error("[Daily Tasks] Failed to refresh users:", refreshError);
      return NextResponse.json(
        {
          error: "Failed to refresh users",
          details: refreshError,
        },
        { status: 500 }
      );
    }

    const refreshResult = await refreshResponse.json();
    console.log("[Daily Tasks] User refresh completed:", refreshResult.message);

    // Step 2: Wait a bit, then update ranks
    console.log(
      "[Daily Tasks] Step 2: Waiting 30 seconds before updating ranks..."
    );
    await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds

    console.log("[Daily Tasks] Step 2: Updating ranks...");
    const ranksResponse = await fetch(`${baseUrl}/api/cron/update-ranks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    if (!ranksResponse.ok) {
      const ranksError = await ranksResponse.text();
      console.error("[Daily Tasks] Failed to update ranks:", ranksError);
      // Don't fail the whole job if ranks fail
    }

    const ranksResult = ranksResponse.ok
      ? await ranksResponse.json()
      : { error: "Failed to update ranks" };
    console.log("[Daily Tasks] Ranks update completed");

    return NextResponse.json({
      success: true,
      message: "Daily tasks completed successfully",
      refreshResult: refreshResult,
      ranksResult: ranksResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Daily Tasks] Error in daily tasks:", error);
    return NextResponse.json(
      {
        error: "Failed to complete daily tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
