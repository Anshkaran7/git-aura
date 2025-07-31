import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "github.com",
      "avatars.githubusercontent.com",
      "images.unsplash.com",
      "img.clerk.com",
      "images.clerk.dev",
    ],
  },
};

export default nextConfig;
