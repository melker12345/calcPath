"use client";

import React, { Component, type ReactNode } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { normalizeMathText } from "@/lib/math-text-normalize";

type MathTextProps = {
  text: string;
  block?: boolean;
};

/**
 * Detects "tall" inline math — LaTeX whose rendered height spans more than one
 * text row (multi-row matrices/vectors, arrays, cases, aligned blocks). KaTeX
 * inline math does NOT grow the surrounding line box for tall content, so such
 * expressions bleed into the line below (augmented matrices were overlapping the
 * following paragraph on mobile). We detect tallness straight from the source and
 * render those spans as a self-contained inline-block that owns its vertical space
 * and scrolls horizontally on narrow screens (see `.math-tall` in globals.css).
 *
 * Signals: a stacking environment (matrix family, array, cases, aligned, …) or a
 * literal `\\` row break (present in every multi-row matrix/vector/array).
 */
const TALL_INLINE_MATH =
  /\\begin\{(?:[pbvVB]?matrix\*?|smallmatrix|array|cases|aligned|gathered|split|align\*?)\}|\\\\/;

export function isTallInlineMath(latex: string): boolean {
  return TALL_INLINE_MATH.test(latex);
}

const splitMath = (text: string) => {
  // Robust splitter: supports $...$ (inline) and $$...$$ (block). Handles \$ escapes.
  // Post-processes for sentence spacing + anti-glue logic (see below).
  const parts: Array<{ type: "text" | "math" | "blockmath"; value: string; trailing?: string; leading?: string }> = [];

  // Regex matches opening $ or $$ not preceded by \, captures inner content up to unescaped closer.
  // Uses [\s\S]*? non-greedy across lines.
  const regex = /(?<!\\)(\$\$([\s\S]*?)(?<!\\)\$\$|\$([\s\S]*?)(?<!\\)\$)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const full = match[0];
    if (full.startsWith("$$") && full.endsWith("$$")) {
      const inner = match[2] ?? "";
      parts.push({ type: "blockmath", value: inner });
    } else {
      const inner = match[3] ?? "";
      parts.push({ type: "math", value: inner });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  // Unescape any \$ that reached text parts (from original manual logic).
  // Then apply sentence spacing fixes.
  for (const part of parts) {
    if (part.type === "text") {
      part.value = part.value.replace(/\\\$/g, "$");
      part.value = part.value.replace(/\.([A-Z])/g, ". $1");
      part.value = part.value.replace(/!([A-Z])/g, "! $1");
      part.value = part.value.replace(/\?([A-Z])/g, "? $1");
    }
  }

  return parts;
};

// Glue trailing punctuation onto the preceding inline math span. KaTeX roots
// are inline-block, which gives the browser a break opportunity right before
// a following "." or ")," — stranding lone punctuation on the next line.
// Moving the cluster into the math span's nowrap wrapper removes that break.
// Inline rendering only: block mode renders math as display blocks, where the
// punctuation belongs to the surrounding paragraph.
const glueTrailingPunctuation = (parts: ReturnType<typeof splitMath>) => {
  for (let i = 0; i < parts.length - 1; i++) {
    const cur = parts[i];
    const nxt = parts[i + 1];
    if (cur.type !== "math" || nxt.type !== "text") continue;
    const punct = nxt.value.match(/^[.,;:!?)\]}]+/)?.[0];
    if (!punct) continue;
    cur.trailing = punct;
    nxt.value = nxt.value.slice(punct.length);
  }

  // A lone short connective between two formulas ("{cases}. Compute $\lim…$")
  // must not be stranded at the end of a line away from the formula it
  // introduces. Attach it to the following math span's nowrap wrapper. Only
  // single words, and never before tall math — a .math-tall block manages its
  // own width/scrolling and a nowrap prefix could push it past the container.
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
};

// Local error boundary (no new files) so one bad LaTeX fragment in a practice question
// (or any MathText use) does not crash the whole experience with generic "Something went wrong".
// Graceful fallback: show raw source (amber highlighted) so user can still read/answer/navigate.
interface MathBoundaryProps {
  math: string;
  fallback: ReactNode;
  children: ReactNode;
}
interface MathBoundaryState {
  hasError: boolean;
}
class MathRenderBoundary extends Component<MathBoundaryProps, MathBoundaryState> {
  constructor(props: MathBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): MathBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[MathText] KaTeX parse failed for math: "${this.props.math}"`, error.message);
    }
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function SafeInlineMath({ math }: { math: string }) {
  const fallback = (
    <span
      className="rounded bg-amber-100 px-0.5 font-mono text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-200"
      title={`Could not render LaTeX (katex error): ${math}. Showing raw source as fallback.`}
    >
      {math}
    </span>
  );
  return (
    <MathRenderBoundary math={math} fallback={fallback}>
      <InlineMath math={math} />
    </MathRenderBoundary>
  );
}

function SafeBlockMath({ math }: { math: string }) {
  const fallback = (
    <div className="my-2 rounded border border-amber-200 bg-amber-50 p-2 font-mono text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      [LaTeX error: {math}]
    </div>
  );
  return (
    <MathRenderBoundary math={math} fallback={fallback}>
      <BlockMath math={math} />
    </MathRenderBoundary>
  );
}

export const MathText = ({ text, block = false }: MathTextProps) => {
  const rawParts = splitMath(normalizeMathText(text));
  const parts = block ? rawParts : glueTrailingPunctuation(rawParts);

  if (block) {
    return (
      <div className="my-3 space-y-2">
        {parts.map((part, index) =>
          part.type === "math" || part.type === "blockmath" ? (
            <SafeBlockMath key={`${part.value}-${index}`} math={part.value} />
          ) : (
            <p key={`${part.value}-${index}`}>
              {part.value}
            </p>
          ),
        )}
      </div>
    );
  }

  return (
    <>
      {parts.map((part, index) => {
        const isInlineMath = part.type === "math";
        const isBlockMath = part.type === "blockmath";
        const prevPart = index > 0 ? parts[index - 1] : null;
        const isAfterMath = prevPart?.type === "math" || prevPart?.type === "blockmath";

        if (isBlockMath) {
          // Display math gets its own block even when inside inline MathText usage.
          return (
            <div key={`${part.value}-${index}`} className="my-2">
              <SafeBlockMath math={part.value} />
            </div>
          );
        }

        if (isInlineMath) {
          // Tall inline math (multi-row matrices, vectors, cases) needs its own
          // vertical space so it doesn't overlap the line below. inline-block makes
          // the line box grow to fit it, and .math-tall adds breathing room + a
          // horizontal scroll fallback for wide matrices on mobile.
          if (isTallInlineMath(part.value)) {
            return (
              <span key={`${part.value}-${index}`} className="whitespace-nowrap">
                <span className="math-tall">
                  <SafeInlineMath math={part.value} />
                </span>
                {part.trailing}
              </span>
            );
          }
          // Consistent small breathing room after every inline math expression.
          // whitespace-nowrap keeps any glued trailing punctuation (see
          // splitMath) on the same line as the math it follows.
          return (
            <span key={`${part.value}-${index}`} className="whitespace-nowrap" style={{ marginRight: "0.15em" }}>
              {part.leading}
              <SafeInlineMath math={part.value} />
              {part.trailing}
            </span>
          );
        }

        // Text coming immediately after math
        let textValue = part.value;

        // Normalize newlines (from MDX source wraps or parse) to space to avoid bad breaks in paragraphs.
        textValue = textValue.replace(/\n+/g, ' ');

        if (isAfterMath) {
          // Robust anti-glue + percentile/ordinal fix for stats questions:
          // - Auto space after math unless text starts with punct or ordinal suffix (st|nd|rd|th).
          //   Prevents "glued words" (e.g. "$x$foo" → "x foo") while preserving "$50$th" / "$p$th" → "50th".
          // - Also the prior punct safeguard for new sentences.
          const trimmedStart = textValue.trimStart();
          const startsWithOrdinal = /^(?:st|nd|rd|th)\b/i.test(trimmedStart);
          const startsWithPunctOrSpace = /^[\s.!?;:,)\]}]/.test(textValue);
          if (textValue && !startsWithPunctOrSpace && !startsWithOrdinal) {
            textValue = " " + textValue;
          }
          textValue = textValue.replace(/^([.!?;:]+)([A-Z])/g, "$1 $2");
        }

        const startsWithNewSentence = isAfterMath && /^[A-Z]/.test(textValue.trimStart());

        // Basic **bold** support for explanation bodies (e.g. "**Common pitfall**:" in MDX).
        // Splits on ** and renders <strong> for even segments. Simple, no nested.
        const boldParts = textValue.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        const renderedText = boldParts.map((seg, sIdx) => {
          if (/^\*\*(.+)\*\*$/.test(seg)) {
            const inner = seg.replace(/^\*\*(.+)\*\*$/, '$1');
            return (
              <strong key={sIdx} className="font-semibold theme-text">
                {inner}
              </strong>
            );
          }
          return <React.Fragment key={sIdx}>{seg}</React.Fragment>;
        });

        return (
          <span
            key={`${part.value}-${index}`}
            style={startsWithNewSentence ? { marginLeft: "0.25em" } : undefined}
          >
            {renderedText}
          </span>
        );
      })}
    </>
  );
};
