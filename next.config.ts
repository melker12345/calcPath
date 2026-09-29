import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  experimental: {
    optimizePackageImports: ["katex"],
  },
  async redirects() {
    return [
      // Legacy top-level redirects (keep pointing to current structure)
      { source: "/modules", destination: "/calculus", permanent: true },
      { source: "/modules/:topicId", destination: "/calculus/modules/:topicId", permanent: true },
      { source: "/practice", destination: "/calculus/practice", permanent: true },
      { source: "/practice/:topicId", destination: "/calculus/practice/:topicId", permanent: true },
      { source: "/test/:topicId", destination: "/calculus/test/:topicId", permanent: true },

      // Redundant modules index — canonical chapter list lives at /[subject]
      { source: "/:subject/modules", destination: "/:subject", permanent: true },

      // { source: "/dashboard", destination: "/calculus/dashboard", permanent: true }, // disabled - now points to unified dashboard
    ];
  },
};

export default nextConfig;
