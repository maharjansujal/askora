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

  // Ignore Next.js internals and static files.
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (request.nextUrl.searchParams.get("clear_session") === "1") {
    const url = new URL(request.url);
    url.searchParams.delete("clear_session");
    const response = NextResponse.redirect(url);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const hasSession = Boolean(sessionToken);

  // Logged-in users shouldn't see login/register.
  if (hasSession && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public routes don't require authentication.
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Protected routes require a session cookie.
  if (isProtectedRoute(pathname) && !hasSession) {
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
