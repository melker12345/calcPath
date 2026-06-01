"use client";

import React, { Component, type ReactNode } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
  block?: boolean;
};

const splitMath = (text: string) => {
  // Robust splitter: supports $...$ (inline) and $$...$$ (block). Handles \$ escapes.
  // Post-processes for sentence spacing + anti-glue logic (see below).
  const parts: Array<{ type: "text" | "math" | "blockmath"; value: string }> = [];

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
  static getDerivedStateFromError(_error: Error): MathBoundaryState {
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
  const parts = splitMath(text);

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
          // Consistent small breathing room after every inline math expression
          return (
            <span key={`${part.value}-${index}`} style={{ marginRight: "0.15em" }}>
              <SafeInlineMath math={part.value} />
            </span>
          );
        }

        // Text coming immediately after math
        let textValue = part.value;

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

        return (
          <span
            key={`${part.value}-${index}`}
            style={startsWithNewSentence ? { marginLeft: "0.25em" } : undefined}
          >
            {textValue}
          </span>
        );
      })}
    </>
  );
};
