"use client";

import Link from "next/link";
import { MathText } from "@/components/math-text";

/**
 * Very lightweight MDX-ish renderer for the experimental /x/ area.
 *
 * Goals for this slice:
 * - Prove we can surface the raw mdxSource from FileSystemContentBundle.
 * - Handle common patterns in our content/ *.mdx files (headings with {#slug}, paragraphs, **ELI5**, LaTeX).
 * - Use existing <MathText> so $...$ and display math render without new deps.
 *
 * Limitations (documented in NOTES.md):
 * - Not a full MDX compiler (no custom components, limited markdown).
 * - No remark/rehype pipeline yet.
 * - For production generic pages we will later add next-mdx-remote or equivalent.
 * - Sections/anchors partially supported via id extraction.
 */
export function GenericModuleViewer({
  topicId,
  title,
  mdxSource,
  subjectSlug,
  subjectLabel,
  backHref,
}: {
  topicId: string;
  title: string;
  mdxSource: string;
  subjectSlug: string;
  subjectLabel?: string;
  backHref?: string;
}) {
  // Strip frontmatter
  const withoutFrontmatter = mdxSource.replace(/^---\s*[\s\S]*?---\s*/, "");

  // Split into blocks by headings (## or #) while keeping the heading
  const blocks: Array<{ type: "heading" | "paragraph" | "eli5" | "list"; content: string; level?: number; id?: string }> = [];

  const lines = withoutFrontmatter.trim().split(/\r?\n/);
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

  // Basic inline formatting + math for paragraph content
  function renderInline(text: string) {
    // Replace **bold** with <strong> (simple, non-nested)
    const withBold = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <MathText text={withBold} />;
  }

  const renderBlock = (block: (typeof blocks)[number], idx: number) => {
    if (block.type === "heading") {
      const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
      const className =
        block.level === 1
          ? "mt-8 mb-3 text-2xl font-semibold tracking-tight theme-text scroll-mt-24"
          : block.level === 2
          ? "mt-6 mb-2 text-xl font-semibold theme-text scroll-mt-20"
          : "mt-4 mb-1.5 text-lg font-semibold theme-text scroll-mt-16";
      return (
        <Tag id={block.id} key={idx} className={className}>
          {renderInline(block.content)}
        </Tag>
      );
    }

    if (block.type === "eli5") {
      return (
        <div key={idx} className="my-4 rounded-2xl border theme-border bg-[var(--surface-2)] p-4 text-sm">
          <div className="mb-1 font-semibold uppercase tracking-widest text-[var(--text-muted)] text-xs">Explain Like I’m 5</div>
          <div className="prose prose-sm prose-stone dark:prose-invert max-w-none theme-text-secondary">
            {block.content.split(/\n\n+/).map((p, i) => (
              <p key={i} className="mb-2 last:mb-0">{renderInline(p.trim())}</p>
            ))}
          </div>
        </div>
      );
    }

    // paragraph (default)
    const paras = block.content.split(/\n\n+/).filter(Boolean);
    return (
      <div key={idx} className="prose prose-stone dark:prose-invert max-w-none text-[15px] leading-relaxed">
        {paras.map((p, pi) => (
          <p key={pi} className="mb-3 last:mb-0">{renderInline(p.trim())}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link href={backHref || `/x/${subjectSlug}`} className="text-sm text-[var(--accent)] hover:underline">
          ← Back to {subjectLabel || subjectSlug.replace(/-/g, " ")} topics
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight theme-text sm:text-4xl">{title}</h1>
      <p className="mt-1 text-xs theme-text-muted">Source: content/{subjectSlug}/topics/{topicId}/module.mdx (lightweight renderer)</p>

      <div className="mt-6">
        {blocks.map(renderBlock)}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t theme-border pt-6 text-sm">
        <Link
          href={`/x/${subjectSlug}/practice/${topicId}`}
          className="inline-flex items-center rounded-lg border border-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-text)]"
        >
          Practice this topic →
        </Link>
        <Link href={`/x/${subjectSlug}`} className="inline-flex items-center px-3 py-2 text-sm theme-text-muted hover:text-[var(--accent)]">
          All topics
        </Link>
      </div>

      <div className="mt-6 text-xs theme-text-muted opacity-70">
        Experimental lightweight MDX renderer in /x/. Full next-mdx-remote + custom components planned for production generic pages.
      </div>
    </div>
  );
}
