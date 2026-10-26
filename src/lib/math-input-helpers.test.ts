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

/**
 * Logic and set-theory answers need symbols no phone keyboard has (report
 * cb8e6375), and θ was missing for polar-form answers (report 5f3c8073).
 */
describe("symbol keys", () => {
  it.each([
    ["\\forall x\\, \\exists y\\, (x < y)", ["∀", "∃"]],
    ["$\\neg p \\lor q$", ["¬", "∨"]],
    ["p \\land q \\to r", ["∧", "→"]],
    ["$\\emptyset$", ["∅"]],
    ["$x \\in A \\cup B$", ["∈", "∪"]],
    ["\\{1, 2\\}", ["{ }"]],
    ["{1,2}", ["{ }"]],
    ["$\\aleph_0$", ["ℵ"]],
    ["ω", ["ω"]],
    ["r=√2, θ=π/4", ["θ", "π", "√"]],
    ["infinity", ["∞"]],
  ])("%s offers %j", (answer, keys) => {
    const labels = deriveSuggestionLabels(answer, undefined);
    for (const key of keys) expect(labels).toContain(key);
    expect(analyzeAnswerInput(answer, undefined).canEnter).toBe(true);
  });

  it("a LaTeX grouping brace is not a set brace", () => {
    expect(deriveSuggestionLabels("\\frac{1}{2}", undefined)).not.toContain("{ }");
    expect(deriveSuggestionLabels("x^{2}", undefined)).not.toContain("{ }");
  });
});

/** Letters the answer needs get keys whatever their case (report cb8e6375). */
describe("letter keys", () => {
  it.each([
    ["IV", ["I", "V"]],
    ["2R", ["R"]],
    ["k*M", ["k", "M"]],
  ])("%s offers %j", (answer, keys) => {
    const labels = deriveSuggestionLabels(answer, undefined);
    for (const key of keys) expect(labels).toContain(key);
    expect(analyzeAnswerInput(answer, undefined).canEnter).toBe(true);
  });

  it("the letters of a LaTeX command are not offered", () => {
    const labels = deriveSuggestionLabels("$\\hat{x}$", undefined);
    expect(labels).toContain("x");
    expect(labels).not.toContain("h");
    expect(labels).not.toContain("a");
    expect(labels).not.toContain("t");
  });
});
