'use server';

export type SearchEntry = {
  label: string;
  description: string;
  href: string;
  subjectIcon: string;
  kind: "topic" | "section" | "page";
};

// Server Action: builds the full search index using ONLY the new data-driven content architecture.
// This removes the last major client-side dependency on legacy modules/ tree and static shims (subject-topics fully retired).
// Sections come from the real MDX-derived structure (stable slugs preferred).

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const { getFileSystemContentBundle, deriveModuleStructureFromBundle, getAvailableSubjectConfigs } = await import("@/lib/content/loader");
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
      entries.push({
        label: `${name} Progress`,
        description: "Your progress",
        href: `/dashboard`,
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
