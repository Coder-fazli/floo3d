import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['geoip-lite'],
  async redirects() {
    return [
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
