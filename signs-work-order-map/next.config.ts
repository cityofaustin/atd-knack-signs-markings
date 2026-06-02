import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables React Strict Mode
  // Empty turbopack config to acknowledge we have webpack config
  turbopack: {},
};

export default nextConfig;
