import { getCookieCache } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_PREFIX } from "./lib/constants";

const authRoutes = [
  "/login",
  "/register",
  "/reset-password",
  "/invalid-url",
  "/forgot-password",
  "/email-otp",
];

export async function proxy(request: NextRequest) {
  const sessionCookie = await getCookieCache(request, {
    cookiePrefix: AUTH_COOKIE_PREFIX,
  });

  const { pathname } = request.nextUrl;
  const hasSession = !!sessionCookie;
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasSession && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|fonts|icons|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
};
