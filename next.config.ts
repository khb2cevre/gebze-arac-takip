import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
 basePath: "/gebze-arac-takip",
  assetPrefix: "/gebze-arac-takip/",
  images: {
    unoptimized: true,
  },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
