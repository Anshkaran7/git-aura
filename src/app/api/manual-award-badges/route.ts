import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Simple authentication check - only allow if API key is provided
    const authHeader = req.headers.get("authorization");
    const expectedKey = process.env.BADGE_ADMIN_KEY || "admin-key-123";

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    console.log(
      "🔧 [Manual Badge Award] Manually triggering badge awarding process..."
    );

    // Call the badge awarding API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/award-badges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log(
        "✅ [Manual Badge Award] Badge awarding completed successfully"
      );
      return NextResponse.json({
        success: true,
        message: "Manual badge awarding completed successfully",
        result,
      });
    } else {
      const errorText = await response.text();
      console.error(
        "❌ [Manual Badge Award] Failed to award badges:",
        errorText
      );
      return NextResponse.json(
        {
          error: "Failed to award badges",
          details: errorText,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      "❌ [Manual Badge Award] Error in manual badge awarding:",
      error
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show instructions
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Manual Badge Awarding API",
    instructions: [
      "Use POST method with Authorization header",
      "Header format: Authorization: Bearer YOUR_BADGE_ADMIN_KEY",
      "Set BADGE_ADMIN_KEY environment variable for security",
      "This will trigger badge awarding for current month's top 3 users",
    ],
    example: {
      method: "POST",
      headers: {
        Authorization: "Bearer YOUR_BADGE_ADMIN_KEY",
        "Content-Type": "application/json",
      },
    },
  });
}
