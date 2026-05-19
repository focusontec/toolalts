import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page and auth API
  if (pathname === "/admin/login/" || pathname === "/api/admin/auth/") {
    return NextResponse.next();
  }

  // Protect admin pages and admin API routes
  if (pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
    const session = request.cookies.get("admin_session")?.value;

    if (!session) {
      // API routes return 401, pages redirect to login
      if (pathname.startsWith("/api/admin/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
