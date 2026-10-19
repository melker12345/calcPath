import { describe, expect, it } from "vitest";
import { analyzeAnswerInput, deriveSuggestionLabels } from "./math-input-helpers";

/**
 * The keypad must offer every symbol a stored answer needs. Phones have no
 * ≤ / ≥ key, so an inequality answer gets one (report a922a363: a learner
 * on an iPhone could not enter "x \ge 4").
 */
describe("inequality keys", () => {
  it.each([
    ["x \\ge 4", "≥"],
    ["x \\geq 4", "≥"],
    ["x ≥ 0.", "≥"],
    ["x >= 4", "≥"],
    ["x \\le 3", "≤"],
    ["x \\leq 3", "≤"],
    ["x ≤ 3", "≤"],
  ])("%s offers %s", (answer, key) => {
    expect(deriveSuggestionLabels(answer, undefined)).toContain(key);
    expect(analyzeAnswerInput(answer, undefined).canEnter).toBe(true);
  });

  it("strict inequalities keep the plain < and > keys", () => {
    expect(deriveSuggestionLabels("x < 5", undefined)).toEqual(["x", "<"]);
    expect(deriveSuggestionLabels("x > 5", undefined)).toEqual(["x", ">"]);
  });

  it("a plain number offers no inequality key", () => {
    expect(deriveSuggestionLabels("7", undefined)).toEqual([]);
  });
});
