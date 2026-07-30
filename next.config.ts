import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow isolated builds while `next dev` owns `.next` (e.g. NEXT_DIST_DIR=.next-prod-audit).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
