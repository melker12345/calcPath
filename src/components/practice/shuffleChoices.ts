/**
 * Deterministic order for a multiple-choice question's options.
 *
 * Almost every MCQ in the corpus stores the correct answer as its first choice,
 * so rendering choices in stored order lets "always pick A" score ~97%. The
 * permutation below is seeded from the question id, so
 *
 *   - the order is different from the stored order for most questions,
 *   - a given question always shows the same order (returning to it keeps
 *     "I picked the second one" meaningful),
 *   - grading is untouched: it compares values, never positions.
 *
 * Every place that renders or highlights a question's choices must go through
 * this function so the same order is used before and after grading.
 */

/** FNV-1a, 32-bit. Small, fast, and spreads short kebab-case ids well. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a tiny seeded PRNG returning floats in [0, 1). */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The choices of `questionId` in their display order (a new array). Works
 * for any item type, so text and pre-rendered HTML can travel together. */
export function orderedChoices<T>(questionId: string, choices: readonly T[] | undefined): T[] {
  if (!choices || choices.length < 2) return choices ? [...choices] : [];
  const rand = seededRandom(hashString(questionId));
  const out = [...choices];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
