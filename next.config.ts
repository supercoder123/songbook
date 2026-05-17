import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// Serwist registers a webpack plugin. Next.js 16 uses Turbopack for `next dev`
// by default, which conflicts with a webpack-only config. Apply Serwist only
// for production builds (`next build`), where webpack is used.
export default process.env.NODE_ENV === "production"
  ? withSerwist(nextConfig)
  : nextConfig;
