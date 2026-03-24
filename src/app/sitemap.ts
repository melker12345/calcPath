import type { MetadataRoute } from "next";
import { topics } from "@/lib/calculus-content";
import { modules } from "@/lib/modules";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://calc-path.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/calculus/modules`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/calculus/practice`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/auth`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Individual module pages (free content — high SEO value)
  const modulePages: MetadataRoute.Sitemap = modules.map((mod) => ({
    url: `${base}/calculus/modules/${mod.topicId}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // Practice topic pages
  const practicePages: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${base}/calculus/practice/${topic.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...modulePages, ...practicePages];
}
