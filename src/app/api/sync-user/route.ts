import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncCurrentUserToSupabase } from "@/lib/auth-sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// This endpoint performs a full server-side sync for the authenticated user.
// It no longer requires a request body. The client can just POST to /api/sync-user.
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncCurrentUserToSupabase();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to sync user data: ${message}` },
      { status: 500 }
    );
  }
}
