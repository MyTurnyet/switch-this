/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['next'],
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig; 