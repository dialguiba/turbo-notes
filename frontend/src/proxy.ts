import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

const DASHBOARD_ROUTES = ["/notes"];
const AUTH_ROUTES = ["/login", "/signup"];

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has(AUTH_COOKIE_NAME);

  // Unauthenticated users on dashboard routes → redirect to /login
  if (isDashboardRoute(pathname) && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated users on auth routes → redirect to /notes
  if (isAuthRoute(pathname) && hasToken) {
    return NextResponse.redirect(new URL("/notes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/login", "/signup"],
};
