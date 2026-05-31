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

// Names of routes that live OUTSIDE app/[locale]/ (each has its own folder).
const NON_LOCALE_PAGES = "dashboard|sign-in|sign-up|visualizer|pricing|blog|contact|privacy-policy|terms-of-service|refund-policy|2d-to-3d-floor-plan-converter|floor-plan-generator|projects|new|color-test";

// Admin + internals: ALWAYS English, never read the locale cookie.
const FORCE_EN = /^\/(secure-7x9|api|_next)(\/?.*)?$/;
// /ar/<non-locale-page> has no real route → redirect to the bare path (+ remember ar via cookie).
const AR_REDIRECT = new RegExp(`^\\/ar\\/(${NON_LOCALE_PAGES})(\\/.*)?$`);
// Non-locale pages: serve directly, but honour the preferred-locale cookie for translations.
const COOKIE_LOCALE = new RegExp(`^\\/(${NON_LOCALE_PAGES})(\\/?.*)?$`);

export default clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname;

  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Admin / API / internals → always English, skip all locale handling.
  if (FORCE_EN.test(path)) {
    return NextResponse.next();
  }

  // /ar/pricing, /ar/dashboard, etc. have no route → redirect to the bare path,
  // remembering Arabic preference via cookie so the page still renders in Arabic.
  if (AR_REDIRECT.test(path)) {
    const stripped = path.replace(/^\/ar/, "") || "/";
    const res = NextResponse.redirect(new URL(stripped, request.url));
    res.cookies.set("preferred-locale", "ar", { path: "/", maxAge: 31536000 });
    return res;
  }

  // Non-locale pages → serve directly, set locale from the preferred-locale cookie.
  if (COOKIE_LOCALE.test(path)) {
    const preferred = request.cookies.get("preferred-locale")?.value;
    const response = NextResponse.next();
    if (preferred === "ar" || preferred === "en") {
      response.headers.set("x-next-intl-locale", preferred);
    }
    return response;
  }

  // Home (/ , /ar) and blog posts (/:slug , /ar/:slug) → URL-based locale.
  return handleI18nRouting(request as NextRequest);
});

export const config = {
  matcher: [
    "/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
