import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";
import { getCurrentMonthYear } from "@/lib/utils2";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This should be your service role key, not anon key
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

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const {
        id: userId,
        email_addresses,
        first_name,
        last_name,
        username,
        image_url,
        created_at,
        updated_at,
      } = evt.data;

      // Get primary email
      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === evt.data.primary_email_address_id
      )?.email_address;

      // Construct display name
      const displayName =
        [first_name, last_name].filter(Boolean).join(" ") ||
        username ||
        primaryEmail?.split("@")[0] ||
        "Anonymous User";

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();

      const isNewUser = !existingUser;

      // Upsert user in Supabase
      const { error } = await supabaseAdmin.from("users").upsert(
        {
          id: userId,
          email: primaryEmail || `${userId}@clerk.local`,
          display_name: displayName,
          avatar_url: image_url,
          created_at: new Date(created_at).toISOString(),
          updated_at: new Date(updated_at || created_at).toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (error) {
        console.error("Error syncing user to Supabase:", error);
        return new Response("Error syncing user", { status: 500 });
      }

      // If this is a new user, initialize their leaderboard records
      if (isNewUser) {
        console.log("Initializing leaderboard records for new user:", userId);
        const leaderboardInitialized = await initializeLeaderboardRecords(
          userId
        );
        if (!leaderboardInitialized) {
          return new Response("Error initializing leaderboard records", {
            status: 500,
          });
        }
      }

      console.log(`Successfully synced user ${userId} to Supabase`);
    }

    if (eventType === "user.deleted") {
      const { id: userId } = evt.data;

      // Delete user from Supabase (cascade will handle related records)
      const { error } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Error deleting user from Supabase:", error);
        return new Response("Error deleting user", { status: 500 });
      }

      console.log(`Successfully deleted user ${userId} from Supabase`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
