"use client";

/**
 * EXPERIMENTAL / ISOLATED: Generic, data-driven Module / Explanation page renderer.
 *
 * Consumes content from FileSystemContentBundle (specifically an MdxModule's raw mdxSource
 * + the matching Topic from the bundle).
 *
 * Goal: Replace legacy per-subject SubjectModulePage + ModuleContent shapes with a generic
 * implementation driven by the new content/ JSON+MDX data.
 *
 * Current implementation:
 * - Basic line-based parser for the MDX dialect used in content/*/topics/*/module.mdx
 *   (supports variations seen in linear-algebra, statistics, calculus ports).
 * - Renders using existing MathText + BlockMath (no new deps).
 * - Supports: intro, ## sections (with {#slug} or <!-- section: slug --> anchors),
 *   **ELI5** / **ELI5**: blocks (inline or following), Worked Examples (### or **Worked Example:**),
 *   ## Common Mistakes lists.
 * - Reuses visual patterns + components from the legacy SubjectModulePage for consistency
 *   (ELI5 callout box, example cards, practice links, nav, VoteFeedback, prev/next).
 * - Derives TOC nav items.
 *
 * NOT YET:
 * - Full MDX compilation (see PLAN below).
 * - Server component + next-mdx-remote (would require dep + server-only loading).
 * - Integrated with real routes / bundles (this is isolated experimental).
 * - Handling of all MDX features (tables, images, custom components, import, JSX in MDX).
 * - SEO metadata generation (would be done by caller in a real page).
 * - Deep integration with per-section progress (uses section slugs same as legacy).
 *
 * MDX RENDERING PLAN (for when we decide to productize):
 * 1. Add dependency: `next-mdx-remote` (or `mdx-bundler` for compile-time).
 *    - `npm install next-mdx-remote`
 * 2. Make a Server Component wrapper (e.g. MdxModuleServerRenderer) that does:
 *    const { MDXRemote } = await import('next-mdx-remote/rsc');
 *    <MDXRemote source={strippedMdxSource} components={customComponents} />
 * 3. Provide custom MDX components map for:
 *    - ELI5 box (styled div), WorkedExample card, etc. (so authors can use <ELI5> in MDX later).
 *    - Math: integrate rehype-katex + remark-math plugins (via options) OR keep hybrid with MathText.
 * 4. Update next.config.ts if needed (no major changes for remote).
 * 5. Loader stays raw mdxSource (good); compilation happens at render time (or build with cache).
 * 6. Benefits: full markdown + JSX + future custom embeds, LaTeX via plugins, etc.
 * 7. Migration: keep this basic parser as fallback or for client-only previews.
 *
 * This file lives in components/ (named with "experimental-") to keep it isolated.
 * Do not import from production pages or legacy paths yet.
 * When ready, we can promote + wire generic dynamic routes.
 *
 * Usage (in a future experimental dev-only page or test harness):
 *   import { getFileSystemContentBundle } from "@/lib/content/loader";
 *   const bundle = await getFileSystemContentBundle("linear-algebra");
 *   const topic = bundle.topics.find(t => t.id === "vectors")!;
 *   const mdxMod = bundle.mdxModules.find(m => m.topicId === "vectors")!;
 *   <ExperimentalGenericMdxModuleExplanation
 *     mdxSource={mdxMod.mdxSource}
 *     topic={topic}
 *     subjectSlug="linear-algebra"
 *     subjectLabel="Linear Algebra"
 *   />
 */

import Link from "next/link";
import { useMemo } from "react";
import { MathText } from "@/components/math-text";
import { ModuleSectionNav } from "@/components/module-section-nav";
import { VoteFeedback } from "@/components/vote-feedback";
import { BlockMath } from "react-katex";
import type { Topic } from "@/lib/content/schema"; // Use new schema types (Topic shape is stable)

type ExperimentalGenericMdxModuleExplanationProps = {
  mdxSource: string;
  topic: Topic;
  subjectSlug: string;
  subjectLabel?: string;
  // Optional for nav footer (in real usage, derive from bundle.topics)
  prevTopic?: { id: string; title: string } | null;
  nextTopic?: { id: string; title: string } | null;
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Lightweight parser for our MDX "dialect".
 * Returns shape close to legacy ModuleContent but derived purely from mdxSource.
 * Handles observed variations across content/ ports.
 */
function parseMdxToStructured(
  mdxSource: string
): {
  intro: string[];
  sections: Array<{
    title: string;
    section: string; // slug for anchors + practice links + question matching
    body: string[];
    eli5?: string[];
    examples?: Array<{ title: string; steps: string[] }>;
  }>;
  commonMistakes: string[];
} {
  // Strip frontmatter
  let source = mdxSource.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, "").trim();

  // Remove the top-level # Title (we use topic.title from JSON)
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
      // regular list in body
      if (currentSection) {
        currentSection.body.push(itemText);
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

  // Dedupe / cleanup empty
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

// Export parser for isolated testing / future thin-slice harnesses (no React needed)
export { parseMdxToStructured as experimentalParseMdxModule };

export function ExperimentalGenericMdxModuleExplanation({
  mdxSource,
  topic,
  subjectSlug,
  subjectLabel = "Course",
  prevTopic = null,
  nextTopic = null,
}: ExperimentalGenericMdxModuleExplanationProps) {
  const parsed = useMemo(() => parseMdxToStructured(mdxSource), [mdxSource]);

  const navItems = useMemo(() => {
    const items = [{ id: "intro", label: "Introduction" }];
    parsed.sections.forEach((sec) => {
      items.push({ id: sec.section || toSlug(sec.title), label: sec.title });
    });
    if (parsed.commonMistakes.length > 0) {
      items.push({ id: "mistakes", label: "Common Mistakes" });
    }
    return items;
  }, [parsed]);

  // Fallback if parsing produced nothing useful
  const hasContent = parsed.intro.length > 0 || parsed.sections.length > 0;

  if (!hasContent) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
<<<<<<< HEAD
        <p className="text-sm theme-text-muted">Unable to parse module content from MDX source.</p>
=======
        <p className="text-sm theme-text-secondary">Unable to parse module content from MDX source.</p>
>>>>>>> agent-visual-consistency
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer">Raw MDX source (debug)</summary>
          <pre className="mt-2 overflow-auto rounded bg-[var(--surface-2)] p-3 text-[10px]">{mdxSource.slice(0, 2000)}...</pre>
        </details>
      </div>
    );
  }

  const topicIndexForNav = 0; // caller should provide real prev/next if wanted
  const showPrev = prevTopic;
  const showNext = nextTopic;

  return (
    <>
      <ModuleSectionNav items={navItems} />
      <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="min-w-0">
          <div className="mb-6 border-b border-[var(--border)] pb-5 sm:mb-8">
            <Link
              className="text-sm text-blue-800 hover:underline dark:text-[var(--accent)]"
              href={`/${subjectSlug}/modules`}
              data-no-print
            >
              Back to {subjectLabel} contents
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
              {topic.title}
            </h1>
            <p className="mt-3 text-base leading-7 theme-text-secondary">{topic.description}</p>
          </div>

          {/* Introduction */}
          {parsed.intro.length > 0 && (
            <div id="intro" className="scroll-mt-20">
              <h2 className="mb-4 text-2xl font-semibold theme-text">Introduction</h2>
              <div className="prose prose-stone dark:prose-invert max-w-none">
                {parsed.intro.map((paragraph, index) => (
                  <p key={index} className="mb-3 last:mb-0">
                    <MathText text={paragraph} />
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {parsed.sections.map((section, sIdx) => {
            const sectionId = section.section || toSlug(section.title);
            return (
              <div key={sIdx} id={sectionId} className="scroll-mt-20 mt-12">
                <h2 className="mb-4 text-2xl font-semibold theme-text">{section.title}</h2>

                <div className="prose prose-stone dark:prose-invert max-w-none">
                  {section.body.map((paragraph: string, index: number) => {
                    const trimmed = paragraph.trim();
                    // Standalone display math ($$ or single $ line that is purely math)
                    if ((trimmed.startsWith("$$") && trimmed.endsWith("$$")) || (trimmed.startsWith("$") && trimmed.endsWith("$") && trimmed.length > 2 && !trimmed.slice(1, -1).includes("$"))) {
                      const math = trimmed.replace(/^\$\$?|\$\$?$/g, "");
                      return (
                        <div key={index} className="my-4">
                          <BlockMath math={math} />
                        </div>
                      );
                    }
                    return (
                      <p key={index} className="mb-3 last:mb-0">
                        <MathText text={paragraph} />
                      </p>
                    );
                  })}
                </div>

                {section.eli5 && section.eli5.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                      Explain Like I'm 5
                    </div>
                    <div className="space-y-3 text-sm leading-relaxed theme-text-secondary">
                      {section.eli5.map((paragraph: string, index: number) => (
                        <p key={index} className="mb-2 last:mb-0">
                          <MathText text={paragraph} />
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {section.examples && section.examples.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                      Example{section.examples.length > 1 ? "s" : ""}
                    </div>
                    {section.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
                      >
                        <div className="mb-3 font-semibold theme-text">{example.title}</div>
                        <ol className="list-decimal space-y-2 pl-5 text-sm">
                          {example.steps.map((step: string, stepIdx: number) => (
                            <li key={stepIdx} className="theme-text-secondary">
                              <MathText text={step} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}

                {/* Per-section practice link (uses stable section slug) */}
                <div className="mt-4">
                  <Link
                    href={`/${subjectSlug}/practice/${topic.id}?section=${section.section || sectionId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline dark:text-[var(--accent)]"
                  >
                    Practice questions for this section →
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Common Mistakes */}
          {parsed.commonMistakes.length > 0 && (
            <div id="mistakes" className="scroll-mt-20 mt-12">
              <h2 className="mb-4 text-2xl font-semibold theme-text">Common Mistakes</h2>
              <ul className="space-y-3 text-sm">
                {parsed.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3 theme-text-secondary">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-muted)]" />
                    <MathText text={mistake} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation footer (simplified; real caller supplies real siblings) */}
          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between">
            {showPrev ? (
              <Link
                href={`/${subjectSlug}/modules/${showPrev.id}`}
                className="btn-secondary inline-flex w-full justify-center sm:w-auto"
              >
                ← {showPrev.title}
              </Link>
            ) : (
              <div />
            )}

            {showNext ? (
              <Link
                href={`/${subjectSlug}/modules/${showNext.id}`}
                className="btn-primary inline-flex w-full justify-center sm:w-auto"
              >
                {showNext.title} →
              </Link>
            ) : (
              <Link
                href={`/${subjectSlug}/practice/${topic.id}`}
                className="btn-primary inline-flex w-full justify-center sm:w-auto"
              >
                Practice this topic →
              </Link>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <VoteFeedback targetType="module" targetId={topic.id} />
          </div>

          {/* Debug: show that we are using MDX data (remove in production) */}
          <div className="mt-10 border-t pt-4 text-[10px] text-[var(--text-muted)] opacity-60">
            Experimental renderer • sourced from <code>content/{subjectSlug}/topics/{topic.id}/module.mdx</code> via FileSystemContentBundle
          </div>
        </div>
      </div>
    </>
  );
}
