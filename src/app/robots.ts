import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin, /sync and /dashboard render auth/empty shells to crawlers;
        // they are also noindex'd in page metadata and absent from the sitemap.
        disallow: ["/api/", "/account", "/admin", "/sync", "/dashboard"],
      },
    ],
    sitemap: "https://calc-path.com/sitemap.xml",
  };
}
