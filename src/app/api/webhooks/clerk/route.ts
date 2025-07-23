import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { fetchGitHubProfile, extractGitHubUsername } from "@/lib/github-fetch";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { calculateAndStoreUserAura } from "@/lib/aura-calculations";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id, type: eventType } = evt;

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
        external_accounts,
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

      // Extract GitHub username from external accounts
      const githubUsername = extractGitHubUsername({
        externalAccounts: external_accounts,
        username,
        primaryEmailAddress: { emailAddress: primaryEmail },
      });

      // Fetch GitHub profile data if GitHub username is available
      let githubData = null;
      let githubId = null;
      let actualEmail = primaryEmail;

      if (githubUsername) {
        const githubResult = await fetchGitHubProfile(githubUsername);

        if (githubResult.success && githubResult.data) {
          githubData = githubResult.data;
          githubId = githubResult.data.id.toString();

          // Use GitHub email if available and no primary email is set
          if (githubResult.data.email && !primaryEmail) {
            actualEmail = githubResult.data.email;
          }
        } else {
        }
      }

      // Check if user already exists using Prisma
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      const isNewUser = !existingUser;

      // Upsert user using Prisma
      try {
        const user = await prisma.user.upsert({
          where: { id: userId },
          create: {
            id: userId,
            email: actualEmail || `${userId}@clerk.local`,
            githubUsername: githubUsername,
            githubId: githubId,
            displayName: displayName,
            avatarUrl: image_url || githubData?.avatar_url,
            githubData: githubData ? (githubData as any) : undefined,
            createdAt: new Date(created_at),
            updatedAt: new Date(updated_at || created_at),
          },
          update: {
            email: actualEmail || `${userId}@clerk.local`,
            githubUsername: githubUsername,
            githubId: githubId,
            displayName: displayName,
            avatarUrl: image_url || githubData?.avatar_url,
            githubData: githubData ? (githubData as any) : undefined,
            updatedAt: new Date(updated_at || created_at),
          },
        });

        // If this is a new user with GitHub username, calculate and store their aura
        if (isNewUser && githubUsername) {
          // Fetch GitHub contributions
          const contributionsResult = await fetchGitHubContributions(
            githubUsername
          );

          if (contributionsResult.success && contributionsResult.data) {
            // Calculate and store aura
            const auraResult = await calculateAndStoreUserAura(
              userId,
              githubUsername,
              contributionsResult.data.contributionDays
            );

            if (auraResult.success) {
            } else {
            }
          } else {
          }
        }
      } catch (prismaError) {
        console.error("Error syncing user with Prisma:", prismaError);
        return new Response("Error syncing user", { status: 500 });
      }
    }

    if (eventType === "user.deleted") {
      const { id: userId } = evt.data;

      try {
        // Delete user using Prisma (with cascade delete configured in schema)
        await prisma.user.delete({
          where: { id: userId },
        });
      } catch (prismaError) {
        console.error("Error deleting user with Prisma:", prismaError);
        return new Response("Error deleting user", { status: 500 });
      }
    }

    return new Response("", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Error processing webhook", { status: 500 });
  }
}
