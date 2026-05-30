import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/account"],
      },
    ],
    sitemap: "https://calc-path.com/sitemap.xml",
  };
}
