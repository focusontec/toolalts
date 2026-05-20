import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth check for admin pages and API routes
  if (pathname.startsWith("/87f90dbb/") || pathname.startsWith("/api/admin/")) {
    // Skip login page and auth API
    if (pathname === "/87f90dbb/login/" || pathname === "/api/admin/auth/") {
      return NextResponse.next();
    }

    const session = request.cookies.get("admin_session")?.value;
    if (!session) {
      if (pathname.startsWith("/api/admin/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/87f90dbb/login/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/87f90dbb/:path*", "/api/admin/:path*"],
};
