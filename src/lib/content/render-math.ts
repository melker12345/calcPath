/**
 * Server-side LaTeX rendering — the one KaTeX renderer for everything built
 * at deploy time (chapters and printable problem sheets).
 *
 * KaTeX typesets every `$…$` / `$$…$$` fragment to HTML at build time, so
 * those pages ship rendered mathematics and no KaTeX JavaScript. The splitter
 * (src/lib/math-split.ts) and the normaliser are the ones the client
 * <MathText> uses, so a fragment that renders on a practice page renders
 * identically here.
 *
 * Two prose flavours sit on top of `renderKatex`:
 *   - `renderMathText`   — a run of text with inline maths, the server twin
 *                          of <MathText> (chapters);
 *   - `renderMathHtml`   — the problem-sheet dialect: **bold**, *italic*,
 *                          `\n` line breaks, formulas lifted out first so the
 *                          markup may span them (problem sets).
 */

import katex from "katex";
import { normalizeMathText } from "@/lib/math-text-normalize";
import { glueTrailingPunctuation, isTallInlineMath, splitMath } from "@/lib/math-split";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * One formula to HTML. A fragment KaTeX cannot parse is never hidden: with
 * `throwOnError: false` KaTeX itself prints the source in red, and anything
 * that still throws is shown as marked-up source with the error in its title.
 * (`npm run content:latex` guarantees the corpus has no such fragment.)
 */
export function renderKatex(latex: string, display: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: display,
      output: "html",
      strict: "ignore",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<code class="katex-error" style="color:#cc0000" title="${escapeHtml(message)}">${escapeHtml(latex)}</code>`;
  }
}

/** `**bold**` inside a run of plain text, as the practice <MathText> supports it. */
function renderBoldRuns(text: string): string {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((seg) => {
      const bold = seg.match(/^\*\*(.+)\*\*$/);
      return bold
        ? `<strong class="font-semibold theme-text">${escapeHtml(bold[1])}</strong>`
        : escapeHtml(seg);
    })
    .join("");
}

/**
 * A run of authored text with inline mathematics, to HTML. This is the server
 * twin of <MathText>'s inline mode: the same spacing rules around formulas,
 * the same treatment of tall inline math, the same glued punctuation.
 */
/** U+2060: no line break may occur on either side of it. */
const WORD_JOINER = "\u2060";

export function renderMathText(text: string): string {
  const parts = glueTrailingPunctuation(splitMath(normalizeMathText(text)));
  let out = "";

  parts.forEach((part, index) => {
    const prev = index > 0 ? parts[index - 1] : null;
    const isAfterMath = prev?.type === "math" || prev?.type === "blockmath";

    if (part.type === "blockmath") {
      // Display math gets its own block even in the middle of a run of text.
      out += `<div class="my-2">${renderKatex(part.value, true)}</div>`;
      return;
    }

    if (part.type === "math") {
      if (isTallInlineMath(part.value)) {
        out += `<span class="whitespace-nowrap"><span class="math-tall">${renderKatex(part.value, false)}</span>${escapeHtml(part.trailing ?? "")}</span>`;
      } else {
        // Glued punctuation stays on the formula's line through a word joiner
        // (U+2060), which forbids a break on either side of itself. The whole
        // formula is NOT wrapped in nowrap: KaTeX splits inline math into
        // breakable pieces at top-level relations and operators, and a nowrap
        // wrapper defeated that, so a long inline equation ran off the edge of
        // a phone screen (report 5f3c8073). The small right margin is the
        // breathing room every inline formula gets.
        const leading = part.leading ? `${escapeHtml(part.leading)}${WORD_JOINER}` : "";
        const trailing = part.trailing ? `${WORD_JOINER}${escapeHtml(part.trailing)}` : "";
        out += `<span style="margin-right:0.15em">${leading}${renderKatex(part.value, false)}${trailing}</span>`;
      }
      return;
    }

    // Newlines from source wrapping become spaces so they never force a break.
    let textValue = part.value.replace(/\n+/g, " ");

    if (isAfterMath) {
      // Auto-space after a formula unless the text starts with punctuation or
      // an ordinal suffix ("$50$th" stays "50th"); a new sentence after a
      // formula gets its space too.
      const trimmedStart = textValue.trimStart();
      const startsWithOrdinal = /^(?:st|nd|rd|th)\b/i.test(trimmedStart);
      const startsWithPunctOrSpace = /^[\s.!?;:,)\]}]/.test(textValue);
      if (textValue && !startsWithPunctOrSpace && !startsWithOrdinal) {
        textValue = " " + textValue;
      }
      textValue = textValue.replace(/^([.!?;:]+)([A-Z])/g, "$1 $2");
    }

    const startsWithNewSentence = isAfterMath && /^[A-Z]/.test(textValue.trimStart());
    const inner = renderBoldRuns(textValue);
    out += startsWithNewSentence ? `<span style="margin-left:0.25em">${inner}</span>` : inner;
  });

  return out;
}

// ---------------------------------------------------------------------------
// Problem-sheet dialect
// ---------------------------------------------------------------------------

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
    rendered.push(renderKatex((isBlock ? block : inline) ?? "", isBlock));
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

const PLAIN_SYMBOLS: Record<string, string> = {
  le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", to: "→", infty: "∞", cdot: "·", times: "×",
  pm: "±", in: "∈", notin: "∉", subset: "⊂", subseteq: "⊆", cup: "∪", cap: "∩", emptyset: "∅",
  varnothing: "∅", sum: "Σ", prod: "Π", int: "∫", partial: "∂", nabla: "∇", circ: "∘", ldots: "…", dots: "…",
  cdots: "…", langle: "⟨", rangle: "⟩", mid: "|", lvert: "|", rvert: "|", lVert: "‖", rVert: "‖", degree: "°",
};

/**
 * Markdown-with-TeX reduced to words, for an aria-label or alt text. A screen
 * reader given the caption source reads out dollar signs, backslashes and
 * braces; this keeps the symbols a listener can follow (√, ≤, Greek names) and
 * drops the markup. It is lossy by design and never used for display.
 */
export function mathToPlainText(text: string): string {
  let out = text;
  // Markdown: links keep their text; emphasis and code markers go.
  out = out.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  out = out.replace(/`([^`]*)`/g, "$1");
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
  // TeX structures with a spoken form.
  for (let i = 0; i < 4; i++) {
    out = out.replace(/\\(?:d|t)?frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
    out = out.replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g, "$1-th root of ($2)");
    out = out.replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
    out = out.replace(/\\(?:mathbb|mathbf|mathrm|mathcal|mathfrak|boldsymbol|operatorname|text|textbf|textit|overline|bar|hat|vec|tilde|widehat|widetilde|underline|mathit|mathsf)\{([^{}]*)\}/g, "$1");
  }
  out = out.replace(/\\left|\\right|\\big[lr]?|\\Big[lr]?|\\bigg[lr]?|\\Bigg[lr]?/g, "");
  out = out.replace(/\\[,;:!]|\\quad|\\qquad|\\ /g, " ");
  out = out.replace(/\\([A-Za-z]+)/g, (whole, name: string) => PLAIN_SYMBOLS[name] ?? name);
  out = out.replace(/\\([{}%&$#_])/g, "$1");
  out = out.replace(/[${}]/g, "");
  return out.replace(/\s+/g, " ").trim();
}
