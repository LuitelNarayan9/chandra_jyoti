import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "storage.chandrajyotisanstha.online",
      },
    ],
  },
  allowedDevOrigins: ['decisive-subneural-serafina.ngrok-free.dev', 'dev.chandrajyotisanstha.online']
};

export default nextConfig;
