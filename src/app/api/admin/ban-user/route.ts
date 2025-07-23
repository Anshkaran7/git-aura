import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { removeBannedUserFromLeaderboards } from "@/lib/ban-middleware";

// Helper function to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;

    // Get admin emails and usernames from environment
    const adminEmails =
      process.env.ADMIN_EMAILS?.split(",").map((email) =>
        email.trim().toLowerCase()
      ) || [];
    const adminUsernames =
      process.env.ADMIN_GITHUB_USERNAMES?.split(",").map((username) =>
        username.trim().toLowerCase()
      ) || [];

    // Check primary email
    const primaryEmail = user.emailAddresses
      ?.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase();

    if (primaryEmail && adminEmails.includes(primaryEmail)) {
      return true;
    }

    // Check GitHub username from external accounts
    const githubAccount = user.externalAccounts?.find(
      (account) => account.provider === "github"
    );

    if (
      githubAccount?.username &&
      adminUsernames.includes(githubAccount.username.toLowerCase())
    ) {
      return true;
    }

    // Check Clerk username as fallback
    if (user.username && adminUsernames.includes(user.username.toLowerCase())) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin
    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId, action, reason, expiresIn } = body;

    if (!targetUserId || !action || !["ban", "unban"].includes(action)) {
      return NextResponse.json(
        { error: "Missing required fields: targetUserId, action (ban/unban)" },
        { status: 400 }
      );
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        displayName: true,
        githubUsername: true,
        isBanned: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    if (action === "ban") {
      if (targetUser.isBanned) {
        return NextResponse.json(
          { error: "User is already banned" },
          { status: 400 }
        );
      }

      let banExpiresAt = null;
      if (expiresIn) {
        // expiresIn should be in hours
        banExpiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isBanned: true,
          banReason: reason || "No reason provided",
          bannedAt: new Date(),
          bannedBy: userId,
          banExpiresAt: banExpiresAt,
        },
      });

      // Remove banned user from leaderboards
      await removeBannedUserFromLeaderboards(targetUserId);

      return NextResponse.json({
        success: true,
        message: `User ${
          targetUser.githubUsername || targetUser.displayName
        } has been banned`,
        action: "banned",
        user: {
          id: targetUser.id,
          displayName: targetUser.displayName,
          githubUsername: targetUser.githubUsername,
        },
        reason: reason || "No reason provided",
        expiresAt: banExpiresAt,
      });
    } else if (action === "unban") {
      if (!targetUser.isBanned) {
        return NextResponse.json(
          { error: "User is not banned" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          banExpiresAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `User ${
          targetUser.githubUsername || targetUser.displayName
        } has been unbanned`,
        action: "unbanned",
        user: {
          id: targetUser.id,
          displayName: targetUser.displayName,
          githubUsername: targetUser.githubUsername,
        },
      });
    }
  } catch (error) {
    console.error("Error in ban/unban operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check ban status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin
    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (!targetUserId && !username) {
      return NextResponse.json(
        { error: "Either userId or username is required" },
        { status: 400 }
      );
    }

    let user;
    if (targetUserId) {
      user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          displayName: true,
          githubUsername: true,
          email: true,
          isBanned: true,
          banReason: true,
          bannedAt: true,
          bannedBy: true,
          banExpiresAt: true,
          createdAt: true,
        },
      });
    } else if (username) {
      user = await prisma.user.findFirst({
        where: { githubUsername: username },
        select: {
          id: true,
          displayName: true,
          githubUsername: true,
          email: true,
          isBanned: true,
          banReason: true,
          bannedAt: true,
          bannedBy: true,
          banExpiresAt: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if temporary ban has expired
    if (user.isBanned && user.banExpiresAt && new Date() > user.banExpiresAt) {
      // Auto-unban expired user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          banExpiresAt: null,
        },
      });

      return NextResponse.json({
        ...user,
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
        banExpiresAt: null,
        autoUnbanned: true,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error checking ban status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
