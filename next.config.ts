import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // sys-12 "Animation purpose" was the same rule as motion-3, filed twice;
      // the two were merged into motion-3. Keep shared links and indexed URLs alive.
      { source: "/rules/sys-12", destination: "/rules/motion-3", permanent: true },
      { source: "/rules/sys-12/:path*", destination: "/rules/motion-3/:path*", permanent: true },
      // Rules used to open over the homepage as `/?rule=<id>`; each now has its
      // own page. The match takes the last `rule` value, as the client does,
      // and only a well-formed id redirects. The query is carried over, `rule`
      // included; the catalog drops it from the address bar on load. A retired
      // id lands on the sys-12 redirect above, a second hop.
      {
        source: "/",
        has: [{ type: "query", key: "rule", value: "(?<rid>[a-z][a-z0-9]*-\\d+)" }],
        destination: "/rules/:rid",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
