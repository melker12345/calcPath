import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin and /dashboard are personal or empty for crawlers; they are
        // also noindex'd in page metadata and absent from the sitemap.
        disallow: ["/api/", "/admin", "/dashboard"],
      },
    ],
    sitemap: "https://calc-path.com/sitemap.xml",
  };
}
