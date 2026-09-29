/**
 * Server-side LaTeX rendering for chapters.
 *
 * KaTeX typesets every `$…$` / `$$…$$` fragment to HTML at build time, so a
 * chapter page ships rendered mathematics and no KaTeX JavaScript. The
 * splitter (src/lib/math-split.ts) and the normaliser are the ones the client
 * <MathText> uses, so a fragment that renders on a practice page renders
 * identically here.
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
        // whitespace-nowrap keeps glued punctuation on the formula's line; the
        // small right margin is the breathing room every inline formula gets.
        out += `<span class="whitespace-nowrap" style="margin-right:0.15em">${escapeHtml(part.leading ?? "")}${renderKatex(part.value, false)}${escapeHtml(part.trailing ?? "")}</span>`;
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
