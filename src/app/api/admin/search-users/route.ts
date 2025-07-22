import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Helper function to check if user is admin (same as ban-user route)
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;

    const adminEmails =
      process.env.ADMIN_EMAILS?.split(",").map((email) =>
        email.trim().toLowerCase()
      ) || [];
    const adminUsernames =
      process.env.ADMIN_GITHUB_USERNAMES?.split(",").map((username) =>
        username.trim().toLowerCase()
      ) || [];

    const primaryEmail = user.emailAddresses
      ?.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase();

    if (primaryEmail && adminEmails.includes(primaryEmail)) {
      return true;
    }

    const githubAccount = user.externalAccounts?.find(
      (account) => account.provider === "github"
    );

    if (
      githubAccount?.username &&
      adminUsernames.includes(githubAccount.username.toLowerCase())
    ) {
      return true;
    }

    if (user.username && adminUsernames.includes(user.username.toLowerCase())) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

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
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        users: [],
        message: "Please enter at least 2 characters",
      });
    }

    // Search users by GitHub username, display name, or email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            githubUsername: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            displayName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        displayName: true,
        githubUsername: true,
        email: true,
        avatarUrl: true,
        isBanned: true,
        createdAt: true,
      },
      take: 10, // Limit to 10 results
      orderBy: [
        {
          githubUsername: "asc",
        },
        {
          displayName: "asc",
        },
      ],
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        displayName: user.displayName,
        githubUsername: user.githubUsername,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        // Create a display label for the dropdown
        label: `${user.githubUsername || user.displayName || "Unknown"} ${
          user.displayName && user.githubUsername !== user.displayName
            ? `(${user.displayName})`
            : ""
        } - ${user.email}`,
        value: user.id,
      })),
      total: users.length,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
