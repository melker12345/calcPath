import type { MetadataRoute } from "next";
import {
  getAvailableSubjectConfigs,
  getFileSystemContentBundle,
  deriveModuleStructureFromBundle,
  loadSubjectIndex,
} from "@/lib/content/loader";
import { listTopicsWithProblemSets } from "@/lib/content/problemset-loader";
import { lastModified, topicPaths } from "@/lib/content/last-modified";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://calc-path.com";

  // lastModified is the date of the last commit that touched the page's
  // content file (src/lib/content/last-modified.ts), and is omitted when git
  // is unavailable. Stamping every URL with the build time told crawlers the
  // whole site changed at every deploy, which is the same as telling them
  // nothing. Index pages take the latest date among the pages they list.
  const siteLatest = lastModified(...(await allContentPaths()));

  // /dashboard is intentionally absent: it is noindex + disallowed in robots.ts
  // (personal progress, empty for crawlers). Same for /admin.
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: siteLatest, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/subjects`, lastModified: siteLatest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/problem-sets`, lastModified: siteLatest, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/feedback`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const allPages: MetadataRoute.Sitemap = [];

  // Use auto-discovered subjects (scans content/ for index.json) + merge from subjects.ts metadata if present.
  // New subjects require zero entry in subjects.ts to be included in sitemap (and deep links).
  const subjectList = await getAvailableSubjectConfigs();

  // One entry per subject home, dated by its most recently changed chapter.
  for (const subject of subjectList) {
    const paths = (await loadSubjectIndex(subject.slug)).topics.map((t) => topicPaths(subject.slug, t.id).chapter);
    allPages.push({
      url: `${base}/${subject.slug}`,
      lastModified: lastModified(`content/${subject.slug}/index.json`, ...paths),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    });
  }

  // Deep indexing for all subjects using new content/ + derive (no shim or modules/ import).
  // Auto-discovery means adding content/{slug}/ + index.json is enough (metadata fallback from index or thin subjects.ts).
  const deepModulePages: MetadataRoute.Sitemap = [];
  const deepPracticePages: MetadataRoute.Sitemap = [];
  const problemSheetPages: MetadataRoute.Sitemap = [];
  for (const subject of subjectList) {
    const slug = subject.slug;
    try {
      const [bundle, modStructure, sheetTopics] = await Promise.all([
        getFileSystemContentBundle(slug),
        deriveModuleStructureFromBundle(slug),
        listTopicsWithProblemSets(slug),
      ]);
      deepModulePages.push(
        ...modStructure.map((mod) => ({
          url: `${base}/${slug}/modules/${mod.topicId}`,
          lastModified: lastModified(topicPaths(slug, mod.topicId).chapter),
          changeFrequency: "monthly" as const,
          priority: 0.85,
        }))
      );
      deepPracticePages.push(
        ...bundle.topics.map((topic) => ({
          url: `${base}/${slug}/practice/${topic.id}`,
          lastModified: lastModified(topicPaths(slug, topic.id).practice),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }))
      );
      // Printable problem sets: the question sheet and its solutions sheet.
      for (const topicId of sheetTopics) {
        problemSheetPages.push(
          { url: `${base}/${slug}/test/${topicId}`, lastModified: lastModified(topicPaths(slug, topicId).problemSet), changeFrequency: "monthly" as const, priority: 0.7 },
          { url: `${base}/${slug}/test/${topicId}/answers`, lastModified: lastModified(topicPaths(slug, topicId).problemSet), changeFrequency: "monthly" as const, priority: 0.5 },
        );
      }
    } catch {
      // graceful; sitemap still has the subject homes
    }
  }

  return [...staticPages, ...allPages, ...deepModulePages, ...deepPracticePages, ...problemSheetPages];
}

/** Every chapter's module.mdx, for the site-wide latest change. */
async function allContentPaths(): Promise<string[]> {
  const out: string[] = [];
  for (const subject of await getAvailableSubjectConfigs()) {
    try {
      const idx = await loadSubjectIndex(subject.slug);
      out.push(...idx.topics.map((t) => topicPaths(subject.slug, t.id).chapter));
    } catch {
      // skipped
    }
  }
  return out;
}
