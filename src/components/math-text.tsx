"use client";

import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
  block?: boolean;
};

const splitMath = (text: string) => {
  const parts: Array<{ type: "text" | "math"; value: string }> = [];
  let current = "";
  let inMath = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "$" && i > 0 && text[i - 1] === "\\") {
      // \$ → literal dollar sign: strip the trailing backslash, add $
      current = current.slice(0, -1) + "$";
    } else if (char === "$") {
      if (inMath) {
        parts.push({ type: "math", value: current });
      } else if (current) {
        parts.push({ type: "text", value: current });
      }
      current = "";
      inMath = !inMath;
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push({ type: inMath ? "math" : "text", value: current });
  }

  // Fix common grammatical spacing issues that appear after math expressions
  // e.g. "number.The" → "number. The", "too.Classic" → "too. Classic"
  for (const part of parts) {
    if (part.type === "text") {
      part.value = part.value.replace(/\.([A-Z])/g, ". $1");
      // Also handle ! and ? followed by capital letter
      part.value = part.value.replace(/!([A-Z])/g, "! $1");
      part.value = part.value.replace(/\?([A-Z])/g, "? $1");
    }
  }

  return parts;
};

export const MathText = ({ text, block = false }: MathTextProps) => {
  const parts = splitMath(text);

  if (block) {
    return (
      <div className="my-3 space-y-2">
        {parts.map((part, index) =>
          part.type === "math" ? (
            <BlockMath key={`${part.value}-${index}`} math={part.value} />
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
    <span>
      {parts.map((part, index) => {
        const isMath = part.type === "math";
        const prevPart = index > 0 ? parts[index - 1] : null;
        const isAfterMath = prevPart?.type === "math";

        if (isMath) {
          // Consistent small breathing room after every inline math expression
          return (
            <span key={`${part.value}-${index}`} style={{ marginRight: "0.15em" }}>
              <InlineMath math={part.value} />
            </span>
          );
        }

        // Text coming immediately after math
        let textValue = part.value;

        // Final safeguard: if this text starts with punctuation that belongs to the previous math sentence
        // (e.g. the "." from "$a$."), make sure it has a space after it before any capital letter.
        if (isAfterMath) {
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
    </span>
  );
};
