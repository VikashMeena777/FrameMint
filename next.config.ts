import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include the rclone binary in the serverless function bundle
  outputFileTracingIncludes: {
    '/api/*': ['./bin/rclone'],
  },
};

export default nextConfig;
