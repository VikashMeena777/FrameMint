import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.spock.replit.dev",
    "*.repl.co",
    "*.riker.replit.dev",
    "*.kirk.replit.dev",
    "*.picard.replit.dev",
  ],

  // Bundle the rclone binary into every serverless function that might need it
  outputFileTracingIncludes: {
    "/api/**/*": [path.join(__dirname, "bin", "rclone")],
  },
};

export default nextConfig;
