import { currentUser } from "@clerk/nextjs/server";
import { ensureUserInSupabase } from "@/lib/auth-sync";

export default async function UserSync() {
  try {
    const user = await currentUser();

    if (!user) {
      console.log("No user found - skipping sync");
      return null;
    }

    // Ensure user exists in Supabase
    await ensureUserInSupabase();
  } catch (error) {
    // Log error with more context but don't break the app
    console.error("UserSync error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    });
  }

  // This component doesn't render anything
  return null;
}
