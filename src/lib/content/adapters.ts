/**
 * Adapters between the new data-driven content model (content/ + FileSystemContentBundle)
 * and the legacy shapes still expected by the main application components
 * (SubjectModulePage, CourseContentsPage, etc.).
 *
 * Goal during migration:
 *   Real production pages can load from `getFileSystemContentBundle(subjectSlug)`
 *   (the canonical source from content/ JSON+MDX) and feed the *exact* legacy
 *   ModuleContent / slim module summaries that the high-quality existing UI
 *   components expect — with zero changes to those components.
 *
 * Public API (recommended for transition pages):
 *   - mdxModuleToLegacyModuleContent(mdxModule, topic)
 *   - mdxModulesToLegacyModules(mdxModules, topics)
 *   - getLegacyModuleContentForTopic(slug, topicId)
 *   - getLegacyModulesForSubject(slug)   // full ModuleContent[] ready to pass as `modules` prop
 *   - mdxModulesToLegacyModuleSummaries(...) // for CourseContentsPage `modules` prop
 *
 * All conversions are defensive, tolerate partial MDX ports, and preserve
 * the critical invariants (stable section slugs for progress + deep links).
 *
 * See NOTES.md for the full adapter strategy and usage examples.
 */

import type { MdxModule } from "./schema";
import type { ModuleContent, ModuleSection, WorkedExample } from "@/lib/modules/types";
import type { Topic } from "@/lib/shared-types";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Parses a raw MDX module (from content/*/topics/*/module.mdx) into the legacy
 * ModuleContent shape that SubjectModulePage, generic practice "review" links,
 * and related high-quality legacy-shaped components expect.
 *
 * This is the core of the bridge: the MDX "dialect" used in all content/ ports
 * (frontmatter, ## Title {#slug}, **ELI5**, ### Worked Examples, ## Common Mistakes,
 * variations across LA/Stats/Calculus) is turned into the exact {intro, sections[], ...}
 * contract the existing UI was built against.
 *
 * Robustness notes:
 * - Uses the battle-tested experimental parser (with legacy-tuned post-processing
 *   for body list items so they render cleanly under legacy <MathText per-para>).
 * - Falls back gracefully on missing slugs, empty sections, partial ports.
 * - Preserves exact section slugs (from {#...} or generated) — critical for
 *   progress tracking and deep links.
 *
 * @example
 * // Server component in a transitional real page:
 * import { getFileSystemContentBundle } from '@/lib/content/loader';
 * import { mdxModuleToLegacyModuleContent } from '@/lib/content/adapters';
 * import { SubjectModulePage } from '@/components/subject-module-page';
 *
 * export default async function MyModulePage({ params }) {
 *   const bundle = await getFileSystemContentBundle('statistics');
 *   const topic = bundle.topics.find(t => t.id === params.topicId)!;
 *   const mdxMod = bundle.mdxModules.find(m => m.topicId === params.topicId)!;
 *   const legacyModule = mdxModuleToLegacyModuleContent(mdxMod, topic);
 *
 *   return (
 *     <SubjectModulePage
 *       subjectSlug="statistics"
 *       subjectLabel="Statistics"
 *       modules={[legacyModule]}   // <— legacy shape, no UI changes needed
 *       topics={bundle.topics}
 *     />
 *   );
 * }
 */
export function mdxModuleToLegacyModuleContent(
  mdxModule: MdxModule,
  topic: Topic
): ModuleContent {
  // Reuse the battle-tested parser from the experimental viewer for the MDX dialect.
  // (Parser improved over time for all three subjects' port variations.)
  // NOTE: We intentionally call it here for the adapter bridge; a future
  // cleanup may inline a server-only copy tuned even more for legacy output.
  const { experimentalParseMdxModule } = require("@/components/experimental-generic-mdx-module-explanation");
  const parsed = experimentalParseMdxModule(mdxModule.mdxSource);

  // Map + legacy post-processing (body lists stripped of markers so plain
  // <p><MathText> rendering in SubjectModulePage etc. does not show literal "- ").
  const sections: ModuleSection[] = (parsed.sections || []).map((sec: any) => ({
    title: sec.title,
    section: sec.section || toSlug(sec.title),
    body: (sec.body || []).map((b: string) => b.replace(/^[-*]\s+|\d+\.\s+/, '').trim()).filter(Boolean),
    eli5: sec.eli5,
    examples: sec.examples as WorkedExample[] | undefined,
  }));

  return {
    topicId: topic.id,
    title: topic.title,
    intro: parsed.intro || [],
    sections,
    examples: [], // legacy top-level examples (rarely used now; per-section preferred)
    commonMistakes: parsed.commonMistakes || [],
  };
}

/**
 * Convenience helper: given a subject slug and topicId, load the FS bundle
 * and return the single legacy-shaped ModuleContent (or null if the topic
 * has no corresponding module.mdx yet).
 *
 * Useful for deep "review explanation" links or per-topic server components
 * during the transition.
 */
export async function getLegacyModuleContentForTopic(
  subjectSlug: string,
  topicId: string
): Promise<ModuleContent | null> {
  const { getFileSystemContentBundle } = await import("./loader");
  const bundle = await getFileSystemContentBundle(subjectSlug);

  const topic = bundle.topics.find((t) => t.id === topicId);
  const mdxModule = bundle.mdxModules.find((m) => m.topicId === topicId);

  if (!topic || !mdxModule) {
    return null;
  }

  return mdxModuleToLegacyModuleContent(mdxModule, topic);
}

/**
 * Returns the full array of legacy ModuleContent objects for a subject,
 * in the order the topics appear in the bundle (i.e. subject index order).
 *
 * This is the drop-in replacement for the old `modules` arrays that real
 * pages and <SubjectModulePage modules={...}> expect.
 *
 * @example
 * // Transitional version of a subject modules index or layout:
 * const bundle = await getFileSystemContentBundle('calculus');
 * const legacyModules = await getLegacyModulesForSubject('calculus');
 * // Now pass legacyModules to any component that used to receive the TS one.
 */
export async function getLegacyModulesForSubject(
  subjectSlug: string
): Promise<ModuleContent[]> {
  const { getFileSystemContentBundle } = await import("./loader");
  const bundle = await getFileSystemContentBundle(subjectSlug);
  return mdxModulesToLegacyModules(bundle.mdxModules, bundle.topics);
}

/**
 * Pure (sync) conversion of multiple MdxModules + their matching Topics
 * into legacy ModuleContent[].
 *
 * Preferred when you already have the bundle (avoids re-loading).
 * Filters out any mdxModule without a matching topic (defensive).
 */
export function mdxModulesToLegacyModules(
  mdxModules: MdxModule[],
  topics: Topic[]
): ModuleContent[] {
  return mdxModules
    .map((mdxMod) => {
      const topic = topics.find((t) => t.id === mdxMod.topicId);
      return topic ? mdxModuleToLegacyModuleContent(mdxMod, topic) : null;
    })
    .filter((m): m is ModuleContent => m !== null);
}

/**
 * Derives the *slim* module section summaries that <CourseContentsPage>
 * (and dashboard chapter expanders) consume for "what sections are in this topic?"
 *
 * Shape: [{ topicId, sections: [{ title, section? }, ...] }, ...]
 *
 * Use this + the FS topics/problems to drive the real /subject page
 * contents listing during migration without touching CourseContentsPage.
 */
export function mdxModulesToLegacyModuleSummaries(
  mdxModules: MdxModule[],
  topics: Topic[]
): Array<{
  topicId: string;
  sections: Array<{ title: string; section?: string }>;
}> {
  return mdxModulesToLegacyModules(mdxModules, topics).map((mod) => ({
    topicId: mod.topicId,
    sections: mod.sections.map((s) => ({
      title: s.title,
      section: s.section,
    })),
  }));
}
