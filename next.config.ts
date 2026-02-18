import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/modules", destination: "/calculus/modules", permanent: true },
      { source: "/modules/:topicId", destination: "/calculus/modules/:topicId", permanent: true },
      { source: "/practice", destination: "/calculus/practice", permanent: true },
      { source: "/practice/:topicId", destination: "/calculus/practice/:topicId", permanent: true },
      { source: "/test/:topicId", destination: "/calculus/test/:topicId", permanent: true },
    ];
  },
};

export default nextConfig;
