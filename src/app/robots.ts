import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/account", "/calculus/dashboard"],
      },
    ],
    sitemap: "https://calc-path.com/sitemap.xml",
  };
}
