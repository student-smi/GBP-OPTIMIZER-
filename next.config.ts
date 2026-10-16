import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@libsql/client"],
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
