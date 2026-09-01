const stripTrailingConstant = (input: string) => {
  // Allow optional trailing "+C" for indefinite integrals, and a bare "C".
  // Do not strip multiplicative forms like "Ce^(2x)" or "e^(2x)C".
  if (/^c$/i.test(input)) return "";
  return input.replace(/\+c$/i, "");
};

const removeLatexSizing = (s: string) =>
  s.replace(/\\left/g, "").replace(/\\right/g, "");

const stripOptionalLabelPrefix = (input: string) =>
  input
    // "f(x)=", "y=", "y_1="
    .replace(/^[a-z]\([a-z]\)=/i, "")
    // Derivative notation a learner naturally types on a derivatives question:
    // "f'(x)=", "y'=", "dy/dx=".
    .replace(/^[a-z]'\s*(?:\([a-z]\))?=/i, "")
    .replace(/^d[a-z]\/d[a-z]=/i, "")
    .replace(/^[a-z]+(?:_[a-z0-9]+)?=/i, "");

const parseGroup = (s: string, start: number) => {
  // expects s[start] === '{'
  let i = start;
  if (s[i] !== "{") return null;
  i += 1;
  let depth = 1;
  const begin = i;
  while (i < s.length) {
    if (s[i] === "{") depth += 1;
    else if (s[i] === "}") depth -= 1;
    if (depth === 0) {
      return { content: s.slice(begin, i), end: i + 1 };
    }
    i += 1;
  }
  return null;
};

const EVALUATION_TOKENS = [
  "arcsin",
  "arccos",
  "arctan",
  "sinh",
  "cosh",
  "tanh",
  "sqrt",
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "log",
  "exp",
  "abs",
  "pi",
  "inf",
  "lambda",
] as const;

const latexToPlain = (latex: string) => {
  let s = removeLatexSizing(latex);

  // Replace \cdot with *
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\div/g, "/");

  // Replace trig/log constants
  s = s
    .replace(/\\sin/g, "sin")
    .replace(/\\sinh/g, "sinh")
    .replace(/\\cos/g, "cos")
    .replace(/\\cosh/g, "cosh")
    .replace(/\\tan/g, "tan")
    .replace(/\\tanh/g, "tanh")
    .replace(/\\sec/g, "sec")
    .replace(/\\csc/g, "csc")
    .replace(/\\cot/g, "cot")
    .replace(/\\arcsin/g, "arcsin")
    .replace(/\\arccos/g, "arccos")
    .replace(/\\arctan/g, "arctan")
    .replace(/\\ln/g, "ln")
    .replace(/\\log/g, "log")
    .replace(/\\exp/g, "exp")
    .replace(/\\pi/g, "pi")
    .replace(/\\lambda/g, "lambda");

  // sqrt
  while (s.includes("\\sqrt{")) {
    const idx = s.indexOf("\\sqrt{");
    const g = parseGroup(s, idx + "\\sqrt".length);
    if (!g) break;
    s = s.slice(0, idx) + `sqrt(${g.content})` + s.slice(g.end);
  }

  // frac
  while (s.includes("\\frac{")) {
    const idx = s.indexOf("\\frac{");
    const num = parseGroup(s, idx + "\\frac".length);
    if (!num) break;
    const den = parseGroup(s, num.end);
    if (!den) break;
    s =
      s.slice(0, idx) +
      `(${num.content})/(${den.content})` +
      s.slice(den.end);
  }

  // Remove remaining backslashes from unknown commands
  s = s.replace(/\\[a-zA-Z]+/g, "");
  return s;
};

/** Superscript characters a learner can paste or type on a phone keyboard. */
const SUPERSCRIPT_CHARS: Record<string, string> = {
  "\u2070": "0",
  "\u00b9": "1",
  "\u00b2": "2",
  "\u00b3": "3",
  "\u2074": "4",
  "\u2075": "5",
  "\u2076": "6",
  "\u2077": "7",
  "\u2078": "8",
  "\u2079": "9",
  "\u207f": "n",
  "\u207a": "+",
  "\u207b": "-",
};

/**
 * Rewrite `^{...}` as `^(...)`.
 *
 * MathQuill emits braces around any exponent longer than one character, so the
 * only way to type e^{3x} in the answer widget produced a string whose braces
 * were later deleted wholesale — turning e^{3x} into e^3*x, a different
 * function. Converting to parentheses keeps the grouping the learner typed.
 */
const braceExponentsToParens = (input: string) => {
  let out = "";
  let i = 0;
  while (i < input.length) {
    if (input[i] === "^" && input[i + 1] === "{") {
      const group = parseGroup(input, i + 1);
      if (group) {
        out += `^(${braceExponentsToParens(group.content)})`;
        i = group.end;
        continue;
      }
    }
    out += input[i];
    i += 1;
  }
  return out;
};

/**
 * Everything both the string-equality path and the evaluation path agree on:
 * unwrap LaTeX, fold case and whitespace, normalize the many ways a keyboard
 * can spell the same operator, and drop a label prefix like "f'(x)=".
 */
const canonicalizeInput = (input: string) => {
  let out = input.trim();
  if (out.includes("\\")) out = latexToPlain(out);
  out = out.toLowerCase();
  out = out.replace(/\s+/g, "");
  out = out
    .replace(/\u2212/g, "-")
    .replace(/\u00d7/g, "*")
    .replace(/\u00f7/g, "/")
    .replace(/\u27e8/g, "<")
    .replace(/\u27e9/g, ">")
    .replace(/\u03bb/g, "lambda");

  // x**2 -> x^2 (Python/JS habit), x² -> x^(2) (phone keyboards, pasted text).
  out = out.replace(/\*\*/g, "^");
  const superscriptClass = new RegExp(`[${Object.keys(SUPERSCRIPT_CHARS).join("")}]+`, "g");
  out = out.replace(superscriptClass, (run) =>
    `^(${[...run].map((c) => SUPERSCRIPT_CHARS[c]).join("")})`
  );

  out = braceExponentsToParens(out);
  // A single-token exponent needs no grouping: x^(2) and x^2 are the same string
  // once the braces MathQuill added are gone. A single letter or a number only —
  // "^(3x)" is two tokens and must keep its parentheses, or e^(3x) would decay
  // into e^3*x, which is the bug this whole path exists to prevent.
  out = out.replace(/\^\(([a-z]|\d+(?:\.\d+)?)\)/g, "^$1");
  out = out.replace(/[{}]/g, "");
  // Some stored answers carry their LaTeX math delimiters; they are punctuation.
  out = out.replace(/\$/g, "");

  // Normalize trig/func^n(arg) -> func(arg)^n  e.g. sec^2(x) -> sec(x)^2
  out = out.replace(
    /(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|ln|log|exp)\^([\w.]+)\(([^)]*)\)/g,
    "$1($3)^$2",
  );

  out = out.replace(/_/g, "");
  out = stripOptionalLabelPrefix(out);
  // A sentence-ending period is punctuation, not arithmetic.
  out = out.replace(/\.$/, "");
  return out;
};

const insertImplicitMultiplication = (s: string) => {
  let out = s;
  // 2x, 2pi, 2sin(x) -> 2*x, 2*pi, 2*sin(x)
  out = out.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
  // x2 -> x*2, )2 -> )*2, )x -> )*x
  out = out.replace(/([a-zA-Z)])(\d)/g, "$1*$2");
  out = out.replace(/(\))([a-zA-Z(])/g, "$1*$2");
  return out;
};

const replaceAbsoluteValue = (input: string) => {
  let out = input;
  while (/\|[^|]+\|/.test(out)) {
    out = out.replace(/\|([^|]+)\|/g, "abs($1)");
  }
  return out;
};

const tokenizeForEvaluation = (input: string) => {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\d/.test(char)) {
      let j = i + 1;
      while (j < input.length && /[\d.]/.test(input[j])) j += 1;
      tokens.push(input.slice(i, j));
      i = j;
      continue;
    }

    const word = EVALUATION_TOKENS.find((token) => input.startsWith(token, i));
    if (word) {
      tokens.push(word);
      i += word.length;
      continue;
    }

    if (/[a-z]/.test(char)) {
      tokens.push(char);
      i += 1;
      continue;
    }

    tokens.push(char);
    i += 1;
  }

  return tokens;
};

const isValueToken = (token: string) =>
  /^[\d.]+$/.test(token) ||
  /^[a-z]$/.test(token) ||
  token === ")" ||
  token === "pi" ||
  token === "inf";

const isFunctionToken = (token: string) =>
  [
    "arcsin",
    "arccos",
    "arctan",
    "sinh",
    "cosh",
    "tanh",
    "sqrt",
    "sin",
    "cos",
    "tan",
    "sec",
    "csc",
    "cot",
    "log",
    "exp",
    "abs",
  ].includes(token);

const startsValueLike = (token: string) =>
  /^[\d.]+$/.test(token) ||
  /^[a-z]$/.test(token) ||
  token === "(" ||
  token === "pi" ||
  token === "inf" ||
  isFunctionToken(token);

const prepareExpressionForEvaluation = (input: string) => {
  let out = canonicalizeInput(input);
  out = replaceAbsoluteValue(out);
  // mathjs has no `ln`. The word-boundary this rewrite used to carry could not
  // fire after a letter, so "2xln(x)" left an `ln` mathjs could not evaluate and
  // the whole equivalence check gave up.
  out = out.replace(/ln(?=\()/g, "log");

  const tokens = tokenizeForEvaluation(out);
  const result: string[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const prev = result[result.length - 1];
    if (prev && isValueToken(prev) && startsValueLike(token)) {
      result.push("*");
    }
    result.push(token);
  }

  return result.join("");
};

export const normalizeAnswer = (input: string) => {
  let out = canonicalizeInput(input);
  out = stripTrailingConstant(out);
  out = insertImplicitMultiplication(out);
  return out;
};

// Numeric / expression equivalence (client-side)
let math: typeof import("mathjs") | null = null;
const getMath = async () => {
  if (math) return math;
  // Lazy-load to keep initial bundle smaller.
  math = await import("mathjs");
  return math;
};

const nearlyEqual = (a: number, b: number, eps = 1e-6) => {
  const diff = Math.abs(a - b);
  if (diff <= eps) return true;
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return diff / scale <= eps;
};

/** Decimal places in a normalized numeric literal, e.g. "5.477" -> 3. */
const decimalPlaces = (expr: string): number | null => {
  const match = expr.match(/^-?(\d+)\.(\d+)$/);
  return match ? match[2].length : null;
};

/**
 * Tolerance for comparing two scalar values when at least one side is a
 * rounded decimal. Allows 5.477 and 5.48 against sqrt(30) etc.
 */
const scalarComparisonTolerance = (aPrepared: string, bPrepared: string): number => {
  const aPlaces = decimalPlaces(aPrepared);
  const bPlaces = decimalPlaces(bPrepared);
  if (aPlaces !== null || bPlaces !== null) {
    const places = Math.min(aPlaces ?? 12, bPlaces ?? 12);
    return 0.5 * 10 ** -places;
  }
  return 1e-4;
};

const scalarNumericEquivalent = async (aExpr: string, bExpr: string): Promise<boolean> => {
  const m = await getMath();
  const aPrepared = prepareExpressionForEvaluation(aExpr);
  const bPrepared = prepareExpressionForEvaluation(bExpr);
  const aVal = tryEval(m, aPrepared, {});
  const bVal = tryEval(m, bPrepared, {});
  if (aVal === null || bVal === null) return false;
  const tol = scalarComparisonTolerance(aPrepared, bPrepared);
  return Math.abs(aVal - bVal) <= tol;
};

const tryEval = (
  m: typeof import("mathjs"),
  expr: string,
  scope: Record<string, number>,
) => {
  try {
    const v = m.evaluate(expr, scope);
    const num = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(num)) return null;
    return num;
  } catch {
    return null;
  }
};

const expressionsEquivalent = async (
  aExpr: string,
  bExpr: string,
  allowConstantOffset: boolean,
) => {
  const m = await getMath();
  const aPrepared = prepareExpressionForEvaluation(aExpr);
  const bPrepared = prepareExpressionForEvaluation(bExpr);

  // Sample points (avoid 0 to reduce log/div issues).
  // The last four sit inside (-0.5, 0.5) so that answers defined only on a small
  // interval — arcsin/arccos derivatives such as 2/sqrt(1-4x^2) — still produce
  // the three usable pairs this check requires. Without them a correct answer
  // could only ever pass by spelling the stored string exactly.
  const scopes = [
    { x: -1.7, y: 0.8, z: -0.4, t: 1.2, n: 2, p: 1.5, s: 0.6, r: 1.1, a: 2.3, b: -1.1, c: 0.7, lambda: 1.9 },
    { x: -0.8, y: -1.3, z: 0.6, t: -0.7, n: 3, p: 2.1, s: -1.2, r: 0.4, a: -0.9, b: 1.4, c: 2.2, lambda: -1.2 },
    { x: 0.2, y: 1.1, z: 0.9, t: 0.5, n: 4, p: -0.8, s: 2.1, r: -0.7, a: 1.6, b: 0.4, c: -1.7, lambda: 0.6 },
    { x: 0.9, y: -0.5, z: -1.4, t: 1.7, n: 5, p: 0.3, s: -0.5, r: 1.8, a: -2.5, b: 2.8, c: 1.1, lambda: 2.4 },
    { x: 1.6, y: 0.3, z: 1.5, t: -1.1, n: 6, p: -2.2, s: 1.4, r: -1.3, a: 0.8, b: -0.6, c: 3.1, lambda: -0.9 },
    { x: 2.1, y: -0.9, z: 0.2, t: 0.4, n: 7, p: 1.9, s: 0.9, r: 2.2, a: 1.2, b: 1.7, c: -2.6, lambda: 1.3 },
    { x: 0.35, y: 0.45, z: -0.25, t: 0.3, n: 2, p: 0.4, s: 0.25, r: 0.35, a: 0.45, b: -0.3, c: 0.2, lambda: 0.4 },
    { x: -0.3, y: -0.25, z: 0.4, t: -0.35, n: 3, p: -0.45, s: 0.3, r: -0.2, a: -0.4, b: 0.25, c: -0.35, lambda: -0.3 },
    { x: 0.15, y: 0.3, z: 0.15, t: 0.45, n: 4, p: 0.2, s: -0.35, r: 0.15, a: 0.25, b: 0.35, c: 0.45, lambda: 0.2 },
    { x: -0.45, y: 0.2, z: -0.4, t: -0.15, n: 5, p: -0.25, s: 0.45, r: -0.45, a: 0.35, b: -0.2, c: 0.3, lambda: -0.45 },
  ];
  const pairs: Array<{ a: number; b: number }> = [];

  for (const scope of scopes) {
    const a = tryEval(m, aPrepared, scope);
    const b = tryEval(m, bPrepared, scope);
    if (a === null || b === null) continue;
    pairs.push({ a, b });
    if (pairs.length >= 5) break;
  }

  if (pairs.length < 3) return false;

  if (!allowConstantOffset) {
    return pairs.every((p) => nearlyEqual(p.a, p.b));
  }

  // Accept if f(x) - g(x) is (approximately) constant.
  const diffs = pairs.map((p) => p.a - p.b);
  const base = diffs[0];
  return diffs.every((d) => nearlyEqual(d, base));
};

export const isAnswerCorrect = (userInput: string, expected: string) => {
  const a = normalizeAnswer(userInput);
  const b = normalizeAnswer(expected);
  if (a === b) return true;

  // If expected includes "+c" but user omitted it, allow it.
  const aNoC = stripTrailingConstant(a);
  const bNoC = stripTrailingConstant(b);
  if (aNoC === bNoC) return true;

  // Try numeric equivalence for expressions (async not possible here),
  // so we do a best-effort sync shortcut for pure numbers.
  const aNum = Number(aNoC);
  const bNum = Number(bNoC);
  if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
    return nearlyEqual(aNum, bNum, 1e-8);
  }

  return false;
};

/**
 * Grade a multiple-choice answer.
 *
 * A selected choice is one of `choices` verbatim, so equivalence checking buys
 * nothing here and actively harms: normalization deletes unknown LaTeX commands,
 * which collapses distractors onto the answer — "p \\land \\neg p" and
 * "p \\lor \\neg p" both reduce to "pp", and a wrong choice grades correct.
 * Compare identity instead, exactly as the diagnostic flow does.
 *
 * Returns null when the stored answer is not one of the offered choices (bad
 * content, or a choice list rendered differently); the caller then falls back to
 * the expression checker rather than marking every attempt wrong.
 */
export const isMcqAnswerCorrect = (
  selected: string,
  expected: string,
  choices: string[] | undefined,
): boolean | null => {
  const collapse = (value: string) => value.trim().replace(/\s+/g, " ");
  if (!choices || choices.length === 0) return null;
  const target = collapse(expected);
  if (!choices.some((choice) => collapse(choice) === target)) return null;
  return collapse(selected) === target;
};

// Async version for richer checks (used by practice/test flows)
export const isAnswerCorrectAsync = async (userInput: string, expected: string) => {
  const a = normalizeAnswer(userInput);
  const b = normalizeAnswer(expected);
  if (a === b) return true;

  const aNoC = stripTrailingConstant(a);
  const bNoC = stripTrailingConstant(b);
  if (aNoC === bNoC) return true;

  if (await scalarNumericEquivalent(aNoC, bNoC)) return true;

  const allowConstantOffset = /\+?c$/i.test(b);
  return expressionsEquivalent(aNoC, bNoC, allowConstantOffset);
};

