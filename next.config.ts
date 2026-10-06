import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // sys-12 "Animation purpose" was the same rule as motion-3, filed twice;
  // the two were merged into motion-3. Keep shared links and indexed URLs alive.
  async redirects() {
    return [
      { source: "/rules/sys-12", destination: "/rules/motion-3", permanent: true },
      { source: "/rules/sys-12/:path*", destination: "/rules/motion-3/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
