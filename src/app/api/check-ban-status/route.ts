import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    // Users can only check their own ban status
    if (targetUserId && targetUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check ban status for the current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
        banExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if temporary ban has expired
    if (user.isBanned && user.banExpiresAt && new Date() > user.banExpiresAt) {
      // Auto-unban expired user
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          banExpiresAt: null,
        },
      });

      return NextResponse.json({
        isBanned: false,
        autoUnbanned: true,
      });
    }

    return NextResponse.json({
      isBanned: user.isBanned,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
      banExpiresAt: user.banExpiresAt,
    });
  } catch (error) {
    console.error("Error checking ban status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
