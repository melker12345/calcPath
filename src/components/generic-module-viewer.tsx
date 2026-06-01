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
  // Strip frontmatter
  const withoutFrontmatter = mdxSource.replace(/^---\s*[\s\S]*?---\s*/, "");

  // Remove leading top-level # Title (we render h1 from prop; matches real + advanced parser)
  const withoutTitle = withoutFrontmatter.replace(/^#\s+[^\n]+\n?/, "").trim();

  // Split into blocks by headings (## or #) while keeping the heading
  const blocks: Array<{ type: "heading" | "paragraph" | "eli5" | "list"; content: string; level?: number; id?: string }> = [];

  const lines = withoutTitle.split(/\r?\n/);
  let currentBlock: string[] = [];
  let currentType: "paragraph" | "heading" | "eli5" = "paragraph";
  let currentLevel = 0;
  let currentId: string | undefined;

  const flush = () => {
    if (currentBlock.length === 0) return;
    const text = currentBlock.join("\n").trim();
    if (text) {
      blocks.push({ type: currentType, content: text, level: currentLevel || undefined, id: currentId });
    }
    currentBlock = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+?)(?:\s*\{#([^}]+)\})?\s*$/);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      let headingText = headingMatch[2].trim();
      currentId = headingMatch[3] || slugify(headingText);
      currentLevel = level;
      currentType = "heading";
      currentBlock = [headingText];
      continue;
    }

    if (/^\*\*ELI5\*\*/i.test(line.trim()) || /^ELI5$/i.test(line.trim())) {
      flush();
      currentType = "eli5";
      currentLevel = 0;
      currentId = undefined;
      currentBlock = [line.replace(/^\*\*ELI5\*\*\s*/i, "").trim()];
      continue;
    }

    if (line.trim() === "" && currentType !== "heading") {
      flush();
      currentType = "paragraph";
      continue;
    }

    // list items or continue paragraph
    currentBlock.push(line);
  }
  flush();

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Derive section nav from parsed blocks (headings become nav items; special case for Common Mistakes)
  const navItems = useMemo(() => {
    const items: { id: string; label: string }[] = [{ id: "intro", label: "Introduction" }];
    let hasMistakes = false;
    for (const b of blocks) {
      if (b.type === "heading" && b.id && b.content) {
        const label = b.content;
        const lower = label.toLowerCase();
        if (lower.includes("common mistake")) {
          hasMistakes = true;
          // will add at end
        } else {
          items.push({ id: b.id, label });
        }
      }
    }
    if (hasMistakes) {
      items.push({ id: "mistakes", label: "Common Mistakes" });
    }
    return items;
  }, [blocks]);

  // Basic inline formatting + math for paragraph content
  function renderInline(text: string) {
    // Replace **bold** with <strong> (simple, non-nested)
    const withBold = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <MathText text={withBold} />;
  }

  const renderBlock = (block: (typeof blocks)[number], idx: number) => {
    if (block.type === "heading") {
      // Match real SubjectModulePage h2 styles + scroll-mt for anchors (h1 suppressed)
      const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
      const className =
        block.level === 1
          ? "mt-8 mb-3 text-2xl font-semibold tracking-tight theme-text scroll-mt-24"
          : block.level === 2
          ? "mb-4 text-2xl font-semibold theme-text scroll-mt-20"
          : "mt-4 mb-1.5 text-lg font-semibold theme-text scroll-mt-16";
      return (
        <Tag id={block.id} key={idx} className={className}>
          {renderInline(block.content)}
        </Tag>
      );
    }

    if (block.type === "eli5") {
      // Match ELI5 box styling from real subject module pages + ExperimentalGeneric
      return (
        <div key={idx} className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Explain Like I&apos;m 5
          </div>
          <div className="space-y-3 text-sm leading-relaxed theme-text-secondary">
            {block.content.split(/\n\n+/).map((p, i) => (
              <p key={i} className="mb-2 last:mb-0">{renderInline(p.trim())}</p>
            ))}
          </div>
        </div>
      );
    }

    // paragraph (default) — delegate to MdxContent for full markdown (lists, emphasis, code, links) + consistent math/typography
    return (
      <MdxContent
        key={idx}
        mdxSource={block.content}
        className="prose prose-stone dark:prose-invert max-w-none text-[15px] leading-relaxed"
      />
    );
  };

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

          {/* Content from lightweight parser + MdxContent (intro flows from first blocks) */}
          <div className="mt-6">
            {blocks.map(renderBlock)}
          </div>

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
