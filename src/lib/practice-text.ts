import { normalizeAnswer } from "@/lib/answer-check";

/**
 * Shared pure utilities for parsing the conventional explanation format
 * ("Step 1: ... Step 2: ... Final answer: ...").
 * Used by PracticeFeedback internally and by GenericPracticeExperience, the calc PracticeTopicClient,
 * stats/la PracticeClients (and future generic pages) to avoid duplicating hint/solution/final-answer extraction logic across subjects.
 *
 * Clients must pass a getHint={() => ...} that extracts Step 1 (e.g. local fn or getDefaultHint(expl, answer)).
 * (Fixes prior calc regression where hardcoded generic msg was passed.)
 *
 * Resilience note (Migration Phase): When rendered inside GenericPracticeExperience's QuestionErrorBoundary,
 * even an edge-case failure in step parsing or a MathText fragment here is isolated per-question (clear skip UI).
 * All text still flows through MathText's own per-fragment boundaries.
 */
export function extractSteps(explanation: string): string[] {
  const parts = explanation.split(/Step \d+:\s*/).filter(Boolean);
  return parts.map((step) => step.replace(/\s*Final answer:.*$/, "").trim());
}

/**
 * Format a canonical answer for MathText. Plain English MCQ labels must not be
 * wrapped in $...$ — KaTeX math mode strips spaces and garbles prose.
 */
export function formatAnswerForDisplay(answer: string): string {
  if (!answer) return "";
  if (answer.includes("$")) return answer;

  const isProse =
    /[A-Za-z]\s+[A-Za-z]/.test(answer) ||
    (/^[A-Za-z][A-Za-z\s.,'();:-]+$/.test(answer) && !/^[0-9+\-*/=^x().\\]+$/.test(answer));

  return isProse ? answer : `$${answer}$`;
}

export function extractFinalAnswer(explanation: string, fallbackAnswer = ""): string {
  const match = explanation.match(/Final answer:\s*(.+?)\.?\s*$/);
  const extracted = match?.[1]?.trim();
  if (extracted) return formatAnswerForDisplay(extracted);
  return fallbackAnswer ? formatAnswerForDisplay(fallbackAnswer) : "";
}

/**
 * Loose canonical form for "does this math fragment spell the stored answer?".
 * Strips $-delimiters, LaTeX sizing, a leading "=" / "≈", whitespace, braces
 * and trailing punctuation, then lowercases — enough that "$15x^{2}$." and
 * "15x^2" collide, while a formula like "\frac{d}{dx}(x^n) = nx^{n-1}" stays
 * distinct from "15x^2".
 */
function simpleAnswerForm(fragment: string): string {
  return fragment
    .replace(/\$/g, "")
    .replace(/^\s*(?:=|\\approx|≈)\s*/, "")
    .replace(/\\left|\\right/g, "")
    .replace(/[\s{}]/g, "")
    .replace(/\.+$/, "")
    .toLowerCase();
}

/** Grader canonicalization, guarded — never let normalization throw in render. */
function tryNormalize(fragment: string): string | null {
  try {
    const normalized = normalizeAnswer(fragment.replace(/\$/g, "").replace(/^\s*(?:=|\\approx|≈)\s*/, ""));
    return normalized || null;
  } catch {
    return null;
  }
}

/**
 * Does a trailing `$math$` fragment of a hint reveal the question's answer?
 * Compared against every known spelling of the answer (stored answer + the
 * "Final answer:" tail of the explanation), via the answer-check
 * canonicalization when it applies and a simple formatting-stripped comparison
 * as backstop. With no known answer we conservatively say "yes" (strip), which
 * matches the old always-strip behavior.
 */
function revealsAnswer(mathContent: string, knownAnswers: (string | undefined)[]): boolean {
  const candidates = knownAnswers.filter((a): a is string => !!a && a.trim().length > 0);
  if (candidates.length === 0) return true;

  const simpleTarget = simpleAnswerForm(mathContent);
  const normTarget = tryNormalize(mathContent);
  return candidates.some((candidate) => {
    if (simpleTarget && simpleTarget === simpleAnswerForm(candidate)) return true;
    const normCandidate = tryNormalize(candidate);
    return !!normTarget && !!normCandidate && normTarget === normCandidate;
  });
}

const FALLBACK_HINT = "Think about which rules or definitions apply to this problem.";

function finishHint(hint: string): string {
  return hint.endsWith(".") || hint.endsWith("$") ? hint : `${hint}.`;
}

/**
 * Pull a useful hint from an explanation without giving away the final answer.
 * Supports both step-by-step ("Step 1: ...") and short prose + math formats.
 *
 * A trailing `$math$` fragment is only stripped when it actually spells the
 * answer (pass the question's stored `answer` for the most reliable check —
 * the "Final answer:" tail of the explanation is always used as well). A
 * trailing formula that is NOT the answer (e.g. the power rule) is kept, so
 * hints like "Power rule: $\frac{d}{dx}(x^n) = nx^{n-1}$." survive intact.
 * Callers must render the result with <MathText> so the LaTeX displays.
 */
export function extractHintFromExplanation(explanation: string, answer?: string): string {
  const finalFromExplanation = explanation.match(/Final answer:\s*(.+?)\.?\s*$/i)?.[1]?.trim();
  const knownAnswers = [answer, finalFromExplanation];

  const stepMatch = explanation.match(/Step 1:\s*([\s\S]+?)(?=Step \d+:|Final answer:|$)/i);
  if (stepMatch) {
    const step = stepMatch[1].replace(/\s*Final answer:.*$/i, "").trim();
    const trailingMath = step.match(/\s*\$([^$]+)\$\s*\.?\s*$/);
    if (trailingMath && revealsAnswer(trailingMath[1], knownAnswers)) {
      const withoutAnswer = step
        .slice(0, trailingMath.index)
        .replace(/[\s:,]+$/, "")
        .trim();
      // Step 1 that is nothing but the answer: fall through to the generic hint
      // rather than leak it (the old code returned the full step here).
      return withoutAnswer.length >= 8 ? finishHint(withoutAnswer) : FALLBACK_HINT;
    }
    if (step.length >= 8) return finishHint(step);
  }

  const trimmed = explanation.replace(/\s*Final answer:.*$/i, "").trim();
  const firstSentence = trimmed.match(/^([\s\S]+?\.)(?:\s|$)/)?.[1]?.trim();
  if (firstSentence) {
    const trailingMath = firstSentence.match(/:?\s*\$([^$]+)\$\s*\.?$/);
    let candidateHint = firstSentence;
    if (trailingMath && revealsAnswer(trailingMath[1], knownAnswers)) {
      const lead = firstSentence
        .slice(0, trailingMath.index)
        .replace(/[\s:,]+$/, "")
        .trim();
      candidateHint = lead ? `${lead}.` : "";
    }
    candidateHint = candidateHint.replace(/\.{2,}/g, ".").trim();
    if (candidateHint.length >= 8 && candidateHint !== ".") {
      return finishHint(candidateHint);
    }

    const colonLead = firstSentence.match(/^([^:$]+):/)?.[1]?.trim();
    if (colonLead && colonLead.length >= 8) {
      return finishHint(colonLead);
    }
  }

  return FALLBACK_HINT;
}

export function getDefaultHint(explanation: string, answer?: string): string {
  return extractHintFromExplanation(explanation, answer);
}
