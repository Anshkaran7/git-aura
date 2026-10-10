import { NextRequest, NextResponse } from "next/server";
import { BadgeRarity, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const RARITIES = Object.values(BadgeRarity);

/** List all badges with award counts. Query: q, monthly (true|false), active (true|false) */
export async function GET(request: NextRequest) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const monthly = searchParams.get("monthly");
    const active = searchParams.get("active");
    const where: Prisma.BadgeWhereInput = {};
    if (q) where.name = { contains: q, mode: "insensitive" };
    if (monthly === "true" || monthly === "false") where.isMonthly = monthly === "true";
    if (active === "true" || active === "false") where.isActive = active === "true";

    const badges = await prisma.badge.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: { _count: { select: { userBadges: true } } },
    });

    const recentAwards = await prisma.userBadge.findMany({
      orderBy: { earnedAt: "desc" },
      take: 15,
      select: {
        id: true,
        earnedAt: true,
        monthYear: true,
        rank: true,
        badge: { select: { id: true, name: true, rarity: true } },
        user: {
          select: { id: true, githubUsername: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ badges, recentAwards });
  } catch (error) {
    console.error("[admin/badges]", error);
    return NextResponse.json({ error: "Failed to load badges" }, { status: 500 });
  }
}

/** Create a badge. Body: { name, description?, icon?, color?, rarity?, isMonthly?, isActive? } */
export async function POST(request: NextRequest) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: "name is required (max 100 characters)" },
      { status: 400 }
    );
  }
  const rarity = body?.rarity ?? "COMMON";
  if (!RARITIES.includes(rarity)) {
    return NextResponse.json(
      { error: `rarity must be one of ${RARITIES.join(", ")}` },
      { status: 400 }
    );
  }
  const color = typeof body?.color === "string" ? body.color.trim() : "";
  if (color && !/^#[0-9a-fA-F]{3,8}$/.test(color)) {
    return NextResponse.json({ error: "color must be a hex value" }, { status: 400 });
  }

  try {
    const badge = await prisma.badge.create({
      data: {
        name,
        description:
          typeof body?.description === "string" ? body.description.slice(0, 500) : null,
        icon: typeof body?.icon === "string" && body.icon ? body.icon.slice(0, 500) : null,
        color: color || null,
        rarity,
        isMonthly: Boolean(body?.isMonthly),
        isActive: body?.isActive === undefined ? true : Boolean(body.isActive),
      },
    });
    return NextResponse.json({ success: true, badge }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "A badge with this name already exists" },
        { status: 409 }
      );
    }
    console.error("[admin/badges POST]", error);
    return NextResponse.json({ error: "Failed to create badge" }, { status: 500 });
  }
}
