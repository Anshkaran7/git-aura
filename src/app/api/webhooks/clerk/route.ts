import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This should be your service role key, not anon key
);

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
