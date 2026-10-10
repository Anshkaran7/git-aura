import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isCronRoute = createRouteMatcher(["/api/cron/(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);
// Note: /admin pages are NOT listed here — they 404 for non-admins (see
// app/admin/users/page.tsx) instead of redirecting to sign-in, so the admin
// area stays invisible to regular visitors.
const isAuthRequiredRoute = createRouteMatcher([
  "/banned(.*)",
  "/api/check-ban-status",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isCronRoute(req)) {
    return;
  }

  // Server-to-server calls from the separate admin panel authenticate with
  // the x-admin-secret header; the route handlers verify it (constant-time)
  // via authorizeAdmin() in src/lib/admin-auth.ts.
  if (isAdminApiRoute(req) && req.headers.has("x-admin-secret")) {
    return;
  }

  // Signed-out callers get a bare 404 rather than a sign-in redirect, so the
  // admin API doesn't advertise itself. Route handlers still check admin rights.
  if (isAdminApiRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return;
  }

  if (isAuthRequiredRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
