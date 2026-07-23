import type { MetadataRoute } from "next";
import {
  getAvailableSubjectConfigs,
  getFileSystemContentBundle,
  deriveModuleStructureFromBundle,
} from "@/lib/content/loader";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://calc-path.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const allPages: MetadataRoute.Sitemap = [];

  // Use auto-discovered subjects (scans content/ for index.json) + merge from subjects.ts metadata if present.
  // New subjects require zero entry in subjects.ts to be included in sitemap (and deep links).
  const subjectList = await getAvailableSubjectConfigs();

  // Generate entries for every subject (home + progress)
  for (const subject of subjectList) {
    allPages.push({
      url: `${base}/${subject.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    });
  }

  // Deep indexing for all subjects using new content/ + derive (no shim or modules/ import).
  // Auto-discovery means adding content/{slug}/ + index.json is enough (metadata fallback from index or thin subjects.ts).
  const deepModulePages: MetadataRoute.Sitemap = [];
  const deepPracticePages: MetadataRoute.Sitemap = [];
  for (const subject of subjectList) {
    const slug = subject.slug;
    try {
      const [bundle, modStructure] = await Promise.all([
        getFileSystemContentBundle(slug),
        deriveModuleStructureFromBundle(slug),
      ]);
      deepModulePages.push(
        ...modStructure.map((mod) => ({
          url: `${base}/${slug}/modules/${mod.topicId}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.85,
        }))
      );
      deepPracticePages.push(
        ...bundle.topics.map((topic) => ({
          url: `${base}/${slug}/practice/${topic.id}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }))
      );
    } catch {
      // graceful; sitemap still has the subject homes
    }
  }

  return [...staticPages, ...allPages, ...deepModulePages, ...deepPracticePages];
}
