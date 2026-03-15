import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.spock.replit.dev",
    "*.repl.co",
    "*.riker.replit.dev",
    "*.kirk.replit.dev",
    "*.picard.replit.dev",
  ],
};

export default nextConfig;
