import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only badge defaults to bottom-left, which overlaps the mobile
  // bottom nav's "Home" item on /patient/* pages — move it out of the way.
  devIndicators: {
    position: "top-left",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
