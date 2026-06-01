"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MathText } from "@/components/math-text";
import { MdxContent } from "@/components/mdx-content";
import { ModuleSectionNav } from "@/components/module-section-nav";
import { SubjectBreadcrumbs } from "@/components/subject-breadcrumbs";
import { VoteFeedback } from "@/components/vote-feedback";

/**
 * Very lightweight MDX-ish renderer for the experimental /x/ area.
 *
 * Goals for this slice:
 * - Prove we can surface the raw mdxSource from FileSystemContentBundle.
 * - Handle common patterns in our content/ *.mdx files (headings with {#slug}, paragraphs, **ELI5**, LaTeX).
 * - Integrates <MdxContent> for paragraphs (richer lists/em/links/code + display math + consistent theming).
 * - Now matches real SubjectModulePage structure: SubjectBreadcrumbs + back link, ModuleSectionNav,
 *   ELI5/Examples/Mistakes with identical classes, VoteFeedback, prev/next + Practice btns using btn-* .
 * - Consistent max-w-[760px], scroll-mt-20, prose, heading styles.
 *
 * Still uses only lightweight line parser + MdxContent (no full MDX remote, no touching legacy files).
 */
export function GenericModuleViewer({
  topicId,
  title,
  mdxSource,
  subjectSlug,
  subjectLabel = "Course",
  prevTopic = null,
  nextTopic = null,
  description,
  backHref,
}: {
  topicId: string;
  title: string;
  mdxSource: string;
  subjectSlug: string;
  subjectLabel?: string;
  prevTopic?: { id: string; title: string } | null;
  nextTopic?: { id: string; title: string } | null;
  description?: string;
  backHref?: string;
}) {
  // Strip frontmatter + leading # title (lightweight, no full compiler)
  const withoutFrontmatter = mdxSource.replace(/^---\s*[\s\S]*?---\s*/, "");
  const withoutTitle = withoutFrontmatter.replace(/^#\s+[^\n]+\n?/, "").trim();

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Lightweight structured parser (section-aware for ELI5 per section, Worked Examples cards, Common Mistakes)
  // Still purely from MDX source + FileSystemContentBundle; no external parser or legacy imports.
  const parsed = useMemo(() => {
    const lines = withoutTitle.split(/\r?\n/);
    const intro: string[] = [];
    const sections: Array<{
      title: string;
      id: string;
      body: string[];
      eli5?: string[];
      examples?: Array<{ title: string; steps: string[] }>;
    }> = [];
    const commonMistakes: string[] = [];

    let currentSection: any = null;
    let inIntro = true;
    let inMistakes = false;

    let collectingEli5 = false;
    let currentEli5: string[] = [];
    let collectingWorked = false;
    let currentWorked: { title: string; steps: string[] } | null = null;

    const finishSection = () => {
      if (currentSection) {
        if (currentEli5.length > 0) currentSection.eli5 = currentEli5.filter(Boolean);
        sections.push(currentSection);
      }
      currentSection = null;
      collectingEli5 = false;
      currentEli5 = [];
      collectingWorked = false;
      currentWorked = null;
    };

    for (let i = 0; i < lines.length; i++) {
      let raw = lines[i];
      const line = raw.trim();

      if (!line) {
        if (collectingEli5 || collectingWorked) {
          // allow lists to span blanks
        }
        continue;
      }
      if (line.startsWith("<!--") && !/section:/.test(line)) continue;

      // H2 section
      const h2 = line.match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/i);
      if (h2) {
        finishSection();
        const rawTitle = h2[1].trim();
        const id = h2[2] || slugify(rawTitle);
        const lower = rawTitle.toLowerCase();
        if (lower.includes("common mistake")) {
          inMistakes = true;
          inIntro = false;
          currentSection = null;
          continue;
        }
        currentSection = {
          title: rawTitle,
          id,
          body: [] as string[],
          eli5: undefined as string[] | undefined,
          examples: [] as any[],
        };
        inIntro = false;
        inMistakes = false;
        collectingEli5 = false;
        collectingWorked = false;
        continue;
      }

      // H3 Worked Examples
      const h3 = line.match(/^###\s+(.+)$/);
      if (h3) {
        const h3l = h3[1].trim().toLowerCase();
        if (h3l.includes("worked example")) {
          collectingWorked = true;
          collectingEli5 = false;
          const exTitleMatch = h3[1].match(/worked examples?:\s*(.*)/i);
          const exTitle = exTitleMatch && exTitleMatch[1] ? exTitleMatch[1].trim() : "Example";
          currentWorked = { title: exTitle || "Worked Example", steps: [] };
          if (currentSection) {
            currentSection.examples = currentSection.examples || [];
            currentSection.examples.push(currentWorked);
          }
          continue;
        }
        if (currentSection && !collectingEli5 && !collectingWorked) {
          currentSection.body.push(h3[1].trim());
        }
        continue;
      }

      if (inMistakes) {
        if (line.startsWith("- ") || line.startsWith("* ")) {
          commonMistakes.push(line.replace(/^[-*]\s*/, "").trim());
        }
        continue;
      }

      if (inIntro) {
        if (!/^#/.test(line)) intro.push(line);
        continue;
      }
      if (!currentSection) {
        intro.push(line);
        continue;
      }

      // ELI5
      const eli5Marker = line.match(/^\*\*ELI5(?:\*\*|[:\s(]|$)/i);
      if (eli5Marker) {
        collectingEli5 = true;
        collectingWorked = false;
        const after = line.replace(/^\*\*ELI5\*\*[:\s]*/i, "").trim();
        if (after) currentEli5.push(after);
        continue;
      }

      // **Worked Example marker (alternative syntax)
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

      // List items (under ELI5, worked, or body)
      if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
        const item = line.replace(/^[-*\d.]+\s*/, "").trim();
        if (collectingEli5) {
          currentEli5.push(item);
          continue;
        }
        if (collectingWorked && currentWorked) {
          currentWorked.steps.push(item);
          continue;
        }
        if (currentSection) currentSection.body.push(line); // preserve md list syntax for MdxContent
        continue;
      }

      // Regular content line
      if (collectingEli5) {
        collectingEli5 = false;
        if (currentSection) currentSection.body.push(line);
        continue;
      }
      if (collectingWorked && currentWorked) {
        currentWorked.steps.push(line);
        continue;
      }
      if (currentSection) currentSection.body.push(line);
    }

    finishSection();

    const cleaned = sections
      .map((s) => ({
        ...s,
        body: s.body.filter((p: string) => p && p.trim()),
        eli5: s.eli5 && s.eli5.length ? s.eli5.filter((p: string) => p && p.trim()) : undefined,
        examples: s.examples && s.examples.length ? s.examples.filter((e: any) => e.steps && e.steps.length) : undefined,
      }))
      .filter((s) => s.body.length > 0 || (s.eli5 && s.eli5.length) || (s.examples && s.examples.length));

    return {
      intro: intro.filter(Boolean),
      sections: cleaned,
      commonMistakes: commonMistakes.filter(Boolean),
    };
  }, [mdxSource]);

  // navItems derived directly from parsed (no extra useMemo needed; matches real SubjectModulePage derivation logic exactly)
  const navItems = (() => {
    const items = [{ id: "intro", label: "Introduction" }];
    parsed.sections.forEach((sec) => {
      items.push({ id: sec.id || slugify(sec.title), label: sec.title });
    });
    if (parsed.commonMistakes.length > 0) {
      items.push({ id: "mistakes", label: "Common Mistakes" });
    }
    return items;
  })();

  // Inline math/bold helper (for ELI5 + mistakes, which use MathText like real page)
  function renderInline(text: string) {
    const withBold = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <MathText text={withBold} />;
  }

  // Back href for x area (experimental subject "contents")
  const effectiveBackHref = backHref || `/x/${subjectSlug}`;

  return (
    <>
      <ModuleSectionNav items={navItems} />
      <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="min-w-0">
          {/* Header chrome matching SubjectModulePage exactly */}
          <div className="mb-6 border-b border-[var(--border)] pb-5 sm:mb-8">
            <SubjectBreadcrumbs
              subjectSlug={subjectSlug}
              subjectLabel={subjectLabel}
              currentTopicTitle={title}
            />
            <Link
              className="text-sm text-blue-800 hover:underline"
              href={effectiveBackHref}
              data-no-print
            >
              Back to {subjectLabel} contents
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight theme-text sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-base leading-7 theme-text-secondary">{description}</p>
            )}
          </div>

          {/* Introduction (wrapped for scroll-mt + h2 like real SubjectModulePage) */}
          {parsed.intro.length > 0 && (
            <div id="intro" className="scroll-mt-20">
              <h2 className="mb-4 text-2xl font-semibold theme-text">Introduction</h2>
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <MdxContent mdxSource={parsed.intro.join("\n\n")} />
              </div>
            </div>
          )}

          {/* Sections with ELI5 (rounded-2xl surface-2), Worked Example cards (rounded-xl surface), per real */}
          {parsed.sections.map((section, sIdx) => {
            const sectionId = section.id || slugify(section.title);
            return (
              <div key={sIdx} id={sectionId} className="scroll-mt-20 mt-12">
                <h2 className="mb-4 text-2xl font-semibold theme-text">{section.title}</h2>

                <div className="prose prose-stone dark:prose-invert max-w-none">
                  <MdxContent mdxSource={section.body.join("\n\n")} />
                </div>

                {section.eli5 && section.eli5.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                      Explain Like I&apos;m 5
                    </div>
                    <div className="space-y-3 text-sm leading-relaxed theme-text-secondary">
                      {section.eli5.map((paragraph: string, index: number) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {renderInline(paragraph)}
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
                              {renderInline(step)}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Common Mistakes (exact ul + dot structure + classes from SubjectModulePage) */}
          {parsed.commonMistakes.length > 0 && (
            <div id="mistakes" className="scroll-mt-20 mt-12">
              <h2 className="mb-4 text-2xl font-semibold theme-text">Common Mistakes</h2>
              <ul className="space-y-3 text-sm">
                {parsed.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3 theme-text-secondary">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-muted)]" />
                    {renderInline(mistake)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom navigation: prev/next topic + Practice using exact btn-secondary / btn-primary from real pages */}
          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-between">
            {prevTopic ? (
              <Link
                href={`/x/${subjectSlug}/modules/${prevTopic.id}`}
                className="btn-secondary inline-flex w-full justify-center sm:w-auto"
              >
                ← {prevTopic.title}
              </Link>
            ) : (
              <div />
            )}

            {nextTopic ? (
              <Link
                href={`/x/${subjectSlug}/modules/${nextTopic.id}`}
                className="btn-primary inline-flex w-full justify-center sm:w-auto"
              >
                {nextTopic.title} →
              </Link>
            ) : (
              <Link
                href={`/x/${subjectSlug}/practice/${topicId}`}
                className="btn-primary inline-flex w-full justify-center sm:w-auto"
              >
                Practice this topic →
              </Link>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <VoteFeedback targetType="module" targetId={topicId} />
          </div>
        </div>
      </div>
    </>
  );
}
