"use client";

import React, { Component, type ReactNode } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { normalizeMathText } from "@/lib/math-text-normalize";
import { glueTrailingPunctuation, isTallInlineMath, splitMath } from "@/lib/math-split";

type MathTextProps = {
  text: string;
  block?: boolean;
};

/**
 * Client-side LaTeX rendering for the practice screens, where the text arrives
 * in props and is typeset with react-katex. Chapters do not use this: they are
 * rendered to HTML on the server (src/lib/content/render-math.ts) with the same
 * splitter, so the two agree on where prose ends and mathematics begins.
 */
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
