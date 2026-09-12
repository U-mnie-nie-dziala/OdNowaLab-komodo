import type { NextConfig } from "next";

const BACKEND_ORIGIN = (
  process.env.BACKEND_ORIGIN ??
  process.env.SPRING_DATASOURCE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:8888"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_ORIGIN}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
