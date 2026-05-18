import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/contact",
  "/about-us",
  "/contact-us",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // PostHog proxy — must run before Clerk auth
  if (request.nextUrl.pathname.startsWith("/ingest")) {
    const url = request.nextUrl.clone();
    const hostname = url.pathname.startsWith("/ingest/static/")
      ? "us-assets.i.posthog.com"
      : "us.i.posthog.com";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("host", hostname);
    url.protocol = "https";
    url.hostname = hostname;
    url.port = "443";
    url.pathname = url.pathname.replace(/^\/ingest/, "");
    return NextResponse.rewrite(url, { headers: requestHeaders });
  }

  // Clerk auth
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/ingest/:path*", // ← PostHog routes added here
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)", // ← Clerk-specific frontend API routes
  ],
};
