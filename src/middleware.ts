import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/[username]/(.*)", // User profile pages and sub-pages
]);

export default clerkMiddleware((auth, req) => {
  // For protected routes, we'll handle authorization at the page level
  // This middleware ensures the user is tracked by Clerk
  if (isProtectedRoute(req)) {
    // Let the page components handle the authorization logic
    // Middleware just ensures Clerk auth context is available
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
