/**
 * Server-side LaTeX rendering for the printable problem sheets.
 *
 * <MathText> is a client component (react-katex + an error boundary), and the
 * sheets are deliberately Server Components with no client JS at all — a sheet
 * that exists to be printed should not ship a React bundle to render a static
 * page. So the same $…$ / $$…$$ dialect is rendered here with KaTeX's own HTML
 * renderer at request/build time and handed to the page as a string.
 *
 * The splitter and the normalizer are the ones the rest of the corpus uses
 * (src/lib/math-text-normalize.ts, and the regex <MathText> and
 * scripts/validate-latex.ts share), so a fragment that renders on a practice
 * page renders identically here.
 */

import katex from "katex";
import { normalizeMathText } from "@/lib/math-text-normalize";

/** Same matcher <MathText>'s splitMath and validate-latex.ts use. */
const MATH_RE = /(?<!\\)(\$\$([\s\S]*?)(?<!\\)\$\$|\$([\s\S]*?)(?<!\\)\$)/g;

/**
 * Stand-in for a rendered formula while the prose markup pass runs. A control
 * character, so it cannot occur in authored content, and it carries no `*` —
 * which is the whole point: a phrase like `**Base case $k=1$.**` must still
 * read as one bold run even though a formula sits in the middle of it.
 */
const MATH_TOKEN = (i: number) => `\u0000${i}\u0000`;
const MATH_TOKEN_RE = /\u0000(\d+)\u0000/g;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

function renderFragment(latex: string, display: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: true,
      strict: false,
      displayMode: display,
      output: "html",
    });
  } catch {
    // A fragment that fails here would have failed `npm run content:problemsets`
    // too, so this is a belt-and-braces path: show the source rather than an
    // empty gap, and never throw the whole sheet away for one bad formula.
    return `<code class="ps-math-error">${escapeHtml(latex)}</code>`;
  }
}

/**
 * Render one authored string (prompt, part, solution paragraph) to HTML.
 * Inline `$…$` stays in the run of text; `$$…$$` becomes a display block.
 *
 * Formulas are lifted out first and substituted back last, so the light prose
 * markup — **bold**, *italic*, `\n` as a line break — is applied to the whole
 * string at once and may span a formula.
 */
export function renderMathHtml(text: string): string {
  const source = normalizeMathText(text);

  const rendered: string[] = [];
  const skeleton = source.replace(MATH_RE, (whole, _all, block, inline) => {
    const isBlock = String(whole).startsWith("$$");
    rendered.push(renderFragment((isBlock ? block : inline) ?? "", isBlock));
    return MATH_TOKEN(rendered.length - 1);
  });

  const prose = escapeHtml(skeleton)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<![*\w])\*([^*\n]+)\*(?!\w)/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");

  return prose.replace(MATH_TOKEN_RE, (_m, i) => rendered[Number(i)] ?? "");
}

/**
 * Split an authored body on blank lines and render each paragraph.
 * Solutions are written as several paragraphs; each becomes its own <p>.
 */
export function renderMathParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map(renderMathHtml);
}
