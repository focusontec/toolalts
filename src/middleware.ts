import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminPath = process.env.ADMIN_PATH || "admin";

  // Rewrite secret admin URL to internal /admin/ path
  if (adminPath !== "admin" && pathname.startsWith(`/${adminPath}/`)) {
    const rewrittenPath = pathname.replace(`/${adminPath}/`, "/admin/");
    const url = request.nextUrl.clone();
    url.pathname = rewrittenPath;
    return NextResponse.rewrite(url);
  }

  // Handle root secret path (e.g., /87f90dbb → /admin/)
  if (adminPath !== "admin" && pathname === `/${adminPath}`) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/";
    return NextResponse.rewrite(url);
  }

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
  matcher: ["/admin/:path*", "/api/admin/:path*", "/((?!_next|favicon|logos|images|sitemap|robots|tool|blog|category|compare|reports|alternative-to).*)"],
};
