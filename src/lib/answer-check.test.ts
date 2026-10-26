import { describe, expect, it } from "vitest";
import {
  isAnswerCorrect,
  isAnswerCorrectAsync,
  isMcqAnswerCorrect,
  normalizeAnswer,
} from "./answer-check";

/**
 * The grading contract. `npm run content:answers` replays the whole corpus
 * through the same functions; these are the hand-picked cases that pin the
 * rules down so a change to the normalizer fails fast, with a name.
 */

const accept: Array<[string, string]> = [
  ["3", "3"],
  ["3", "3.0"],
  ["5-2", "3"],
  ["1+2", "3"],
  ["4/6", "2/3"],
  ["0.5", "1/2"],
  ["1/2", "0.5"],
  ["x*2", "2x"],
  ["2*x", "2x"],
  ["sqrt(4)", "2"],
  ["\\frac{1}{2}", "0.5"],
  ["2^3", "8"],
  ["x^2", "x*x"],
  ["x^{2}", "x^2"],
  ["sin(x)^2+cos(x)^2", "1"],
  ["5.48", "\\sqrt{30}"],
  // LaTeX commands the keypad produces.
  ["3\\times 4", "12"],
  ["\\binom{5}{2}", "10"],
  ["\\sqrt[3]{8}", "2"],
  ["\\sqrt[3]{x}", "x^(1/3)"],
  // MathQuill exponent braces: e^{3x} is e^(3x), not e^3 * x.
  ["3e^{3x}", "3*e^(3*x)"],
  ["3\\cdot e^{3x}", "3*e^(3*x)"],
  ["e^{2x}\\cdot 8", "8*e^(2*x)"],
  ["2xln(x)+x", "2*x*ln(x)+x"],
  ["2x\\ln\\left(x\\right)+x", "2*x*ln(x)+x"],
  ["\\frac{2}{\\sqrt{1-4x^2}}", "2/sqrt(1-4*x^2)"],
  ["f'(x)=15x^2", "15*x^2"],
  ["y'=15x^2", "15*x^2"],
  ["dy/dx=-x/y", "-x/y"],
  ["15*x**2", "15*x^2"],
  ["15x\u00b2", "15*x^2"],
  ["15x^2.", "15*x^2"],
  // Symbol spellings are one answer.
  ["x >= 4", "x \\ge 4"],
  ["x \u2265 4", "x \\ge 4"],
  ["x \\geq 4", "x \\ge 4"],
  ["R", "$\\mathbb{R}$"],
  ["\\theta = \\pi/4", "\u03b8 = \u03c0/4"],
  ["r=\\sqrt{2}", "r=\u221a2"],
  // A literal dollar sign is not a delimiter.
  ["\\$5", "5"],
  ["5", "\\$5"],
  // Rounding to fewer decimals than stored is fine when it is the correct rounding.
  ["1/6", "0.167"],
  ["0.6592", "0.659"],
  // Labels: omitted, or another spelling of the same thing.
  ["-3", "x = -3"],
  ["f(x)=2x", "y=2x"],
  ["dy/dx=-x/y", "y'=-x/y"],
  // Comma lists have no order unless labelled.
  ["-1,1", "1,-1"],
  ["1, -1", "1,-1"],
  ["3,3,2,1", "1,2,3,3"],
  ["3,-3", "x = 3, x = -3"],
  // "or" / "and" separate the values of a list (report 5f3c8073).
  ["2,3", "x = 2 or x = 3"],
  ["3, 2", "x = 2 or x = 3"],
  ["x=3, x=2", "x = 2 or x = 3"],
  ["8,-8", "x = 8 and x = -8"],
  // ± is the two-element list it abbreviates.
  ["2+3i, 2-3i", "x = 2 ± 3i"],
  ["2 \\pm 3i", "x = 2 ± 3i"],
  // Infinity: the word, the symbol and the keypad's \infty (report cb8e6375).
  ["\\infty", "infinity"],
  ["∞", "infinity"],
  ["\\infty", "+infinity"],
  // Greek letters typed from the keypad (report a1ac8a8f).
  ["e^{-\\lambda d}", "exp(-lambda*d)"],
  ["e^{-\\lambda d}", "e^(-lambda*d)"],
  ["\\theta=\\frac{\\pi}{4}", "θ=π/4"],
  ["\\left(x-2\\right)^{\\frac{1}{3}}", "$(x - 2)^{1/3}$"],
  ["cbrt(x-2)", "$(x - 2)^{1/3}$"],
  ["(2.75, 0.25, 0)", "(11/4,1/4,0)"],
  ["\\left(\\frac{11}{4},\\frac{1}{4},0\\right)", "(11/4,1/4,0)"],
  ["\\langle\\frac{2}{3},-\\frac{1}{3},\\frac{2}{3}\\rangle", "<2/3,-1/3,2/3>"],
  ["[[0.25,0.25],[0.25,0.25]]", "[[1/4,1/4],[1/4,1/4]]"],
  ["(-1/2,\\frac{\\sqrt{3}}{2})", "(-1/2, √3/2)"],
  ["y=Ax^{-3}+Bx^2", "y=A*x^2+B/x^3"],
  ["y=A\\sin(\\ln x)+B\\cos(\\ln x)", "y=A*cos(ln(x))+B*sin(ln(x))"],
  ["y=Ke^{x^2/2}", "y=Ce^(x^2/2)"],
  ["x^4/4+K", "x^4/4+C"],
  ["y=kx", "y=Cx"],
  ["\\ln x", "ln(x)"],
  ["x<-2orx>4", "x < -2 or x > 4"],
  ["x>4 or x<-2", "x < -2 or x > 4"],
  ["x<-2∨x>4", "x < -2 or x > 4"],
  ["2\\le x", "x≥2"],
  ["-1+\\sqrt{3}i", "-1+i√3"],
  ["-6i-2", "-2-6i"],
  ["(q∨r)∧p", "p∧(q∨r)"],
  ["(q∨¬p)∧(¬p∨r)", "(¬p∨q)∧(¬p∨r)"],
  ["\\forall y \\neg P(y)", "\\forall x \\neg P(x)"],
  ["x-1=0", "x=1"],
  ["46.9\\%", "46.90"],
  ["117.3^\\circ", "117.3"],
  ["0.75040", "0.7504"],
  ["2.718", "e"],
  ["2.72", "e"],
  ["0.333", "0.333"],
  ["y=(x-2)^(1/3)", "$(x - 2)^{1/3}$"],
  ["r=\\sqrt{2},\\theta=\\frac{\\pi}{4}", "r=√2, θ=π/4"],
];

const reject: Array<[string, string]> = [
  ["4", "3"],
  ["x", "2x"],
  ["1/3", "2/3"],
  ["x^2", "x^3"],
  ["3*e^3*x", "3*e^(3*x)"],
  ["2*x*ln(x)", "2*x*ln(x)+x"],
  // Opposite symbols never collapse onto each other.
  ["x \\le 4", "x \\ge 4"],
  ["x <= 4", "x >= 4"],
  ["$p \\land \\neg p$", "$p \\lor \\neg p$"],
  ["$\\neg p \\lor q$", "$\\neg p \\lor \\neg q$"],
  ["$A \\cup B$", "$A \\cap B$"],
  ["$x \\in A$", "$x \\notin A$"],
  ["$\\{1,3\\} \\in S$", "$\\{1,3\\} \\subseteq S$"],
  // Rounding is not a licence for a neighbouring value.
  ["0.25", "0.2"],
  ["0.2", "0.25"],
  // A different label is a different answer.
  ["y = -3", "x = -3"],
  ["N=10", "T=10"],
  ["x=3, y=-1", "x=-1, y=3"],
  ["x=3, y=2", "x = 2 or x = 3"],
  // Lists still have to contain the right values.
  ["1,2", "1,-1"],
  ["2,4", "x = 2 or x = 3"],
  ["2+3i, 2+3i", "x = 2 ± 3i"],
  ["-\\infty", "infinity"],
  ["x^4/4", "x^4/4+C"],
  ["0.1", "0.1151"],
  ["0.3", "0.333"],
  ["0.75", "0.7504"],
  ["2.7", "e"],
  ["-1-i\\sqrt{3}", "-1+i√3"],
  ["¬p∨(q∧r)", "(¬p∨q)∧(¬p∨r)"],
  ["p∧q∨r", "p∧(q∨r)"],
  ["\\exists x \\neg P(x)", "\\forall x \\neg P(x)"],
  ["y=1", "x=1"],
  ["y=x^2", "y=x^2+C"],
  ["y=t^2+C", "y=x^2+C"],
  ["(2.75, 0.25, 1)", "(11/4,1/4,0)"],
  ["(0.25, 2.75, 0)", "(11/4,1/4,0)"],
  ["e^{\\lambda d}", "exp(-lambda*d)"],
  ["1,2,3", "1,2,3,3"],
  ["(2,-1)", "(-1,2)"],
];

describe("isAnswerCorrectAsync", () => {
  it.each(accept)("accepts %j for %j", async (typed, stored) => {
    expect(await isAnswerCorrectAsync(typed, stored)).toBe(true);
  });

  it.each(reject)("rejects %j for %j", async (typed, stored) => {
    expect(await isAnswerCorrectAsync(typed, stored)).toBe(false);
  });

  it("never accepts an empty submission", async () => {
    expect(await isAnswerCorrectAsync("", "3")).toBe(false);
    expect(await isAnswerCorrectAsync("   ", "3")).toBe(false);
    expect(await isAnswerCorrectAsync("3", "")).toBe(false);
    expect(isAnswerCorrect("", "3")).toBe(false);
  });
});

describe("isAnswerCorrect (synchronous shortcut)", () => {
  it("matches identical and numerically equal answers", () => {
    expect(isAnswerCorrect("x^{2}", "x^2")).toBe(true);
    expect(isAnswerCorrect("3", "3.0")).toBe(true);
    expect(isAnswerCorrect("4", "3")).toBe(false);
  });

  it("does not evaluate expressions (that is the async path)", () => {
    expect(isAnswerCorrect("1/2", "0.5")).toBe(false);
  });
});

describe("normalizeAnswer", () => {
  it("drops the label prefix and MathQuill braces", () => {
    expect(normalizeAnswer("f'(x)=15x^{2}")).toBe("15*x^2");
  });

  it("folds symbol spellings onto one character", () => {
    expect(normalizeAnswer("x \\ge 4")).toBe("x≥4");
  });
});

describe("isMcqAnswerCorrect", () => {
  const choices = ["$p \\land \\neg p$", "$p \\lor \\neg p$"];

  it("grades by identity, so a look-alike distractor is wrong", () => {
    expect(isMcqAnswerCorrect(choices[1], choices[1], choices)).toBe(true);
    expect(isMcqAnswerCorrect(choices[0], choices[1], choices)).toBe(false);
  });

  it("does not accept a distractor that is merely equivalent as an expression", () => {
    expect(isMcqAnswerCorrect("2/4", "1/2", ["1/2", "2/4"])).toBe(false);
  });

  it("ignores whitespace differences only", () => {
    expect(isMcqAnswerCorrect("  1/2 ", "1/2", ["1/2", "2/4"])).toBe(true);
  });

  it("returns null when the stored answer is not one of the choices", () => {
    expect(isMcqAnswerCorrect("1/2", "3", ["1/2", "2/4"])).toBeNull();
    expect(isMcqAnswerCorrect("1/2", "1/2", [])).toBeNull();
  });
});

describe("requested form", () => {
  const prompt = "Factor completely: $2x^2+7x+6$";
  it("refuses the question's own expression and incomplete factorisations", async () => {
    expect(await isAnswerCorrectAsync("2x^2+7x+6", "(2x+3)(x+2)", { prompt })).toBe(false);
    expect(await isAnswerCorrectAsync("(x+2)(2x+3)", "(2x+3)(x+2)", { prompt })).toBe(true);
    expect(
      await isAnswerCorrectAsync("(x^2-4)(x^4+4x^2+16)", "(x-2)(x+2)(x^2+2x+4)(x^2-2x+4)", {
        prompt: "Factor completely over the integers: $x^6-64$",
      }),
    ).toBe(false);
    expect(await isAnswerCorrectAsync("(x+5)^2", "x^2+10x+25", { prompt: "Expand $(x+5)^2$." })).toBe(false);
    expect(await isAnswerCorrectAsync("x^4x^7x", "x^{12}", { prompt: "Simplify $x^4 \\cdot x^7 \\cdot x$." })).toBe(false);
    expect(await isAnswerCorrectAsync("(x^2-9)/(x-3)", "x + 3", { prompt: "Simplify $\\dfrac{x^2 - 9}{x - 3}$." })).toBe(false);
  });
});
