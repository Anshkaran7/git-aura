import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      "🕰️ [CRON] Monthly Winners Capture - Starting at",
      new Date().toISOString()
    );

    // Call the save monthly winners API
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/save-monthly-winners`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [CRON] Failed to save monthly winners:", errorText);
      return NextResponse.json(
        { error: "Failed to save monthly winners", details: errorText },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log("✅ [CRON] Monthly Winners Capture completed:", result.message);

    return NextResponse.json({
      success: true,
      message: "Monthly winners cron job completed successfully",
      timestamp: new Date().toISOString(),
      result: result,
    });
  } catch (error) {
    console.error("❌ [CRON] Error in monthly winners cron job:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Monthly Winners Cron Job",
    description:
      "This endpoint is called automatically at month end (30th/31st) at 11:50 PM",
    schedule: "50 23 L * *", // Last day of month at 11:50 PM
    action: "Captures top 3 users from monthly leaderboard and awards badges",
    usage:
      "Should be configured in your cron service (Vercel Cron, GitHub Actions, etc.)",
  });
}
