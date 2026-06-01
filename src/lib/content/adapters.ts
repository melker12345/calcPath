/**
 * Adapters between the new data-driven content model (content/ + FileSystemContentBundle)
 * and the legacy shapes still expected by the main application components
 * (SubjectModulePage, CourseContentsPage, etc.).
 *
 * =============================================================================
 * PHASE 1: EVOLUTIONARY INTEGRATION — TRANSITION PATTERN (read this first)
 * =============================================================================
 * Pattern (minimal + reversible):
 *   1. Real subject page (e.g. /calculus/modules/[topicId]/page.tsx) does a dynamic
 *      or server import of getLegacyModulesAndTopicsForSubject (or the per-topic variant).
 *   2. On success, feeds the *exact* legacy-shaped {modules: ModuleContent[], topics: Topic[]}
 *      into the untouched <SubjectModulePage ... /> (and same for practice etc in future).
 *   3. On any error / incomplete port, falls back to the original legacy imports.
 *   4. Result: zero diff to SubjectModulePage.tsx, its subcomponents (MathText, ModuleSectionNav,
 *      ELI5 rendering, etc.), or any of the excellent existing UI/logic.
 *
 * Benefits during migration:
 *   - Real pages gradually source from `content/` + loader (canonical).
 *   - Stable problem IDs preserved → progress, attempts, dashboard all continue working.
 *   - Section slugs from MDX headings (or explicit <!-- section: -->) match question.section exactly.
 *   - Can delete the dynamic block later when legacy shims retired; change is one import + one ternary.
 *
 * This file (adapters.ts) is the *only* place that knows about both shapes during Phase 1.
 * It must stay robust, well-tested via usage, and have zero side effects.
 *
 * Parser note: The MDX dialect parser is inlined here (self-contained) so adapters never
 * depend on client-only experimental components or use `require()`. The logic is the
 * battle-tested dialect handler from ports (supports all variations in linear-algebra,
 * statistics, and calculus content/ folders). Duplication with experimental-*.tsx is
 * temporary for the transition; consolidation happens post-Phase 1.
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
 * Internal: lightweight, pure, server-safe parser for the MDX dialect in
 * content/{subject}/topics/{topicId}/module.mdx .
 *
 * Supports (and has been validated against) all ported content:
 * - Optional YAML frontmatter (stripped)
 * - Top # Title (stripped; we use Topic.title)
 * - Intro paragraphs before first ##
 * - ## Section Title {#optional-slug}   or   ## Title \n <!-- section: slug -->
 *   (the comment lookahead is critical for some calculus ports)
 * - **ELI5**: or **ELI5** blocks (lists or paras; spans blanks in LA style)
 * - **Worked Example:** or ### Worked Examples:  (with title + step lists)
 * - Regular body content (paras, lists — original markers preserved for MdxContent parity)
 * - ## Common Mistakes  (at end of file or per some modules)
 *
 * Output is *not* the final ModuleContent — just the parsed pieces.
 * The public mdxModuleToLegacyModuleContent maps + normalizes it to the exact
 * shape SubjectModulePage has always received from legacy TS modules.
 *
 * Robustness: tolerant of minor whitespace, missing optionals, mixed list markers.
 * All section slugs are stable and must continue to exactly match Problem.section
 * values for per-section progress / deep links to keep working.
 */
function parseMdxToLegacyShape(mdxSource: string): {
  intro: string[];
  sections: Array<{
    title: string;
    section: string;
    body: string[];
    eli5?: string[];
    examples?: Array<{ title: string; steps: string[] }>;
  }>;
  commonMistakes: string[];
} {
  // Strip frontmatter
  let source = mdxSource.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, "").trim();

  // Remove the top-level # Title (we use topic.title from JSON index)
  source = source.replace(/^#\s+[^\n]+\n?/, "").trim();

  const lines = source.split(/\r?\n/);

  const intro: string[] = [];
  const sections: any[] = [];
  const commonMistakes: string[] = [];

  let currentSection: any = null;
  let inIntro = true;
  let inCommonMistakes = false;

  // State for nested blocks within a section
  let collectingEli5 = false;
  let currentEli5: string[] = [];
  let collectingWorked = false;
  let currentWorked: { title: string; steps: string[] } | null = null;

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
    let rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      // blank line: ELI5 collection intentionally spans blanks to catch following lists (LA style).
      // Regular non-list paras after ELI5 will trigger reset below.
      if (collectingWorked && currentWorked) {
        // continue
      }
      continue;
    }

    // Skip pure comment lines that are not section markers
    if (line.startsWith("<!--") && !/section:/.test(line)) {
      continue;
    }

    // H2 section heading
    const h2 = line.match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/i);
    if (h2) {
      finishCurrentSection();

      const rawTitle = h2[1].trim();
      let slug = h2[2] || toSlug(rawTitle);

      // Look ahead a couple lines for HTML comment slug marker (used in some calculus ports)
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const commentMatch = lines[j].match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i);
        if (commentMatch) {
          slug = commentMatch[1];
          break;
        }
      }

      const lower = rawTitle.toLowerCase();
      if (lower.includes("common mistake")) {
        inCommonMistakes = true;
        inIntro = false;
        currentSection = null;
        continue;
      }

      currentSection = {
        title: rawTitle,
        section: slug,
        body: [] as string[],
        eli5: undefined as string[] | undefined,
        examples: [] as any[],
      };
      inIntro = false;
      inCommonMistakes = false;
      collectingEli5 = false;
      collectingWorked = false;
      continue;
    }

    // H3 (often used for "Worked Examples")
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const h3Title = h3[1].trim().toLowerCase();
      if (h3Title.includes("worked example")) {
        collectingWorked = true;
        collectingEli5 = false;
        // title may be on this line or next bold
        const exTitleMatch = h3[1].match(/worked examples?:\s*(.*)/i);
        const exTitle = (exTitleMatch && exTitleMatch[1]) ? exTitleMatch[1].trim() : "Example";
        currentWorked = { title: exTitle || "Worked Example", steps: [] };
        if (currentSection) {
          currentSection.examples = currentSection.examples || [];
          currentSection.examples.push(currentWorked);
        }
        continue;
      }
      // other h3: treat as body for now
      if (currentSection && !collectingEli5 && !collectingWorked) {
        currentSection.body.push(h3[1].trim());
      }
      continue;
    }

    if (inCommonMistakes) {
      if (line.startsWith("- ") || line.startsWith("* ")) {
        commonMistakes.push(line.replace(/^[-*]\s*/, "").trim());
      } else if (currentSection === null) {
        // still in mistakes section
      }
      continue;
    }

    if (inIntro) {
      // Skip any remaining top title or empty
      if (!/^#/.test(line)) {
        intro.push(line);
      }
      continue;
    }

    if (!currentSection) {
      // stray content after intro before first section? attach to intro
      intro.push(line);
      continue;
    }

    // ELI5 detection (supports multiple styles seen in ports)
    const eli5Marker = line.match(/^\*\*ELI5(?:\*\*|[:\s(]|$)/i);
    if (eli5Marker) {
      collectingEli5 = true;
      collectingWorked = false;
      const afterColon = line.replace(/^\*\*ELI5\*\*[:\s]*/i, "").trim();
      if (afterColon) {
        currentEli5.push(afterColon);
      }
      continue;
    }

    // Worked example marker (stats style + LA style)
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

    // List item under current block
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
      // regular list in body — preserve original list marker syntax so MdxContent + marked can render proper <ul>/<ol>
      if (currentSection) {
        currentSection.body.push(line);
      }
      continue;
    }

    // Regular paragraph / content line
    if (collectingEli5) {
      // Non-list paragraph after an ELI5 marker signals end of the ELI5 callout block.
      // (Common pattern: **ELI5**: foo. \n\n Next technical paragraph continues the section body.)
      // Push this line to body and reset so we don't swallow the rest of the section.
      collectingEli5 = false;
      currentSection.body.push(line);
      continue;
    }
    if (collectingWorked && currentWorked) {
      currentWorked.steps.push(line);
      continue;
    }

    // default: body
    currentSection.body.push(line);
  }

  // Flush last section
  finishCurrentSection();

  // Dedupe / cleanup empty (robustness)
  const cleanedSections = sections
    .map((s) => ({
      ...s,
      body: s.body.filter((p: string) => p && p.trim()),
      eli5: s.eli5 && s.eli5.length ? s.eli5.filter((p: string) => p && p.trim()) : undefined,
      examples: s.examples && s.examples.length ? s.examples.filter((e: any) => e.steps && e.steps.length) : undefined,
    }))
    .filter((s) => s.body.length > 0 || (s.eli5 && s.eli5.length) || (s.examples && s.examples.length));

  return {
    intro: intro.filter(Boolean),
    sections: cleanedSections,
    commonMistakes: commonMistakes.filter(Boolean),
  };
}

/**
 * Parses a raw MDX module (from content/*/topics/*/module.mdx) into the *exact*
 * legacy ModuleContent shape that SubjectModulePage (and CourseContentsPage etc.)
 * have always expected.
 *
 * This is the key enabler for Phase 1: the excellent existing UI + logic in
 * SubjectModulePage remains 100% untouched. We just swap the data it receives.
 *
 * @param mdxModule - from FileSystemContentBundle.mdxModules (raw mdxSource)
 * @param topic - from same bundle (provides stable id/title/description)
 */
export function mdxModuleToLegacyModuleContent(
  mdxModule: MdxModule,
  topic: Topic
): ModuleContent {
  // Self-contained parser (no require, no client component dep, pure + robust).
  const parsed = parseMdxToLegacyShape(mdxModule.mdxSource);

  // Map to the exact legacy shape (1:1 field compatibility with old *-modules/*.ts)
  const sections: ModuleSection[] = parsed.sections.map((sec: any) => ({
    title: sec.title,
    section: sec.section || toSlug(sec.title),
    body: sec.body || [],
    eli5: sec.eli5,
    examples: sec.examples as WorkedExample[] | undefined,
  }));

  return {
    topicId: topic.id,
    title: topic.title,
    intro: parsed.intro || [],
    sections,
    examples: [], // legacy top-level examples (rarely used now; per-section ones live in sections[].examples)
    commonMistakes: parsed.commonMistakes || [],
  };
}

/**
 * Convenience: given subject + topicId, return *one* legacy-shaped module (or null).
 * Used for targeted deep-link scenarios or testing.
 */
export async function getLegacyModuleContentForTopic(
  subjectSlug: string,
  topicId: string
): Promise<ModuleContent | null> {
  try {
    const { getFileSystemContentBundle } = await import("./loader");
    const bundle = await getFileSystemContentBundle(subjectSlug);

    const topic = bundle.topics.find((t) => t.id === topicId);
    const mdxModule = bundle.mdxModules.find((m) => m.topicId === topicId);

    if (!topic || !mdxModule) {
      return null;
    }

    return mdxModuleToLegacyModuleContent(mdxModule, topic);
  } catch {
    // Silent fail = safe for transition fallbacks
    return null;
  }
}

/**
 * PRIMARY HELPER FOR REAL MODULE PAGES (Phase 1 pattern).
 *
 * Returns the complete arrays needed by SubjectModulePage (and similar chrome)
 * sourced entirely from the new FileSystemContentBundle, converted via the
 * adapter to the exact legacy ModuleContent + Topic shapes.
 *
 * Returns null on any failure (incomplete port, load error, etc.) so caller
 * can transparently fall back to legacy imports. Zero breaking changes.
 *
 * This is what enables a *minimal* change in a real page like the calculus
 * [topicId] module page: ~5 lines of try { const data = await get... ; if(data) set } catch{}
 *
 * Absolute stability contract: the returned modules[].sections[].section values
 * are derived from the same MDX headings/comments that were used to author the
 * questions.json files. Progress tracking etc. are unaffected.
 */
export async function getLegacyModulesAndTopicsForSubject(
  subjectSlug: string
): Promise<{ modules: ModuleContent[]; topics: Topic[] } | null> {
  try {
    const { getFileSystemContentBundle } = await import("./loader");
    const bundle = await getFileSystemContentBundle(subjectSlug);

    const convertedModules: ModuleContent[] = [];
    for (const topic of bundle.topics) {
      const mdxMod = bundle.mdxModules.find((m) => m.topicId === topic.id);
      if (mdxMod) {
        convertedModules.push(mdxModuleToLegacyModuleContent(mdxMod, topic));
      }
    }

    if (convertedModules.length === 0) {
      return null;
    }

    return {
      modules: convertedModules,
      topics: bundle.topics,
    };
  } catch {
    // Safe silent fallback path — the hallmark of evolutionary integration.
    return null;
  }
}
