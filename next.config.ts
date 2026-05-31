import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "katex"],
  },
  async redirects() {
    return [
      // Legacy top-level redirects (keep pointing to current structure)
      { source: "/modules", destination: "/calculus", permanent: true },
      { source: "/modules/:topicId", destination: "/calculus/modules/:topicId", permanent: true },
      { source: "/practice", destination: "/calculus/practice", permanent: true },
      { source: "/practice/:topicId", destination: "/calculus/practice/:topicId", permanent: true },
      { source: "/test/:topicId", destination: "/calculus/test/:topicId", permanent: true },

      // Removed redundant modules index pages — redirect to subject home (new canonical chapter list)
      { source: "/calculus/modules", destination: "/calculus", permanent: true },
      { source: "/linear-algebra/modules", destination: "/linear-algebra", permanent: true },
      { source: "/statistics/modules", destination: "/statistics", permanent: true },

      // { source: "/dashboard", destination: "/calculus/dashboard", permanent: true }, // disabled - now points to unified dashboard
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
