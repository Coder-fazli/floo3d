import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from "next/server";

const handleI18nRouting = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/ar",
  "/ar/(.*)",
  "/visualizer(.*)",
  "/2d-to-3d-floor-plan-converter(.*)",
  "/api/guest-generate(.*)",
  "/api/webhooks(.*)",
  "/floor-plan-generator(.*)",
  "/pricing(.*)",
  "/privacy-policy(.*)",
  "/terms-of-service(.*)",
  "/refund-policy(.*)",
  "/contact(.*)",
  "/blog(.*)",
  "/api/posts(.*)",
  "/:slug",
]);

const isAdminRoute = createRouteMatcher(["/secure-7x9(.*)"]);

// Paths that bypass locale routing (dashboard, admin, auth, API)
const SKIP_LOCALE = /^\/(dashboard|secure-7x9|sign-in|sign-up|api|_next|visualizer)(\/?.*)?$/;

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Skip i18n routing for non-public app sections
  if (SKIP_LOCALE.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return handleI18nRouting(request as NextRequest);
});

export const config = {
  matcher: [
    "/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
