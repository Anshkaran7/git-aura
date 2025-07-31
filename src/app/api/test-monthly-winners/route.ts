import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST] Manually triggering monthly winners capture...");

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
      console.error(
        "❌ [TEST] Failed to trigger monthly winners capture:",
        errorText
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to trigger monthly winners capture",
          details: errorText,
        },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log("✅ [TEST] Monthly winners capture completed:", result.message);

    return NextResponse.json({
      success: true,
      message: "Test monthly winners capture completed successfully",
      timestamp: new Date().toISOString(),
      result: result,
    });
  } catch (error) {
    console.error("❌ [TEST] Error in test monthly winners capture:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test Monthly Winners Capture",
    description:
      "POST to this endpoint to manually test the monthly winners capture system",
    note: "This will capture the current month's top 3 users as winners",
    usage: {
      curl: "curl -X POST http://localhost:3000/api/test-monthly-winners",
      requirements: [
        "CRON_SECRET environment variable",
        "Monthly leaderboard data",
      ],
    },
    endpoints: {
      save: "/api/save-monthly-winners",
      cron: "/api/cron/save-monthly-winners",
      fetch: "/api/monthly-winners",
      test: "/api/test-monthly-winners (this endpoint)",
    },
  });
}
