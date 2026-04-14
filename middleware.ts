import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/members",
  "/attendance",
  "/groups",
  "/announcements",
  "/finance",
  "/users"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const token = request.cookies.get("token")?.value;

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/members/:path*",
    "/attendance/:path*",
    "/groups/:path*",
    "/announcements/:path*",
    "/finance/:path*",
    "/users/:path*"
  ]
};
