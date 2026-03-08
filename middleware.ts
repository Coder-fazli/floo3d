 import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"                                                                                                                                   
  import { NextResponse } from "next/server"
                                                                                                                                                                                                               
  const isPublicRoute = createRouteMatcher(["/sign-in(.*)",
    "/sign-up(.*)", "/", "/visualizer(.*)"]);

  const isJunkRoute = createRouteMatcher([
    "/wp-admin(.*)",
    "/wp-login(.*)",
    "/wp-content(.*)",
    "/wp-includes(.*)",
    "/wordpress(.*)",
    "/xmlrpc.php",
    "/.env",
    "/phpmyadmin(.*)",
  ]);

    export default clerkMiddleware(async (auth, request) => {
      if (isJunkRoute(request)) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (!isPublicRoute(request)) {
          await auth.protect();
      }
    });


    export const config = {
      matcher: [
          "/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
          "/(api|trpc)(.*)",
      ],
    };
