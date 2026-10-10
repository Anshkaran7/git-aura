import { NextRequest, NextResponse } from "next/server";
import {
  authorizeCronOrAdmin,
  internalCronHeaders,
  safeEqual,
} from "@/lib/admin-auth";

function isAuthorized(req: NextRequest) {
  if (authorizeCronOrAdmin(req).ok) return true;
  // Optional legacy key — only honoured when explicitly configured.
  const legacyKey = process.env.BADGE_ADMIN_KEY;
  const header = req.headers.get("authorization");
  return Boolean(legacyKey && header && safeEqual(header, `Bearer ${legacyKey}`));
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${new URL(req.url).origin}/api/award-badges`, {
      method: "POST",
      headers: internalCronHeaders(),
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: "Manual badge awarding completed successfully",
        result,
      });
    }

    const errorText = await response.text();
    return NextResponse.json(
      { error: "Failed to award badges", details: errorText },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Manual Badge Awarding API",
    instructions: [
      "POST with Authorization: Bearer <CRON_SECRET> (or the admin-panel secret header)",
      "Awards badges to the current month's top 3 users",
    ],
  });
}
