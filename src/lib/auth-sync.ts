import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentMonthYear } from "./utils2";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function initializeLeaderboardRecords(userId: string) {
  try {
    // Initialize monthly leaderboard record
    const currentMonthYear = getCurrentMonthYear();
    const { error: monthlyError } = await supabaseAdmin
      .from("monthly_leaderboards")
      .upsert({
        user_id: userId,
        month_year: currentMonthYear,
        total_aura: 0,
        contributions_count: 0,
        rank: 999999, // High rank that will be updated by the ranking function
        created_at: new Date().toISOString(),
      });

    if (monthlyError) {
      console.error("Error initializing monthly leaderboard:", monthlyError);
      return false;
    }

    // Initialize global leaderboard record
    const { error: globalError } = await supabaseAdmin
      .from("global_leaderboard")
      .upsert({
        user_id: userId,
        total_aura: 0,
        rank: 999999, // High rank that will be updated by the ranking function
        last_updated: new Date().toISOString(),
      });

    if (globalError) {
      console.error("Error initializing global leaderboard:", globalError);
      return false;
    }

    // Trigger rank recalculation
    const { error: rankError } = await supabaseAdmin.rpc(
      "update_user_aura_and_ranks",
      {
        p_user_id: userId,
        p_month_year: currentMonthYear,
        p_monthly_aura: 0,
        p_contributions_count: 0,
      }
    );

    if (rankError) {
      console.error("Error updating ranks:", rankError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in initializeLeaderboardRecords:", error);
    return false;
  }
}

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

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    const isNewUser = !existingUser;

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

    // If this is a new user, initialize their leaderboard records
    if (isNewUser) {
      console.log("Initializing leaderboard records for new user:", user.id);
      const leaderboardInitialized = await initializeLeaderboardRecords(
        user.id
      );
      if (!leaderboardInitialized) {
        return {
          success: false,
          error: "Failed to initialize leaderboard records",
        };
      }
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
