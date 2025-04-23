import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    appDir: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  swcMinify: true,
};

export default nextConfig;
