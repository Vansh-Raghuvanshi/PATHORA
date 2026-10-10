import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.devtool = false;
    return config;
  },
};

export default nextConfig;
