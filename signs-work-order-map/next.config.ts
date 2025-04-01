import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Forces static export (acts like a SPA)
  reactStrictMode: true, // Enables React Strict Mode
  trailingSlash: true, // Ensures static file paths end with `/`
  swcMinify: true, // Optimizes JavaScript
};

export default nextConfig;
