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
 * Self-contained, server-safe parser for the MDX dialect used across all
 * content/*/topics/*/module.mdx files.
 *
 * Tuned specifically for the *legacy* ModuleContent output contract:
 * - body paragraphs are always plain strings (list markers stripped so legacy
 *   SubjectModulePage's per-para MathText rendering stays clean).
 * - ELI5 and example steps keep their natural list-item text.
 * - Handles the full range of variations observed in the three full ports:
 *   * LA style: **ELI5** \n\n - bullets, ### Worked Examples
 *   * Stats style: **ELI5**: single sentence, **Worked Example:** bullets (no ###)
 *   * Calculus style: **ELI5**: ..., inline "Common pitfall", <!-- section: slug --> markers
 *   * Mixed: ELI5 immediately after heading or after first prose para, worked ex
 *     under h3 or as bold, common mistakes as final ## section.
 *
 * This is an improvement/refinement over the experimental parser for the
 * adapter use-case (legacy bridge) while still sharing the same dialect knowledge.
 * No React, no client directives, fully tree-shakeable and safe in RSC.
 */
function parseMdxSourceForLegacy(mdxSource: string): {
  intro: string[];
  sections: Array<{
    title: string;
    section: string;
    body: string[];
    eli5?: string[];
    examples?: WorkedExample[];
  }>;
  commonMistakes: string[];
} {
  // 1. Strip frontmatter (robust to \r\n and no trailing newline)
  let source = mdxSource.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, "").trim();

  // 2. Remove the redundant top-level # Title (we take title from Topic JSON)
  source = source.replace(/^#\s+[^\n]+(\n|$)/, "").trim();

  const lines = source.split(/\r?\n/);

  const intro: string[] = [];
  const sections: Array<{
    title: string;
    section: string;
    body: string[];
    eli5?: string[];
    examples?: WorkedExample[];
  }> = [];
  const commonMistakes: string[] = [];

  let currentSection: (typeof sections)[number] | null = null;
  let inIntro = true;
  let inCommonMistakes = false;

  // Per-section collectors (reset on new section)
  let collectingEli5 = false;
  let currentEli5: string[] = [];
  let collectingWorked = false;
  let currentWorked: WorkedExample | null = null;

  const finishCurrentSection = () => {
    if (currentSection) {
      if (currentEli5.length > 0) {
        currentSection.eli5 = [...currentEli5];
      }
      sections.push(currentSection);
    }
    currentSection = null;
    collectingEli5 = false;
    currentEli5 = [];
    collectingWorked = false;
    currentWorked = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      // blank lines: allow ELI5/worked lists to span them (as seen in LA ports)
      if (collectingWorked || collectingEli5) {
        // stay in collector
      }
      continue;
    }

    // Skip non-section HTML comments (some calculus ports use them for slugs)
    if (line.startsWith("<!--") && !/section:/i.test(line)) {
      continue;
    }

    // === H2 section heading (primary structure) ===
    const h2 = line.match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/i);
    if (h2) {
      finishCurrentSection();

      const rawTitle = h2[1].trim();
      let slug = h2[2] || toSlug(rawTitle);

      // Lookahead for <!-- section: foo --> override (used in some ports)
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const cm = lines[j].match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i);
        if (cm) {
          slug = cm[1];
          break;
        }
      }

      const lower = rawTitle.toLowerCase();
      if (lower.includes("common mistake") || lower.includes("common pitfall")) {
        inCommonMistakes = true;
        inIntro = false;
        currentSection = null;
        continue;
      }

      currentSection = {
        title: rawTitle,
        section: slug,
        body: [],
        examples: [],
      };
      inIntro = false;
      inCommonMistakes = false;
      collectingEli5 = false;
      collectingWorked = false;
      continue;
    }

    // === H3 — frequently "Worked Examples" or sub-headings ===
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const h3Lower = h3[1].trim().toLowerCase();
      if (h3Lower.includes("worked example")) {
        collectingWorked = true;
        collectingEli5 = false;
        const exTitleMatch = h3[1].match(/worked examples?:\s*(.*)/i);
        const exTitle = (exTitleMatch?.[1] || "Example").trim() || "Worked Example";
        currentWorked = { title: exTitle, steps: [] };
        if (currentSection) {
          currentSection.examples = currentSection.examples || [];
          currentSection.examples.push(currentWorked);
        }
        continue;
      }
      // Other H3: treat as body prose (rare)
      if (currentSection && !collectingEli5 && !collectingWorked) {
        currentSection.body.push(h3[1].trim());
      }
      continue;
    }

    if (inCommonMistakes) {
      if (line.startsWith("- ") || line.startsWith("* ")) {
        commonMistakes.push(line.replace(/^[-*]\s*/, "").trim());
      }
      continue;
    }

    if (inIntro) {
      if (!line.startsWith("#")) {
        intro.push(line);
      }
      continue;
    }

    if (!currentSection) {
      // Stray content before first section → attach to intro (defensive)
      intro.push(line);
      continue;
    }

    // === ELI5 detection (multiple styles from real ports) ===
    const eli5Marker = line.match(/^\*\*ELI5(?:\*\*|[:\s(]|$)/i);
    if (eli5Marker) {
      collectingEli5 = true;
      collectingWorked = false;
      const after = line.replace(/^\*\*ELI5\*\*[:\s]*/i, "").trim();
      if (after) currentEli5.push(after);
      continue;
    }

    // === Worked Example bold marker (stats-heavy ports) ===
    const workedMarker = line.match(/^\*\*Worked Example(?:s)?:?\s*(.*?)\*\*/i);
    if (workedMarker) {
      collectingWorked = true;
      collectingEli5 = false;
      const exTitle = (workedMarker[1] || "Example").trim() || "Worked Example";
      currentWorked = { title: exTitle, steps: [] };
      if (currentSection) {
        currentSection.examples = currentSection.examples || [];
        currentSection.examples.push(currentWorked);
      }
      continue;
    }

    // === List items (under ELI5, worked, or body) ===
    if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
      const itemText = line.replace(/^[-*\d.]\s*/, "").trim();
      if (collectingEli5) {
        currentEli5.push(itemText);
        continue;
      }
      if (collectingWorked && currentWorked) {
        currentWorked.steps.push(itemText);
        continue;
      }
      // Body list: STRIP marker for legacy consumers (SubjectModulePage etc.)
      // This matches historical legacy TS modules (prose body paras, no "- ").
      if (currentSection) {
        if (itemText) currentSection.body.push(itemText);
      }
      continue;
    }

    // === Regular content line ===
    if (collectingEli5) {
      // Non-list after ELI5 marker ends the ELI5 block (stats style)
      collectingEli5 = false;
      currentSection.body.push(line);
      continue;
    }
    if (collectingWorked && currentWorked) {
      currentWorked.steps.push(line);
      continue;
    }

    // default body paragraph
    currentSection.body.push(line);
  }

  // Flush final section
  finishCurrentSection();

  // Cleanup empties + filter useless sections
  const cleaned = sections
    .map((s) => ({
      ...s,
      body: s.body.filter((p) => p && p.trim()),
      eli5: s.eli5?.length ? s.eli5.filter((p) => p && p.trim()) : undefined,
      examples: s.examples?.length
        ? s.examples.filter((e) => e.steps && e.steps.length > 0)
        : undefined,
    }))
    .filter(
      (s) =>
        s.body.length > 0 ||
        (s.eli5 && s.eli5.length) ||
        (s.examples && s.examples.length)
    );

  return {
    intro: intro.filter(Boolean),
    sections: cleaned,
    commonMistakes: commonMistakes.filter(Boolean),
  };
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
 * - Uses a self-contained, server-safe parser (inlined + refined here from
 *   experimental dialect knowledge) with legacy-specific tuning (body list
 *   markers stripped for clean <MathText> rendering in the old components).
 * - Handles all observed edge cases from the real content/ ports (LA, stats,
 *   calculus): inline vs block ELI5, varied worked-example syntax, comment-based
 *   slugs, "Common Mistakes" vs "pitfall", stray content, partial/empty sections.
 * - Preserves exact section slugs (from {#...} or <!-- --> or generated) —
 *   critical invariant for progress tracking and deep links.
 * - Zero external runtime deps or client-module leakage.
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
  // Use our self-contained, server-safe, legacy-tuned parser.
  // No dependency on experimental client component; fully typed; robust
  // to every observed variation in the complete content/ ports.
  const parsed = parseMdxSourceForLegacy(mdxModule.mdxSource);

  // Direct map (parser already did legacy body stripping + cleanup)
  const sections: ModuleSection[] = parsed.sections.map((sec) => ({
    title: sec.title,
    section: sec.section,
    body: sec.body,
    eli5: sec.eli5,
    examples: sec.examples,
  }));

  return {
    topicId: topic.id,
    title: topic.title,
    intro: parsed.intro,
    sections,
    examples: [], // legacy top-level examples (rarely used now; per-section preferred)
    commonMistakes: parsed.commonMistakes,
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
