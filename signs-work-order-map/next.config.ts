import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables React Strict Mode
  trailingSlash: true, // Ensures static file paths end with `/`
  // swcMinify: true, // Optimizes JavaScript -- this gave me an error
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
