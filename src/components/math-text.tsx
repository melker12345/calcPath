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

  return parts;
};

export const MathText = ({ text, block = false }: MathTextProps) => {
  const parts = splitMath(text);

  if (block) {
    return (
      <div className="space-y-2">
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
      {parts.map((part, index) =>
        part.type === "math" ? (
          <InlineMath key={`${part.value}-${index}`} math={part.value} />
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </span>
  );
};
