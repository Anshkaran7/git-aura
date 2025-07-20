import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Extract username from the URL path
    const username = request.nextUrl.pathname.split("/").pop();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    console.log(`[Check User] Checking registration for username: ${username}`);

    // Check if user exists in our users table (meaning they're registered)
    // Use case-insensitive matching since GitHub usernames are case-insensitive
    const user = await prisma.user.findFirst({
      where: {
        githubUsername: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        githubUsername: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    if (user) {
      console.log(`✅ [Check User] User found: ${user.githubUsername}`);
      return NextResponse.json({
        isRegistered: true,
        user: {
          id: user.id,
          githubUsername: user.githubUsername,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
      });
    } else {
      console.log(`❌ [Check User] User not found: ${username}`);
      return NextResponse.json({
        isRegistered: false,
        user: null,
      });
    }
  } catch (error) {
    console.error("Error checking user registration:", error);
    return NextResponse.json(
      {
        error: "Failed to check user registration",
        isRegistered: false,
        user: null,
      },
      { status: 500 }
    );
  }
}
