import "server-only";

import {
  deriveModuleStructureFromBundle,
  getAvailableSubjectConfigs,
  getFileSystemContentBundle,
} from "@/lib/content/loader";

export type SearchEntry = {
  label: string;
  description: string;
  href: string;
  subjectIcon: string;
  kind: "topic" | "section" | "page";
};

// Builds the search index from content/ at build time; published as
// /search-index.json (src/app/search-index.json/route.ts) and fetched by the
// search dialog on first open. Sections come from the MDX-derived structure.

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const entries: SearchEntry[] = [];
  // Use auto discovery (content/ dir scan for index.json) so new subjects appear in search with zero subjects.ts entry.
  // Graceful metadata fallback from subjects.ts record if present.
  const subjectList = await getAvailableSubjectConfigs();
  const slugs = subjectList.map((s) => s.slug);

  for (const slug of slugs) {
    try {
      const [bundle, structure] = await Promise.all([
        getFileSystemContentBundle(slug),
        deriveModuleStructureFromBundle(slug),
      ]);

      const config = bundle.config;
      const icon = config.icon || subjectList.find((s) => s.slug === slug)?.icon || "•";
      const name = config.label;

      // Subject pages
      entries.push({
        label: name,
        description: `${bundle.topics.length} topics`,
        href: `/${slug}`,
        subjectIcon: icon,
        kind: "page",
      });

      // Topics + sections from real data
      const modulesByTopic = new Map(
        structure.map((m) => [m.topicId, m.sections])
      );

      for (const topic of bundle.topics) {
        entries.push({
          label: topic.title,
          description: `${name} module`,
          href: `/${slug}/modules/${topic.id}`,
          subjectIcon: icon,
          kind: "topic",
        });

        const secs = modulesByTopic.get(topic.id) || [];
        for (const sec of secs) {
          // Prefer the stable .section slug (from MDX {#} or <!-- section: -->) for accurate deep links.
          // Falls back to title slugify (matches old behavior).
          const sectionSlug = sec.section || slugify(sec.title);
          entries.push({
            label: sec.title,
            description: `${topic.title} — ${name}`,
            href: `/${slug}/modules/${topic.id}#${sectionSlug}`,
            subjectIcon: icon,
            kind: "section",
          });
        }
      }
    } catch (err) {
      // If a subject bundle isn't ready, skip gracefully (search will still have other subjects).
      // In production this shouldn't happen for the three main subjects.
      console.warn(`[search-index] Failed to load new content for ${slug}`, err);
    }
  }

  return entries;
}
