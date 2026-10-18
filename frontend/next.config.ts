import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
