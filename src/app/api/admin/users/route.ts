import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const SORTS: Record<string, Prisma.UserOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
  aura: [{ totalAura: "desc" }],
  streak: [{ currentStreak: "desc" }],
  refreshed: [{ lastAuraRefreshAt: { sort: "desc", nulls: "last" } }],
  username: [{ githubUsername: { sort: "asc", nulls: "last" } }],
};

/**
 * Paginated user list for the admin panel.
 * Query: q (search username/name/email), status (all|active|banned|errors|never-refreshed),
 *        sort (newest|oldest|aura|streak|refreshed|username), page, limit (<=100)
 */
export async function GET(request: NextRequest) {
  const authResult = await authorizeAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().slice(0, 100) || "";
    const status = searchParams.get("status") || "all";
    const sortKey = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "25", 10) || 25)
    );

    const and: Prisma.UserWhereInput[] = [];
    if (q) {
      and.push({
        OR: [
          { githubUsername: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { id: q },
        ],
      });
    }
    if (status === "banned") and.push({ isBanned: true });
    if (status === "active") and.push({ isBanned: false });
    if (status === "errors") and.push({ refreshError: { not: null } });
    if (status === "never-refreshed") and.push({ lastAuraRefreshAt: null });

    const where: Prisma.UserWhereInput = and.length ? { AND: and } : {};
    const orderBy = [...(SORTS[sortKey] ?? SORTS.newest), { id: "asc" as const }];

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          githubUsername: true,
          displayName: true,
          avatarUrl: true,
          totalAura: true,
          currentStreak: true,
          longestStreak: true,
          lastContributionDate: true,
          createdAt: true,
          isBanned: true,
          banReason: true,
          bannedAt: true,
          banExpiresAt: true,
          lastAuraRefreshAt: true,
          refreshError: true,
          refreshAttempts: true,
          _count: { select: { userBadges: true } },
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[admin/users]", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
