import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isCronRoute = createRouteMatcher(["/api/cron/(.*)"]);
const isAuthRequiredRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
  "/banned(.*)",
  "/api/check-ban-status",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isCronRoute(req)) {
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
