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

  // Bundle the rclone binary and font files into every serverless function
  outputFileTracingIncludes: {
    "/api/**/*": [
      path.join(__dirname, "bin", "rclone"),
      path.join(__dirname, "src", "lib", "ai", "fonts", "*.ttf"),
    ],
  },
};

export default nextConfig;
