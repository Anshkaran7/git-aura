import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { fetchGitHubProfile, extractGitHubUsername } from "./github-fetch";
import { fetchGitHubContributions } from "./github-contributions";
import { calculateAndStoreUserAura } from "./aura-calculations";
import { checkUserBanStatus } from "./ban-middleware";

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

    // Extract GitHub username from external accounts
    const githubUsername = extractGitHubUsername(user);

    // Fetch GitHub profile data if GitHub username is available
    let githubData = null;
    let githubId = null;
    let actualEmail = primaryEmail;

    if (githubUsername) {
      console.log(
        `[Auth Sync] Fetching GitHub profile for username: ${githubUsername}`
      );
      const githubResult = await fetchGitHubProfile(githubUsername);

      if (githubResult.success && githubResult.data) {
        githubData = githubResult.data;
        githubId = githubResult.data.id.toString();

        // Use GitHub email if available and no primary email is set
        if (githubResult.data.email && !primaryEmail) {
          actualEmail = githubResult.data.email;
        }

        console.log(
          `✅ [Auth Sync] Successfully fetched GitHub profile for ${githubUsername}`
        );
      } else {
        console.warn(
          `⚠️ [Auth Sync] Failed to fetch GitHub profile for ${githubUsername}:`,
          githubResult.error
        );
      }
    }

    // Check if user already exists using Prisma
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    const isNewUser = !existingUser;

    // Upsert user using Prisma
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: actualEmail || `${user.id}@clerk.local`,
          githubUsername: githubUsername,
          githubId: githubId,
          displayName: displayName,
          avatarUrl: user.imageUrl || githubData?.avatar_url,
          githubData: githubData ? (githubData as any) : undefined,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
        update: {
          email: actualEmail || `${user.id}@clerk.local`,
          githubUsername: githubUsername,
          githubId: githubId,
          displayName: displayName,
          avatarUrl: user.imageUrl || githubData?.avatar_url,
          githubData: githubData ? (githubData as any) : undefined,
          updatedAt: new Date(user.updatedAt),
        },
      });

      console.log(
        `✅ [Auth Sync] Successfully synced user to database: ${user.id}`
      );

      // If this is a new user with GitHub username, calculate and store their aura
      if (isNewUser && githubUsername) {
        console.log(
          `[Auth Sync] Starting aura calculation for new user: ${githubUsername}`
        );

        // Fetch GitHub contributions
        const contributionsResult = await fetchGitHubContributions(
          githubUsername
        );

        if (contributionsResult.success && contributionsResult.data) {
          // Calculate and store aura
          const auraResult = await calculateAndStoreUserAura(
            user.id,
            githubUsername,
            contributionsResult.data.contributionDays
          );

          if (auraResult.success) {
            console.log(
              `✅ [Auth Sync] Successfully calculated aura for ${githubUsername}: ${auraResult.totalAura} total aura`
            );
          } else {
            console.error(
              `❌ [Auth Sync] Failed to calculate aura for ${githubUsername}:`,
              auraResult.error
            );
          }
        } else {
          console.warn(
            `⚠️ [Auth Sync] Failed to fetch contributions for ${githubUsername}:`,
            contributionsResult.error
          );
        }
      }
    } catch (prismaError) {
      console.error("Error syncing user with Prisma:", prismaError);
      return { success: false, error: "Failed to sync user" };
    }

    // Check if user is banned
    const banStatus = await checkUserBanStatus(user.id);
    if (banStatus.isBanned) {
      console.log(
        `🚫 [Auth Sync] User ${user.id} is banned: ${banStatus.reason}`
      );
      return {
        success: false,
        error: "User is banned",
        banInfo: banStatus,
      };
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

    // Check if user exists using Prisma
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

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
