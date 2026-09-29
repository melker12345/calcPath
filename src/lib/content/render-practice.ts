import "server-only";

import { renderMathText } from "./render-math";
import { extractFinalAnswer, extractSteps, getDefaultHint } from "@/lib/practice-text";
import type { Problem, RenderedProblem } from "@/lib/shared-types";

/** Typeset everything the practice UI will show for one question. */
export function renderProblem(p: Problem): RenderedProblem {
  const { explanation, ...rest } = p;
  return {
    ...rest,
    html: {
      prompt: renderMathText(p.prompt),
      choices: p.choices?.map(renderMathText),
      steps: extractSteps(explanation).map(renderMathText),
      finalAnswer: renderMathText(extractFinalAnswer(explanation, p.answer)),
      hint: renderMathText(getDefaultHint(explanation, p.answer)),
    },
  };
}
