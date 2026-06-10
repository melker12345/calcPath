"use client";

import React, { useRef, useEffect } from "react";
import { marked, type Tokens } from "marked";
import { MathText } from "@/components/math-text";
import { BlockMath } from "react-katex";

type AnyToken = Tokens.Generic & { tokens?: AnyToken[] };

/** Private-use placeholders so marked does not split LaTeX (e.g. `\,`, `\(`) into escape tokens. */
const MATH_PLACEHOLDER_PREFIX = "\uE000MDXMATH";
const MATH_PLACEHOLDER_SUFFIX = "\uE001";

const MATH_SPAN_REGEX = /(?<!\\)(\$\$([\s\S]*?)(?<!\\)\$\$|\$([\s\S]*?)(?<!\\)\$)/g;
const MATH_PLACEHOLDER_REGEX = new RegExp(
  `${MATH_PLACEHOLDER_PREFIX}(\\d+)${MATH_PLACEHOLDER_SUFFIX}`,
  "g"
);

/**
 * Replace $...$ / $$...$$ spans with opaque placeholders before marked lexing.
 * marked treats sequences like `\,` as Markdown escapes, which breaks math delimiters
 * and leaves raw LaTeX visible in section bodies.
 */
function protectMathDelimiters(source: string): { protectedSource: string; mathSegments: string[] } {
  const mathSegments: string[] = [];
  const protectedSource = source.replace(MATH_SPAN_REGEX, (match) => {
    const index = mathSegments.length;
    mathSegments.push(match);
    return `${MATH_PLACEHOLDER_PREFIX}${index}${MATH_PLACEHOLDER_SUFFIX}`;
  });
  return { protectedSource, mathSegments };
}

function restoreMathInText(text: string, mathSegments: string[]): string {
  return text.replace(MATH_PLACEHOLDER_REGEX, (_, index) => mathSegments[Number(index)] ?? "");
}

function stripFrontmatter(source: string): string {
  // Remove leading YAML frontmatter block (--- ... ---)
  return source.replace(/^---\s*[\r\n]+[\s\S]*?^---\s*[\r\n]+/m, "");
}

/**
 * Remove all HTML comments from source (e.g. <!-- section: slug --> markers from module.mdx).
 * Makes comment stripping robust even when MdxContent receives raw mdxSource (or bodies
 * that somehow included them). Comments are metadata only; never rendered content.
 * Complements the token-level skip for "html" in renderBlocks.
 */
function stripComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, "");
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

function isPureDisplayMath(text: string): boolean {
  const t = text.trim();
  // Matches standalone display math lines using $...$ or $$...$$ (no internal $ for simplicity)
  return (
    (t.startsWith("$$") && t.endsWith("$$") && t.length > 4) ||
    (t.startsWith("$") && t.endsWith("$") && t.length > 2 && !t.slice(1, -1).includes("$"))
  );
}

/**
 * Recursively render inline/phrasing tokens (text, strong, em, etc.).
 * Leaf text nodes (that may contain $...$ LaTeX) are delegated to the project's
 * existing MathText component for consistent math rendering + spacing fixes.
 */
function renderInline(
  tokens: AnyToken[] | undefined,
  mathSegments: string[]
): React.ReactNode {
  if (!tokens || tokens.length === 0) return null;
  return tokens.map((token, index) => {
    const key = `${token.type || "inline"}-${index}`;
    if (token.type === "text") {
      if (token.tokens && token.tokens.length > 0) {
        // In some contexts (e.g. list items), 'text' acts as a container for nested inline tokens.
        return (
          <React.Fragment key={key}>{renderInline(token.tokens, mathSegments)}</React.Fragment>
        );
      }
      // Leaf text content — use MathText so $math$ becomes InlineMath, with project spacing rules.
      return (
        <MathText key={key} text={restoreMathInText(token.text || "", mathSegments)} />
      );
    }
    if (token.type === "escape") {
      return <React.Fragment key={key}>{token.text}</React.Fragment>;
    }
    if (token.type === "strong") {
      return (
        <strong key={key} className="font-semibold">
          {renderInline(token.tokens, mathSegments)}
        </strong>
      );
    }
    if (token.type === "em") {
      return <em key={key}>{renderInline(token.tokens, mathSegments)}</em>;
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
          {renderInline(
            token.tokens || [{ type: "text", text: token.text } as unknown as AnyToken],
            mathSegments
          )}
        </a>
      );
    }
    // Fallback for other inline (br, del, etc.)
    if (token.text) {
      return (
        <React.Fragment key={key}>
          <MathText text={restoreMathInText(token.text, mathSegments)} />
        </React.Fragment>
      );
    }
    return null;
  });
}

function renderBlocks(tokens: AnyToken[], mathSegments: string[]): React.ReactNode {
  return tokens.map((token, index) => {
    const key = `block-${token.type}-${index}`;
    if (token.type === "space" || token.type === "html") {
      // Skip whitespace and raw HTML comments (<!-- section: slug --> etc. are stripped earlier too).
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
          ? "text-3xl font-semibold tracking-tight mt-6 mb-4 theme-text first:mt-0 scroll-mt-24"
          : "text-2xl font-semibold tracking-tight mt-8 mb-3 theme-text scroll-mt-20";

      return React.createElement(
        Tag as keyof React.JSX.IntrinsicElements,
        { key, id, className },
        renderInline(cleanedInline, mathSegments)
      );
    }
    if (token.type === "paragraph") {
      const p = token as Tokens.Paragraph;
      // Support display math as standalone paragraphs (common in our module.mdx)
      const paraText = restoreMathInText((p as Tokens.Paragraph & { text?: string }).text || "", mathSegments);
      if (isPureDisplayMath(paraText)) {
        const math = paraText.trim().replace(/^[$]{1,2}|[$]{1,2}$/g, "").trim();
        return (
          <div key={key} className="my-4">
            <BlockMath math={math} />
          </div>
        );
      }
      return (
        <p key={key} className="mb-3 last:mb-0 leading-relaxed theme-text-secondary">
          {renderInline(p.tokens, mathSegments)}
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
                {renderInline(inner, mathSegments)}
              </li>
            );
          })}
        </ListTag>
      );
    }
    if (token.type === "table") {
      const tbl = token as AnyToken & {
        header: Array<{ tokens?: AnyToken[]; align?: string | null }>;
        rows: Array<Array<{ tokens?: AnyToken[]; align?: string | null }>>;
      };
      return (
        <table
          key={key}
          className="my-4 w-full border-collapse overflow-hidden rounded border theme-border text-sm theme-text-secondary"
        >
          <thead>
            <tr>
              {tbl.header.map((cell, i) => {
                const align = cell.align || "left";
                return (
                  <th
                    key={i}
                    className="border theme-border bg-[var(--surface-2)] px-3 py-2 text-left font-semibold"
                    style={{ textAlign: align as React.CSSProperties["textAlign"] }}
                  >
                    {renderInline(cell.tokens, mathSegments)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tbl.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const align = cell.align || "left";
                  return (
                    <td
                      key={ci}
                      className="border theme-border px-3 py-2 align-top"
                      style={{ textAlign: align as React.CSSProperties["textAlign"] }}
                    >
                      {renderInline(cell.tokens, mathSegments)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (token.type === "code") {
      const c = token as Tokens.Code;
      if (c.lang === "mermaid") {
        return <MermaidDiagram key={key} chart={c.text} />;
      }
      return (
        <pre key={key} className="my-4 overflow-x-auto rounded bg-[var(--surface-2)] p-3 text-xs font-mono theme-text-secondary">
          <code>{c.text}</code>
        </pre>
      );
    }
    // Fallback block with raw text (rare)
    if ((token as AnyToken).text) {
      return (
        <p key={key} className="mb-3">
          <MathText text={restoreMathInText((token as AnyToken).text, mathSegments)} />
        </p>
      );
    }
    return null;
  });
}

function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    import("mermaid").then(({ default: mermaid }) => {
      if (!mounted || !ref.current) return;
      mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });
      mermaid.render(`mermaid-${Date.now()}`, chart).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      }).catch(() => {
        if (ref.current) ref.current.textContent = chart;
      });
    });
    return () => { mounted = false; };
  }, [chart]);
  return <div ref={ref} className="my-4 overflow-x-auto rounded border theme-border p-2 bg-white dark:bg-zinc-950" />;
}

/**
 * MdxContent
 *
 * Generic, reusable React component for rendering raw MDX source strings
 * (as provided by FileSystemContentBundle.mdxModules[*].mdxSource).
 *
 * - Strips YAML frontmatter automatically.
 * - Uses project's MathText (and thus react-katex) for inline LaTeX; native BlockMath for standalone display $$...$$ / $...$ paragraphs (module.mdx convention).
 * - Supports headings (with {#custom-id} anchors + scroll-mt for native section nav), paragraphs, lists, tables, strong/em/code/links.
 * - Applies consistent prose styling + theme tokens. Dark mode via .theme-* and var(--).
 * - Proactively strips HTML comments (<!-- section: ... --> etc.) via stripComments helper
 *   before lexing (in addition to skipping token.type==="html" and "space" in renderBlocks).
 *   Ensures raw markers never leak into rendered output even for raw mdxSource inputs.
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
  const withoutComments = stripComments(withoutFrontmatter).trim();
  const { protectedSource, mathSegments } = protectMathDelimiters(withoutComments);
  const tokens = marked.lexer(protectedSource) as AnyToken[];
  return (
    <div className={`max-w-none ${className}`}>
      {renderBlocks(tokens, mathSegments)}
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
 * (Comment markers are stripped before lexing but do not affect heading extraction anyway.)
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
  const withoutComments = stripComments(withoutFrontmatter).trim();
  const { protectedSource, mathSegments } = protectMathDelimiters(withoutComments);
  const tokens = marked.lexer(protectedSource) as AnyToken[];
  const sections: Array<{ id: string; title: string; level: number }> = [];
  for (const t of tokens) {
    if (t.type === "heading") {
      const h = t as Tokens.Heading;
      const { title: cleanTitle, id: explicit } = cleanSlug(
        restoreMathInText(h.text, mathSegments)
      );
      const id = explicit || slugify(cleanTitle);
      sections.push({ id, title: cleanTitle, level: h.depth });
    }
  }
  return sections;
}
