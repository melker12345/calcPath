/**
 * Markdown prose (the dialect used inside module.mdx) to HTML, on the server.
 *
 * marked lexes the text; this file walks the tokens and emits HTML with every
 * `$…$` / `$$…$$` fragment typeset by KaTeX (render-math.ts). Mathematics is
 * masked with private-use placeholders before lexing, because marked would
 * otherwise read `\,` or `\(` inside a formula as Markdown escapes.
 *
 * Pure and server-only by nature (no React); the chapter body wraps the
 * strings it produces.
 */

import { marked, type Tokens } from "marked";
import { bareMathBody, isBareMath, splitRunInHead } from "./math-blocks";
import { escapeHtml, renderKatex, renderMathText } from "./render-math";

type AnyToken = Tokens.Generic & { tokens?: AnyToken[] };

const MATH_PLACEHOLDER_PREFIX = "MDXMATH";
const MATH_PLACEHOLDER_SUFFIX = "";
const MATH_SPAN_REGEX = /(?<!\\)(\$\$([\s\S]*?)(?<!\\)\$\$|\$([\s\S]*?)(?<!\\)\$)/g;
const MATH_PLACEHOLDER_REGEX = new RegExp(
  `${MATH_PLACEHOLDER_PREFIX}(\\d+)${MATH_PLACEHOLDER_SUFFIX}`,
  "g",
);

function protectMathDelimiters(source: string): { protectedSource: string; mathSegments: string[] } {
  const mathSegments: string[] = [];
  const protectedSource = source.replace(MATH_SPAN_REGEX, (match) => {
    mathSegments.push(match);
    return `${MATH_PLACEHOLDER_PREFIX}${mathSegments.length - 1}${MATH_PLACEHOLDER_SUFFIX}`;
  });
  return { protectedSource, mathSegments };
}

function restoreMath(text: string, mathSegments: string[]): string {
  return text.replace(MATH_PLACEHOLDER_REGEX, (_, index) => mathSegments[Number(index)] ?? "");
}

/** HTML comments (`<!-- section: slug -->` markers) are metadata, never content. */
export function stripComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, "");
}

/** `Heading text {#custom-id}` → title + id. */
export function cleanSlug(text: string): { title: string; id?: string } {
  const match = text.match(/^(.*)\s*\{#([a-z0-9-]+)\}\s*$/);
  if (match) return { title: match[1].trim(), id: match[2] };
  return { title: text.trim() };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * An environment sets its head into the first paragraph and its end mark onto
 * the last one — the run-in typography a printed theorem or proof uses.
 */
export type ProseOptions = {
  leadInHtml?: string;
  tailMark?: string;
  /**
   * Ids already used on the page. A repeated sub-heading ("Common Mistakes"
   * under three sections) gets a numbered suffix so every anchor is unique.
   */
  ids?: Set<string>;
};

/** Reserve `id` in `ids`, returning it or a numbered variant if it is taken. */
export function uniqueId(id: string, ids?: Set<string>): string {
  if (!ids) return id;
  let candidate = id;
  for (let n = 2; ids.has(candidate); n++) candidate = `${id}-${n}`;
  ids.add(candidate);
  return candidate;
}

const PARAGRAPH_CLASS = "mb-3 last:mb-0 leading-relaxed theme-text-secondary";

function renderable(tokens: AnyToken[] | undefined): AnyToken[] {
  // Raw HTML blocks are dropped: comments are stripped before lexing, and
  // nothing else in the corpus is meant to reach the page as markup.
  return (tokens ?? []).filter((t) => t.type !== "space" && t.type !== "html");
}

/** Inline (phrasing) tokens to HTML. Leaf text goes through the math renderer. */
function renderInline(tokens: AnyToken[] | undefined, mathSegments: string[]): string {
  if (!tokens || tokens.length === 0) return "";
  return tokens
    .map((token) => {
      switch (token.type) {
        case "text":
          if (token.tokens && token.tokens.length > 0) {
            return renderInline(token.tokens, mathSegments);
          }
          return renderMathText(restoreMath(token.text || "", mathSegments));
        case "escape":
          return escapeHtml(token.text || "");
        case "strong":
          return `<strong class="font-semibold">${renderInline(token.tokens, mathSegments)}</strong>`;
        case "em":
          return `<em>${renderInline(token.tokens, mathSegments)}</em>`;
        case "del":
          return `<del>${renderInline(token.tokens, mathSegments)}</del>`;
        case "codespan":
          return `<code class="bg-[var(--surface-2)] px-1 py-0.5 text-[0.9em] font-mono">${escapeHtml(token.text || "")}</code>`;
        case "br":
          return "<br />";
        case "link": {
          const link = token as Tokens.Link;
          const href = restoreMath(link.href || "", mathSegments);
          const external = /^https?:\/\//i.test(href);
          const inner = link.tokens?.length
            ? renderInline(link.tokens as AnyToken[], mathSegments)
            : renderMathText(restoreMath(link.text || "", mathSegments));
          const title = link.title ? ` title="${escapeHtml(restoreMath(link.title, mathSegments))}"` : "";
          return `<a href="${escapeHtml(href)}" class="text-[var(--accent)] underline underline-offset-2"${title}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${inner}</a>`;
        }
        default:
          // Anything else (inline html, images, …) is shown as its text.
          return token.text ? renderMathText(restoreMath(token.text, mathSegments)) : "";
      }
    })
    .join("");
}

/**
 * A short run of Markdown that must stay inline (a run-in paragraph's
 * remainder), with math protected exactly as for a full block.
 */
function renderInlineMarkdown(text: string): string {
  const { protectedSource, mathSegments } = protectMathDelimiters(text);
  return renderInline(marked.Lexer.lexInline(protectedSource) as AnyToken[], mathSegments);
}

function headingClass(depth: number): string {
  if (depth <= 2) return "text-2xl font-semibold tracking-tight mt-8 mb-3 theme-text scroll-mt-20";
  if (depth === 3) return "text-xl font-semibold mt-6 mb-2 theme-text scroll-mt-20";
  return "text-lg font-semibold mt-5 mb-2 theme-text scroll-mt-20";
}

function renderList(list: Tokens.List, mathSegments: string[], options: ProseOptions, nested = false): string {
  const tag = list.ordered ? "ol" : "ul";
  const listClass = list.ordered ? "list-decimal" : "list-disc";
  const start = list.ordered && list.start && list.start !== 1 ? ` start="${list.start}"` : "";
  const items = list.items
    .map((item) => `<li class="pl-1">${renderListItem(item as Tokens.ListItem & { tokens?: AnyToken[] }, mathSegments, options)}</li>`)
    .join("");
  return `<${tag} class="${listClass} ${nested ? "my-1" : "my-3"} space-y-1 pl-5 theme-text-secondary"${start}>${items}</${tag}>`;
}

/**
 * Every block of a list item is rendered — a second paragraph or a nested
 * list inside an item is content, not something to drop.
 */
function renderListItem(
  item: Tokens.ListItem & { tokens?: AnyToken[] },
  mathSegments: string[],
  options: ProseOptions,
): string {
  const blocks = renderable(item.tokens);
  const paragraphs = blocks.filter((b) => b.type === "text" || b.type === "paragraph").length;
  return blocks
    .map((block) => {
      if (block.type === "text" || block.type === "paragraph") {
        const inner = block.tokens?.length
          ? renderInline(block.tokens, mathSegments)
          : renderMathText(restoreMath(block.text || "", mathSegments));
        return paragraphs > 1 ? `<p class="mb-2 last:mb-0">${inner}</p>` : inner;
      }
      if (block.type === "list") return renderList(block as Tokens.List, mathSegments, options, true);
      return renderBlock(block, mathSegments, options);
    })
    .join("");
}

function renderTable(tbl: AnyToken, mathSegments: string[]): string {
  const t = tbl as AnyToken & {
    header: Array<{ tokens?: AnyToken[]; align?: string | null }>;
    rows: Array<Array<{ tokens?: AnyToken[]; align?: string | null }>>;
  };
  const head = t.header
    .map(
      (cell) =>
        `<th class="border theme-border bg-[var(--surface-2)] px-3 py-2 font-semibold" style="text-align:${cell.align || "left"}">${renderInline(cell.tokens, mathSegments)}</th>`,
    )
    .join("");
  const body = t.rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td class="border theme-border px-3 py-2 align-top" style="text-align:${cell.align || "left"}">${renderInline(cell.tokens, mathSegments)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  return `<table class="my-4 w-full border-collapse border theme-border text-sm theme-text-secondary"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function endMark(tailMark: string | undefined): string {
  return tailMark ? `<span class="mb-endmark">${tailMark}</span>` : "";
}

function renderBlock(
  token: AnyToken,
  mathSegments: string[],
  options: ProseOptions,
  leadInHtml?: string,
  tailMark?: string,
): string {
  switch (token.type) {
    case "heading": {
      const h = token as Tokens.Heading;
      const { title: cleanTitle, id: explicitId } = cleanSlug(h.text);
      const id = uniqueId(explicitId || slugify(cleanTitle), options.ids);
      const depth = Math.min(Math.max(h.depth, 1), 6);
      // The `{#id}` suffix is an instruction, not part of the heading text.
      const cleanedInline = ((h.tokens as AnyToken[] | undefined) || []).map((t) =>
        t.type === "text" ? { ...t, text: cleanSlug(t.text || "").title } : t,
      );
      return `<h${depth} id="${escapeHtml(id)}" class="${headingClass(depth)}">${renderInline(cleanedInline, mathSegments)}</h${depth}>`;
    }

    case "paragraph": {
      const p = token as Tokens.Paragraph;
      const paraText = restoreMath(p.text || "", mathSegments);

      // A paragraph that is nothing but math is a displayed equation, centred
      // and given room to breathe — never a sentence-shaped line of symbols.
      if (isBareMath(paraText)) {
        return `<div class="mb-display">${leadInHtml ? `<p class="mb-display-lead">${leadInHtml}</p>` : ""}${renderKatex(bareMathBody(paraText), true)}${tailMark ? `<span class="mb-endmark-standalone">${tailMark}</span>` : ""}</div>`;
      }

      // "Power rule: $…$" — a named result stated inline. Books set the name
      // as a run-in head and the result on its own line.
      const runIn = leadInHtml ? null : splitRunInHead(paraText);
      if (runIn && isBareMath(runIn.rest)) {
        return `<div class="mb-display"><p class="mb-display-lead"><span class="mb-runin">${escapeHtml(runIn.head)}.</span></p>${renderKatex(bareMathBody(runIn.rest), true)}</div>`;
      }
      if (runIn) {
        return `<p class="${PARAGRAPH_CLASS}"><span class="mb-runin">${escapeHtml(runIn.head)}.</span> ${renderInlineMarkdown(runIn.rest)}${endMark(tailMark)}</p>`;
      }

      return `<p class="${PARAGRAPH_CLASS}">${leadInHtml ?? ""}${renderInline(p.tokens as AnyToken[], mathSegments)}${endMark(tailMark)}</p>`;
    }

    case "list":
      return renderList(token as Tokens.List, mathSegments, options);

    case "table":
      return renderTable(token, mathSegments);

    case "code":
      return `<pre class="my-4 overflow-x-auto bg-[var(--surface-2)] p-3 text-xs font-mono theme-text-secondary"><code>${escapeHtml((token as Tokens.Code).text || "")}</code></pre>`;

    case "blockquote":
      return `<blockquote class="my-3 border-l-2 theme-border pl-4">${renderBlocks(token.tokens, mathSegments, { ids: options.ids })}</blockquote>`;

    case "hr":
      return `<hr class="my-6 theme-border" />`;

    case "def":
      return "";

    default:
      return token.text
        ? `<p class="mb-3">${renderMathText(restoreMath(token.text, mathSegments))}</p>`
        : "";
  }
}

function renderBlocks(tokens: AnyToken[] | undefined, mathSegments: string[], options: ProseOptions = {}): string {
  const blocks = renderable(tokens);
  // The head belongs to the opening sentence — never to a later paragraph,
  // which would strand "Solution." halfway down a list of steps.
  const firstParagraph = blocks[0]?.type === "paragraph" ? 0 : -1;
  const last = blocks.length - 1;
  const nodes = blocks
    .map((token, index) =>
      renderBlock(
        token,
        mathSegments,
        options,
        index === firstParagraph ? options.leadInHtml : undefined,
        index === last ? options.tailMark : undefined,
      ),
    )
    .join("");

  // A run-in head needs a sentence to run into. When an environment opens
  // straight onto a list or an equation, the head gets a line of its own.
  const headHasNoHome = options.leadInHtml && blocks[0]?.type !== "paragraph";
  let body = headHasNoHome ? `<p class="mb-2">${options.leadInHtml}</p>${nodes}` : nodes;

  // The end mark rides the closing sentence; when a proof ends on a list or a
  // table there is no sentence to ride, so it gets its own flush-right line.
  const lastToken = blocks[last];
  if (options.tailMark && lastToken && lastToken.type !== "paragraph") {
    body += `<span class="mb-endmark-standalone">${options.tailMark}</span>`;
  }
  return body;
}

/** A run of ordinary MDX prose (no environment fences inside) to HTML. */
export function renderProseHtml(source: string, options: ProseOptions = {}): string {
  const body = stripComments(source).trim();
  if (!body) {
    return options.leadInHtml ? `<p class="mb-2">${options.leadInHtml}</p>` : "";
  }
  const { protectedSource, mathSegments } = protectMathDelimiters(body);
  const tokens = marked.lexer(protectedSource) as AnyToken[];
  return renderBlocks(tokens, mathSegments, options);
}
