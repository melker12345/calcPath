"use client";

import React from "react";
import { marked, type Tokens } from "marked";
import { MathText } from "@/components/math-text";

type AnyToken = Tokens.Generic & { tokens?: AnyToken[] };

function stripFrontmatter(source: string): string {
  // Remove leading YAML frontmatter block (--- ... ---)
  return source.replace(/^---\s*[\r\n]+[\s\S]*?^---\s*[\r\n]+/m, "");
}

function cleanSlug(text: string): { title: string; id?: string } {
  const match = text.match(/^(.*)\s*\{#([a-z0-9-]+)\}\s*$/);
  if (match) {
    return { title: match[1].trim(), id: match[2] };
  }
  return { title: text.trim() };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Recursively render inline/phrasing tokens (text, strong, em, etc.).
 * Leaf text nodes (that may contain $...$ LaTeX) are delegated to the project's
 * existing MathText component for consistent math rendering + spacing fixes.
 */
function renderInline(tokens: AnyToken[] | undefined): React.ReactNode {
  if (!tokens || tokens.length === 0) return null;
  return tokens.map((token, index) => {
    const key = `${token.type || "inline"}-${index}`;
    if (token.type === "text") {
      if (token.tokens && token.tokens.length > 0) {
        // In some contexts (e.g. list items), 'text' acts as a container for nested inline tokens.
        return (
          <React.Fragment key={key}>{renderInline(token.tokens)}</React.Fragment>
        );
      }
      // Leaf text content — use MathText so $math$ becomes InlineMath, with project spacing rules.
      return <MathText key={key} text={token.text || ""} />;
    }
    if (token.type === "strong") {
      return <strong key={key}>{renderInline(token.tokens)}</strong>;
    }
    if (token.type === "em") {
      return <em key={key}>{renderInline(token.tokens)}</em>;
    }
    if (token.type === "codespan") {
      return (
        <code
          key={key}
          className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-[0.9em] font-mono"
        >
          {token.text}
        </code>
      );
    }
    if (token.type === "link") {
      return (
        <a
          key={key}
          href={token.href}
          className="text-blue-700 hover:underline dark:text-[var(--accent)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {renderInline(token.tokens || [{ type: "text", text: token.text } as unknown as AnyToken])}
        </a>
      );
    }
    // Fallback for other inline (br, del, etc.)
    if (token.text) {
      return (
        <React.Fragment key={key}>
          <MathText text={token.text} />
        </React.Fragment>
      );
    }
    return null;
  });
}

function renderBlocks(tokens: AnyToken[]): React.ReactNode {
  return tokens.map((token, index) => {
    const key = `block-${token.type}-${index}`;
    if (token.type === "space" || token.type === "html") {
      // Skip whitespace and raw HTML (e.g. <!-- section: slug --> markers used in some MDX)
      return null;
    }
    if (token.type === "heading") {
      const h = token as Tokens.Heading;
      const { title: cleanTitle, id: explicitId } = cleanSlug(h.text);
      const id = explicitId || slugify(cleanTitle);
      const depth = Math.min(Math.max(h.depth, 1), 6);
      const Tag = `h${depth}` as unknown as keyof React.JSX.IntrinsicElements;

      // Clean slug suffix out of inline tokens for display (prevents "{#id}" from appearing)
      const cleanedInline = (h.tokens || []).map((t: AnyToken) => {
        if (t.type === "text") {
          return { ...t, text: cleanSlug(t.text || "").title };
        }
        return t;
      });

      const className =
        depth === 1
          ? "text-3xl font-semibold tracking-tight mt-6 mb-4 theme-text first:mt-0"
          : "text-2xl font-semibold tracking-tight mt-8 mb-3 theme-text";

      return React.createElement(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Tag as any,
        { key, id, className },
        renderInline(cleanedInline)
      );
    }
    if (token.type === "paragraph") {
      const p = token as Tokens.Paragraph;
      return (
        <p key={key} className="mb-3 last:mb-0 leading-relaxed theme-text-secondary">
          {renderInline(p.tokens)}
        </p>
      );
    }
    if (token.type === "list") {
      const list = token as Tokens.List;
      const ListTag = list.ordered ? "ol" : "ul";
      const listClass = list.ordered ? "list-decimal" : "list-disc";
      return (
        <ListTag
          key={key}
          className={`${listClass} my-3 space-y-1 pl-5 text-sm theme-text-secondary`}
        >
          {list.items.map((item: Tokens.ListItem & { tokens?: AnyToken[] }, i: number) => {
            // list_item may wrap inlines under tokens[0].tokens (tight list) or direct
            const inner =
              item.tokens?.[0]?.tokens || item.tokens || [];
            return (
              <li key={i} className="pl-1">
                {renderInline(inner)}
              </li>
            );
          })}
        </ListTag>
      );
    }
    // Fallback block with raw text (rare)
    if ((token as AnyToken).text) {
      return (
        <p key={key} className="mb-3">
          <MathText text={(token as AnyToken).text} />
        </p>
      );
    }
    return null;
  });
}

/**
 * MdxContent
 *
 * Generic, reusable React component for rendering raw MDX source strings
 * (as provided by FileSystemContentBundle.mdxModules[*].mdxSource).
 *
 * - Strips YAML frontmatter automatically.
 * - Uses project's MathText (and thus react-katex) for all LaTeX $...$ and $$...$$.
 * - Supports headings (with {#custom-id} anchors), paragraphs, lists, strong/em/code/links.
 * - Applies consistent prose styling + theme tokens.
 * - Ignores HTML comment markers (used for section metadata in some content).
 *
 * Isolated: does not depend on legacy ModuleContent shapes.
 * Future: can be upgraded to full next-mdx-remote + custom MDX components
 * (e.g. <ELI5Box>, <Example>, <MathBlock>) without changing call sites.
 */
export function MdxContent({
  mdxSource,
  className = "",
}: {
  mdxSource: string;
  className?: string;
}) {
  if (!mdxSource?.trim()) {
    return null;
  }
  const withoutFrontmatter = stripFrontmatter(mdxSource);
  const tokens = marked.lexer(withoutFrontmatter) as AnyToken[];
  return (
    <div className={`max-w-none ${className}`}>
      {renderBlocks(tokens)}
    </div>
  );
}

/**
 * extractMdxSections
 *
 * Pure utility to derive a section/heading list from raw mdxSource.
 * Useful for building <ModuleSectionNav>, progress tracking, or TOCs in generic pages.
 *
 * Respects explicit {#slug} in headings when present (as authored in many module.mdx files).
 * Falls back to slugified title.
 *
 * Returns only headings (level 1-6); consumers can filter e.g. level===2 for sections.
 */
export function extractMdxSections(mdxSource: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  if (!mdxSource) return [];
  const withoutFrontmatter = stripFrontmatter(mdxSource);
  const tokens = marked.lexer(withoutFrontmatter) as AnyToken[];
  const sections: Array<{ id: string; title: string; level: number }> = [];
  for (const t of tokens) {
    if (t.type === "heading") {
      const h = t as Tokens.Heading;
      const { title: cleanTitle, id: explicit } = cleanSlug(h.text);
      const id = explicit || slugify(cleanTitle);
      sections.push({ id, title: cleanTitle, level: h.depth });
    }
  }
  return sections;
}
