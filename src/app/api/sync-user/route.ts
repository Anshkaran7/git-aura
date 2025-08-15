// src/app/api/sync-user/route.ts

import { currentUser } from "@clerk/nextjs/server";
import { ensureUserInSupabase } from "@/lib/auth-sync";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // This is your original server-side logic
    const user = await currentUser();

    if (!user) {
      // Use NextResponse for API routes
      return new NextResponse("No user found, skipping sync.", { status: 401 });
    }

    // Ensure user exists in Supabase
    await ensureUserInSupabase();

    return NextResponse.json({ success: true, message: "User synced successfully." });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("UserSync API error:", { message: errorMessage, error });
    
    return new NextResponse(
      JSON.stringify({ success: false, error: "Failed to sync user." }),
      { status: 500 }
    );
  }
}