import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth check for admin pages and API routes
  if (pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
    // Skip login page and auth API
    if (pathname === "/admin/login/" || pathname === "/api/admin/auth/") {
      return NextResponse.next();
    }

    const session = request.cookies.get("admin_session")?.value;
    if (!session) {
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
