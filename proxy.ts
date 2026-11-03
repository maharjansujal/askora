import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session_token";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/api/auth",
];

const AUTH_ROUTES = ["/login", "/register"];

const STATIC_FILE =
  /\.(?:ico|png|jpe?g|svg|gif|webp|css|js|woff2?|ttf|map|txt|xml|json)$/i;

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || STATIC_FILE.test(pathname)) {
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

  if (hasSession && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Default-deny: every route not in PUBLIC_ROUTES requires a session.
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
