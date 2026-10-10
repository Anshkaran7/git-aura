import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/utils";

/**
 * Server-to-server auth for the GitAura admin panel (separate app).
 *
 * The admin app calls these endpoints from its own server with the header
 * `x-admin-secret: <ADMIN_API_SECRET>`. The secret never reaches a browser.
 * Endpoints also keep accepting a signed-in Clerk admin (ADMIN_EMAILS /
 * ADMIN_GITHUB_USERNAMES) so the in-app /admin page keeps working.
 */

export const ADMIN_SECRET_HEADER = "x-admin-secret";
const MIN_SECRET_LENGTH = 24;

/** Constant-time string compare (hashes first so lengths never leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

/** True when the request carries a valid ADMIN_API_SECRET header. */
export function hasValidAdminSecret(request: NextRequest | Request): boolean {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected || expected.length < MIN_SECRET_LENGTH) return false;
  const provided = request.headers.get(ADMIN_SECRET_HEADER);
  if (!provided) return false;
  return safeEqual(provided, expected);
}

/** True when the request carries `Authorization: Bearer <CRON_SECRET>`. */
export function hasValidCronSecret(request: NextRequest | Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const provided = request.headers.get("authorization");
  if (!provided) return false;
  return safeEqual(provided, `Bearer ${expected}`);
}

/** Returns the Clerk user id when the current session belongs to an admin. */
export async function getClerkAdminId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    if (!user) return null;

    const primaryEmail = user.emailAddresses?.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    const githubUsername =
      user.externalAccounts?.find((account) => account.provider === "github")
        ?.username || user.username;

    return isUserAdmin(primaryEmail, githubUsername) ? userId : null;
  } catch {
    return null;
  }
}

export type AdminAuthResult =
  | { ok: true; actor: string; via: "admin-secret" | "cron-secret" | "clerk" }
  | { ok: false; response: NextResponse };

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/**
 * Admin endpoints: admin-panel secret OR signed-in Clerk admin.
 * Never falls through on missing configuration.
 */
export async function authorizeAdmin(
  request: NextRequest | Request
): Promise<AdminAuthResult> {
  if (hasValidAdminSecret(request)) {
    return { ok: true, actor: "admin-panel", via: "admin-secret" };
  }
  // A wrong secret is a hard failure; don't silently fall back to cookies.
  if (request.headers.get(ADMIN_SECRET_HEADER)) {
    return { ok: false, response: unauthorized() };
  }
  const clerkAdmin = await getClerkAdminId();
  if (clerkAdmin) return { ok: true, actor: clerkAdmin, via: "clerk" };
  return { ok: false, response: unauthorized() };
}

/** Cron / maintenance endpoints: CRON_SECRET bearer OR admin-panel secret. */
export function authorizeCronOrAdmin(
  request: NextRequest | Request
): AdminAuthResult {
  if (hasValidCronSecret(request)) {
    return { ok: true, actor: "cron", via: "cron-secret" };
  }
  if (hasValidAdminSecret(request)) {
    return { ok: true, actor: "admin-panel", via: "admin-secret" };
  }
  return { ok: false, response: unauthorized() };
}

/** Headers to use when one server route calls another protected route. */
export function internalCronHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}`,
  };
}
