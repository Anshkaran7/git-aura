import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };
const MONTH_YEAR = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Award a badge to a user. Body: { userId? | githubUsername?, monthYear?, rank? } */
export async function POST(request: NextRequest, { params }: Params) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const githubUsername =
    typeof body?.githubUsername === "string" ? body.githubUsername.trim() : "";
  if (!userId && !githubUsername) {
    return NextResponse.json(
      { error: "userId or githubUsername is required" },
      { status: 400 }
    );
  }
  const monthYear = body?.monthYear ? String(body.monthYear) : null;
  if (monthYear && !MONTH_YEAR.test(monthYear)) {
    return NextResponse.json({ error: "monthYear must be YYYY-MM" }, { status: 400 });
  }
  const rank = body?.rank === undefined || body?.rank === null || body?.rank === "" ? null : Number(body.rank);
  if (rank !== null && (!Number.isInteger(rank) || rank < 1)) {
    return NextResponse.json({ error: "rank must be a positive integer" }, { status: 400 });
  }

  const [badge, user] = await Promise.all([
    prisma.badge.findUnique({ where: { id }, select: { id: true, name: true, isActive: true } }),
    prisma.user.findFirst({
      where: userId
        ? { id: userId }
        : { githubUsername: { equals: githubUsername, mode: "insensitive" } },
      select: { id: true, githubUsername: true },
    }),
  ]);
  if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Postgres treats NULLs as distinct in unique indexes, so guard manually.
  const existing = await prisma.userBadge.findFirst({
    where: { userId: user.id, badgeId: badge.id, monthYear },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "User already has this badge" + (monthYear ? ` for ${monthYear}` : "") },
      { status: 409 }
    );
  }

  try {
    const userBadge = await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: badge.id,
        monthYear,
        rank,
        metadata: { awardedBy: authResult.actor, manual: true },
      },
    });
    return NextResponse.json({
      success: true,
      message: `Awarded ${badge.name} to ${user.githubUsername ?? user.id}`,
      userBadge,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "User already has this badge" }, { status: 409 });
    }
    console.error("[admin/badges award]", error);
    return NextResponse.json({ error: "Failed to award badge" }, { status: 500 });
  }
}

/** Revoke an award. Query: userBadgeId */
export async function DELETE(request: NextRequest, { params }: Params) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;
  const { id } = await params;
  const userBadgeId = new URL(request.url).searchParams.get("userBadgeId");
  if (!userBadgeId) {
    return NextResponse.json({ error: "userBadgeId is required" }, { status: 400 });
  }
  const result = await prisma.userBadge.deleteMany({
    where: { id: userBadgeId, badgeId: id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Award not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
