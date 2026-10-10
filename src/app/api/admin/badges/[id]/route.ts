import { NextRequest, NextResponse } from "next/server";
import { BadgeRarity, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

/** Badge detail with holders. */
export async function GET(request: NextRequest, { params }: Params) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const badge = await prisma.badge.findUnique({
    where: { id },
    include: {
      userBadges: {
        orderBy: { earnedAt: "desc" },
        take: 100,
        select: {
          id: true,
          earnedAt: true,
          monthYear: true,
          rank: true,
          user: {
            select: { id: true, githubUsername: true, displayName: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { userBadges: true } },
    },
  });
  if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  return NextResponse.json({ badge });
}

/** Update a badge. Body: any of { name, description, icon, color, rarity, isMonthly, isActive } */
export async function PATCH(request: NextRequest, { params }: Params) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON body required" }, { status: 400 });
  }

  const data: Prisma.BadgeUpdateInput = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name || name.length > 100) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    data.name = name;
  }
  if (body.description !== undefined) data.description = body.description ? String(body.description).slice(0, 500) : null;
  if (body.icon !== undefined) data.icon = body.icon ? String(body.icon).slice(0, 500) : null;
  if (body.color !== undefined) {
    const color = body.color ? String(body.color).trim() : "";
    if (color && !/^#[0-9a-fA-F]{3,8}$/.test(color)) {
      return NextResponse.json({ error: "color must be a hex value" }, { status: 400 });
    }
    data.color = color || null;
  }
  if (body.rarity !== undefined) {
    if (!Object.values(BadgeRarity).includes(body.rarity)) {
      return NextResponse.json({ error: "Invalid rarity" }, { status: 400 });
    }
    data.rarity = body.rarity;
  }
  if (body.isMonthly !== undefined) data.isMonthly = Boolean(body.isMonthly);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const badge = await prisma.badge.update({ where: { id }, data });
    return NextResponse.json({ success: true, badge });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Badge not found" }, { status: 404 });
      if (error.code === "P2002") return NextResponse.json({ error: "A badge with this name already exists" }, { status: 409 });
    }
    console.error("[admin/badges PATCH]", error);
    return NextResponse.json({ error: "Failed to update badge" }, { status: 500 });
  }
}

/** Delete a badge — only allowed when nobody holds it (deactivate instead otherwise). */
export async function DELETE(request: NextRequest, { params }: Params) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const badge = await prisma.badge.findUnique({
    where: { id },
    select: { id: true, _count: { select: { userBadges: true } } },
  });
  if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  if (badge._count.userBadges > 0) {
    return NextResponse.json(
      { error: "Badge has been awarded; deactivate it instead of deleting" },
      { status: 409 }
    );
  }
  await prisma.badge.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
