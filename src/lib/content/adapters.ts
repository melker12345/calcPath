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
import type { ModuleContent, ModuleSection, WorkedExample } from "@/lib/modules";
import type { Topic } from "@/lib/shared-types";

import { toSlug, stripFrontmatterAndH1 } from "./mdx";

type ParsedSection = {
  title: string;
  section: string;
  body: string[];
  eli5?: string[];
  examples?: WorkedExample[];
};

/**
 * Strip raw HTML comment lines (e.g. <!-- section: xxx --> markers or any others).
 * Used defensively in cleaned output so that no raw comments ever remain in .body,
 * .intro, commonMistakes, eli5, etc. (markers are metadata only).
 */
function stripComments(texts: string[]): string[] {
  return texts.filter((t) => t && t.trim() && !t.trim().startsWith("<!--"));
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
 * - Resilient auto-detect: also populates eli5/examples from variants like "### Example", "Step 1:", "ELI5" etc. even without exact bold markers (for thin/varied new-subject MDX; recommended markers still encouraged for authoring).
 * - Regular body content (paras, lists — original markers preserved for MdxContent parity)
 * - ## Common Mistakes (at end of file or per some modules)
 *
 * Section comment markers (<!-- section: xxx -->) are inspected via lookahead
 * (for stable slugs) but ALWAYS skipped thereafter and never appear in .body,
 * intro, etc. (use stripComments helper on final arrays as guard).
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
  // Use shared strip (frontmatter + top # Title). We use topic.title from JSON index.
  const source = stripFrontmatterAndH1(mdxSource);
  const lines = source.split(/\r?\n/);

  const intro: string[] = [];
  const sections: ParsedSection[] = [];
  const commonMistakes: string[] = [];

  let currentSection: ParsedSection | null = null;
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
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      // blank line: ELI5 collection intentionally spans blanks to catch following lists (LA style).
      // Regular non-list paras after ELI5 will trigger reset below.
      if (collectingWorked && currentWorked) {
        // continue
      }
      continue;
    }

    // ALWAYS skip pure comment lines, including section markers (<!-- section: xxx -->).
    // Markers are used *only* in the H2 lookahead (immediately after detecting heading)
    // to capture stable slugs for ?section= / progress; they must never reach body arrays.
    if (line.startsWith("<!--")) {
      continue;
    }

    // H2 section heading
    const h2 = line.match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/i);
    if (h2) {
      finishCurrentSection();

      const rawTitle = h2[1].trim();
      const provided = h2[2];
      let slug = provided || toSlug(rawTitle);

      // Use shared lookahead for <!-- section: ... --> (exact same logic as extractMdxSections / validate).
      // This guarantees the section slug here matches what derive + questions expect.
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const cm = lines[j].match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i);
        if (cm) {
          slug = cm[1];
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
        examples: [] as WorkedExample[],
      };
      inIntro = false;
      inCommonMistakes = false;
      collectingEli5 = false;
      collectingWorked = false;
      continue;
    }

    // H3 (often used for "Worked Examples")
    // Resilient: also catch plain "### Example", "### Worked Example", etc. for auto populating .examples[] even if ** marker absent.
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const h3Title = h3[1].trim().toLowerCase();
      if (h3Title.includes("worked") || h3Title.includes("example")) {
        collectingWorked = true;
        collectingEli5 = false;
        // title may be on this line or next bold
        const exTitleMatch = h3[1].match(/(?:worked\s+)?examples?:\s*(.*)/i);
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
      } else if (line.trim() && currentSection === null) {
        // continuation line for the last common mistake (supports multi-line grouping in MDX source)
        if (commonMistakes.length > 0) {
          const lastIdx = commonMistakes.length - 1;
          commonMistakes[lastIdx] += " " + line.trim();
        }
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

    // Resilient ELI5 auto-detect: catch variants without exact **ELI5 bold (for thin/varied MDX in new subjects).
    // Prevents missing ELI5 cards in UI even if authoring used slightly different heading.
    const eli5Loose = line.match(/^(?:###\s*)?(ELI5|In plain English|Simple explanation|Explain like I'm 5|ELI5 explanation)\s*[:\-]?\s*(.*)$/i);
    if (eli5Loose && !collectingEli5) {
      collectingEli5 = true;
      collectingWorked = false;
      const after = (eli5Loose[2] || "").trim();
      if (after) {
        currentEli5.push(after);
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

    // Resilient auto-detect for worked / example blocks even without exact "**Worked Example:**" bold marker.
    // E.g. after "### Example", lines starting "Step 1:", "Example:", or example-ish content.
    // This ensures .examples[] is populated (for nice UI cards) on varied/thin MDX from high-volume subjects,
    // so "recommended" markers don't silently degrade UX. Conservative to avoid swallowing regular body lists.
    if (!collectingWorked && !collectingEli5 && currentSection) {
      const lowLine = line.toLowerCase();
      if (/\bstep\s*1\s*[:.]/.test(lowLine) || /^example\s*[:.]/.test(lowLine) || /\bexample\s*\d*\s*[:.]/.test(lowLine)) {
        collectingWorked = true;
        collectingEli5 = false;
        const titleFromLine = line.replace(/^\*\*|\*\*|Step\s*1\s*[:.]\s*|Example\s*[:.]\s*/gi, "").trim();
        currentWorked = { title: titleFromLine.substring(0, 80) || "Example", steps: [] };
        currentSection.examples = currentSection.examples || [];
        currentSection.examples.push(currentWorked);
        // Include the starter text as first step content if non-trivial
        if (titleFromLine || !/^\d/.test(line)) {
          currentWorked.steps.push(line.replace(/^Step\s*1\s*[:.]\s*|^Example\s*[:.]\s*/i, "").trim() || line);
        }
        continue;
      }
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
      // Resilience: if this interrupting para looks like start of example, auto-start worked collection instead of body.
      if (/\bstep\s*1\s*[:.]/.test(line.toLowerCase()) || /^example/i.test(line) || /example\s*\d/i.test(line)) {
        collectingWorked = true;
        currentWorked = { title: "Example", steps: [line] };
        if (currentSection) {
          currentSection.examples = currentSection.examples || [];
          currentSection.examples.push(currentWorked);
        }
      } else {
        currentSection.body.push(line);
      }
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

  // Dedupe / cleanup empty (robustness). Use stripComments to guarantee no raw <!-- section: --> or other comments remain in any output arrays.
  const cleanedSections = sections
    .map((s) => ({
      ...s,
      body: stripComments(s.body),
      eli5: s.eli5 && s.eli5.length ? stripComments(s.eli5) : undefined,
      examples: s.examples && s.examples.length ? s.examples.filter((e) => e.steps && e.steps.length) : undefined,
    }))
    .filter((s) => s.body.length > 0 || (s.eli5 && s.eli5.length) || (s.examples && s.examples.length));

  return {
    intro: stripComments(intro),
    sections: cleanedSections,
    commonMistakes: stripComments(commonMistakes),
  };
}

/**
 * Parses a raw MDX module (from content/[star]/topics/[star]/module.mdx) into the *exact*
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
  const sections: ModuleSection[] = parsed.sections.map((sec) => ({
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
