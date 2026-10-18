import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // On Vercel, frontend and backend are path-routed services on one domain
  // (see root vercel.json), so the API base should be same-origin ("").
  // Locally there's no rewrite, so it falls back to the backend's dev port.
  // `process.env.VERCEL` isn't itself exposed to the browser, but `env`
  // below bakes the computed result into NEXT_PUBLIC_API_URL at build time,
  // so no manual dashboard env var is required.
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      (process.env.VERCEL ? "" : "http://localhost:4000"),
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
        pathname: "/api/uploads/**",
      },
    ],
  },
};

export default nextConfig;
