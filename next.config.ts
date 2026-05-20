import type { NextConfig } from "next";

const adminPath = process.env.ADMIN_PATH || "admin";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    // Rewrite secret admin path to internal /admin/ path
    if (adminPath !== "admin") {
      return [
        {
          source: `/${adminPath}/:path*`,
          destination: "/admin/:path*",
        },
        {
          source: `/${adminPath}`,
          destination: "/admin/",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
