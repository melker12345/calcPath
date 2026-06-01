import type { MetadataRoute } from "next";
import { subjectList } from "@/lib/subjects";

// Note: Full per-subject module indexing is still somewhat manual.
// For now we generate subject homepages + basic routes for all subjects,
// plus deep module pages for Calculus (the most complete subject).
import { topics as shimTopics } from "@/lib/calculus-content";
const calculusTopics = shimTopics ?? [];
import { modules as calculusModules } from "@/lib/modules";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://calc-path.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/auth`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const allPages: MetadataRoute.Sitemap = [];

  // Generate entries for every subject (home + progress)
  for (const subject of subjectList) {
    allPages.push({
      url: `${base}/${subject.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    });
  }

  // Deep indexing for Calculus (best coverage today)
  const calculusModulePages: MetadataRoute.Sitemap = calculusModules.map((mod) => ({
    url: `${base}/calculus/modules/${mod.topicId}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const calculusPracticePages: MetadataRoute.Sitemap = calculusTopics.map((topic) => ({
    url: `${base}/calculus/modules/${topic.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...allPages, ...calculusModulePages, ...calculusPracticePages];
}
