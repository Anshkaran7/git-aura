import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";


export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeAdmin(request);
    if (!authResult.ok) return authResult.response;

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
