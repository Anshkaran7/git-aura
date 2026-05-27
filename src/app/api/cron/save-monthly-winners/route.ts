import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

async function saveMonthlyWinners(request: NextRequest) {
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
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/save-monthly-winners`,
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

export async function GET(request: NextRequest) {
  return saveMonthlyWinners(request);
}

export async function POST(request: NextRequest) {
  return saveMonthlyWinners(request);
}
