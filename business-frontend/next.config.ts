import type { NextConfig } from "next";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8888";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
