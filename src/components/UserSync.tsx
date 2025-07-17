import { currentUser } from "@clerk/nextjs/server";
import { ensureUserInSupabase } from "@/lib/auth-sync";

export default async function UserSync() {
  try {
    const user = await currentUser();

    if (user) {
      // Ensure user exists in Supabase
      await ensureUserInSupabase();
    }
  } catch (error) {
    // Silent fail - don't break the app if user sync fails
    console.error("UserSync error:", error);
  }

  // This component doesn't render anything
  return null;
}
