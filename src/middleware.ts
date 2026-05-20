import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPath = process.env.ADMIN_PATH || "admin";

  // Rewrite secret admin URL to internal /admin/ path
  if (adminPath !== "admin") {
    if (pathname.startsWith(`/${adminPath}/`)) {
      const rewritten = pathname.replace(`/${adminPath}/`, "/admin/");
      return NextResponse.rewrite(new URL(rewritten, request.url));
    }
    if (pathname === `/${adminPath}`) {
      return NextResponse.rewrite(new URL("/admin/", request.url));
    }
  }

  // Auth check for admin pages and API routes
  if (pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
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

// Run middleware on all paths except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
