/**
 * Splitting authored text into prose and `$…$` / `$$…$$` mathematics.
 *
 * Shared by the client <MathText> (practice questions) and the server chapter
 * renderer (src/lib/content/render-math.ts), so a fragment splits identically
 * wherever it is shown. Pure: no React, no DOM.
 */

export type MathPart = {
  type: "text" | "math" | "blockmath";
  value: string;
  /** Punctuation glued onto the end of an inline formula (see glueTrailingPunctuation). */
  trailing?: string;
  /** A short connective glued onto the start of an inline formula. */
  leading?: string;
};

/**
 * "Tall" inline math — LaTeX whose rendered height spans more than one text
 * row (multi-row matrices/vectors, arrays, cases, aligned blocks). KaTeX inline
 * math does NOT grow the surrounding line box for tall content, so such spans
 * are rendered as a self-contained inline-block (`.math-tall`) that owns its
 * vertical space and scrolls horizontally on narrow screens.
 *
 * Signals: a stacking environment or a literal `\\` row break.
 */
const TALL_INLINE_MATH =
  /\\begin\{(?:[pbvVB]?matrix\*?|smallmatrix|array|cases|aligned|gathered|split|align\*?)\}|\\\\/;

export function isTallInlineMath(latex: string): boolean {
  return TALL_INLINE_MATH.test(latex);
}

/**
 * Split on `$…$` (inline) and `$$…$$` (block), honouring `\$` escapes. Text
 * parts get the sentence-spacing fixes the corpus has always relied on.
 */
export function splitMath(text: string): MathPart[] {
  const parts: MathPart[] = [];
  // Opening $ or $$ not preceded by \, then the inner content up to an unescaped closer.
  const regex = /(?<!\\)(\$\$([\s\S]*?)(?<!\\)\$\$|\$([\s\S]*?)(?<!\\)\$)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const full = match[0];
    if (full.startsWith("$$") && full.endsWith("$$")) {
      parts.push({ type: "blockmath", value: match[2] ?? "" });
    } else {
      parts.push({ type: "math", value: match[3] ?? "" });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  for (const part of parts) {
    if (part.type === "text") {
      // `\$` is a literal dollar sign.
      part.value = part.value.replace(/\\\$/g, "$");
      part.value = part.value.replace(/\.([A-Z])/g, ". $1");
      part.value = part.value.replace(/!([A-Z])/g, "! $1");
      part.value = part.value.replace(/\?([A-Z])/g, "? $1");
    }
  }

  return parts;
}

/**
 * Glue trailing punctuation onto the preceding inline math span. KaTeX roots
 * are inline-block, which gives the browser a break opportunity right before a
 * following "." or ")," — stranding lone punctuation on the next line. Moving
 * the cluster into the math span's nowrap wrapper removes that break.
 *
 * Also attaches a lone short connective between two formulas ("… Compute
 * $\lim…$") to the following formula, so it is never stranded at a line end —
 * but never before tall math, which manages its own width.
 */
export function glueTrailingPunctuation(parts: MathPart[]): MathPart[] {
  for (let i = 0; i < parts.length - 1; i++) {
    const cur = parts[i];
    const nxt = parts[i + 1];
    if (cur.type !== "math" || nxt.type !== "text") continue;
    const punct = nxt.value.match(/^[.,;:!?)\]}]+/)?.[0];
    if (!punct) continue;
    cur.trailing = punct;
    nxt.value = nxt.value.slice(punct.length);
  }

  for (let i = 1; i < parts.length - 1; i++) {
    const prev = parts[i - 1];
    const cur = parts[i];
    const nxt = parts[i + 1];
    if (prev.type !== "math" || cur.type !== "text" || nxt.type !== "math") continue;
    if (isTallInlineMath(nxt.value)) continue;
    const word = cur.value.match(/^([.,;:!?)\]}]*)\s+([A-Za-z]{1,14})\s+$/);
    if (!word) continue;
    nxt.leading = `${word[2]} `;
    cur.value = `${word[1]} `;
  }

  return parts;
}
