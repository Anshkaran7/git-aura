import { NextRequest, NextResponse } from "next/server";
import { authorizeCronOrAdmin, internalCronHeaders } from "@/lib/admin-auth";

// Manually triggers the monthly winners capture (same as the monthly cron).
// Requires CRON_SECRET bearer or the admin-panel secret: it overwrites the
// winners stored for the month.
export async function POST(request: NextRequest) {
  const authResult = authorizeCronOrAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json().catch(() => ({}));
    const response = await fetch(
      `${new URL(request.url).origin}/api/save-monthly-winners`,
      {
        method: "POST",
        headers: internalCronHeaders(),
        body: JSON.stringify(
          typeof body?.monthYear === "string" ? { monthYear: body.monthYear } : {}
        ),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
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
    return NextResponse.json({
      success: true,
      message: "Monthly winners capture completed",
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
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
      "POST (with CRON_SECRET bearer or admin-panel secret) to capture the current month's top 3 users as winners",
  });
}
