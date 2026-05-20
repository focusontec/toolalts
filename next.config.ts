import type { NextConfig } from "next";

const adminPath = process.env.ADMIN_PATH || "admin";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    if (adminPath !== "admin") {
      return {
        beforeFiles: [
          {
            source: `/${adminPath}/:path*`,
            destination: "/admin/:path*",
          },
          {
            source: `/${adminPath}`,
            destination: "/admin/",
          },
        ],
        afterFiles: [],
        fallback: [],
      };
    }
    return [];
  },
};

export default nextConfig;
