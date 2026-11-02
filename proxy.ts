import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session_token";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/verify-email"];

const AUTH_ROUTES = ["/login", "/register"];

const PROTECTED_ROUTES = ["/dashboard", "/admin"];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const isProtectedRoute = (pathname: string) =>
  PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSession = Boolean(sessionToken);

  if (hasSession && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Everything else requires a session.
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run middleware on application routes, excluding
     * Next.js internals and common static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
