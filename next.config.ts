import type { NextConfig } from "next";

import { ruleAliases } from "./src/data/ui-logic";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Development only: the route indicator sat over the rail's theme row and took its clicks.
  devIndicators: { position: "bottom-right" },
  async redirects() {
    return [
      // Retired ids redirect to the rule that absorbed them (see ruleAliases).
      ...Object.entries(ruleAliases).flatMap(([from, to]) => [
        { source: `/rules/${from}`, destination: `/rules/${to}`, permanent: true },
        { source: `/rules/${from}/:path*`, destination: `/rules/${to}/:path*`, permanent: true },
      ]),
      // Rules used to open over the homepage as `/?rule=<id>`; each now has its
      // own page. The match takes the last `rule` value, as the client does,
      // and only a well-formed id redirects. The query is carried over, `rule`
      // included; the catalog drops it from the address bar on load. A retired
      // id lands on its redirect above, a second hop.
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
