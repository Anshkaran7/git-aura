import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function syncCurrentUserToSupabase() {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "No authenticated user" };
    }

    // Get primary email
    const primaryEmail = user.emailAddresses?.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    // Construct display name
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      primaryEmail?.split("@")[0] ||
      "Anonymous User";

    // Upsert user in Supabase
    const { error } = await supabaseAdmin.from("users").upsert(
      {
        id: user.id,
        email: primaryEmail || `${user.id}@clerk.local`,
        display_name: displayName,
        avatar_url: user.imageUrl,
        created_at: new Date(user.createdAt).toISOString(),
        updated_at: new Date(user.updatedAt).toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (error) {
      console.error("Error syncing user to Supabase:", error);
      return { success: false, error: "Failed to sync user" };
    }

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error in syncCurrentUserToSupabase:", error);
    return { success: false, error: "Internal error" };
  }
}

export async function ensureUserInSupabase() {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error checking user existence:", fetchError);
      return null;
    }

    // If user doesn't exist, sync them
    if (!existingUser) {
      const syncResult = await syncCurrentUserToSupabase();
      if (!syncResult.success) {
        return null;
      }
    }

    return user.id;
  } catch (error) {
    console.error("Error in ensureUserInSupabase:", error);
    return null;
  }
}
