import type { NextConfig } from "next";

/**
 * The whole site is static files (out/), served by Cloudflare. Redirects and
 * cache headers that a server would set here are written next to the files
 * as _redirects and _headers by scripts/cloudflare-assets.ts after the build;
 * /api/feedback is the worker in worker/.
 */
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
};

export default nextConfig;
