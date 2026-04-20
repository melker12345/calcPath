const stripTrailingConstant = (input: string) => {
  // Allow optional trailing "+C" for indefinite integrals, and a bare "C".
  // Do not strip multiplicative forms like "Ce^(2x)" or "e^(2x)C".
  if (/^c$/i.test(input)) return "";
  return input.replace(/\+c$/i, "");
};

const hasUnsupportedConstant = (expr: string) => {
  // If the expression contains "c" anywhere other than trailing +c, skip numeric equivalence.
  const s = expr.toLowerCase().replace(/\s+/g, "");
  if (!s.includes("c")) return false;
  return !/\+?c$/.test(s);
};

const removeLatexSizing = (s: string) =>
  s.replace(/\\left/g, "").replace(/\\right/g, "");

const stripOptionalLabelPrefix = (input: string) =>
  input.replace(/^(?:[a-z]+(?:_[a-z0-9]+)?|[a-z])=/i, "");

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
  let out = input.trim();
  if (out.includes("\\")) out = latexToPlain(out);
  out = out.toLowerCase();
  out = out.replace(/\s+/g, "");
  out = out
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/⟨/g, "<")
    .replace(/⟩/g, ">")
    .replace(/λ/g, "lambda")
    .replace(/[{}]/g, "");
  out = out.replace(/_/g, "");
  out = stripOptionalLabelPrefix(out);
  out = replaceAbsoluteValue(out);
  out = out.replace(/\bln(?=\()/g, "log");

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
  let out = input.trim();
  if (out.includes("\\")) out = latexToPlain(out);
  out = out.toLowerCase();
  out = out.replace(/\s+/g, "");
  out = out
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/⟨/g, "<")
    .replace(/⟩/g, ">")
    .replace(/λ/g, "lambda")
    .replace(/[{}]/g, "");

  // Normalize exponent parentheses: x^(2x) -> x^2x
  out = out.replace(/\^\(([^)]+)\)/g, "^$1");

  // Normalize trig/func^n(arg) -> func(arg)^n  e.g. sec^2(x) -> sec(x)^2
  out = out.replace(
    /(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|ln|log|exp)\^([\w.]+)\(([^)]*)\)/g,
    "$1($3)^$2",
  );

  // Common unicode arrow variants don't matter once we strip whitespace.
  out = out.replace(/_/g, "");
  out = stripOptionalLabelPrefix(out);
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

const tryEval = (m: any, expr: string, scope: Record<string, number>) => {
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

  // Sample points (avoid 0 to reduce log/div issues)
  const scopes = [
    { x: -1.7, y: 0.8, z: -0.4, t: 1.2, n: 2, p: 1.5, a: 2.3, b: -1.1, c: 0.7, lambda: 1.9 },
    { x: -0.8, y: -1.3, z: 0.6, t: -0.7, n: 3, p: 2.1, a: -0.9, b: 1.4, c: 2.2, lambda: -1.2 },
    { x: 0.2, y: 1.1, z: 0.9, t: 0.5, n: 4, p: -0.8, a: 1.6, b: 0.4, c: -1.7, lambda: 0.6 },
    { x: 0.9, y: -0.5, z: -1.4, t: 1.7, n: 5, p: 0.3, a: -2.5, b: 2.8, c: 1.1, lambda: 2.4 },
    { x: 1.6, y: 0.3, z: 1.5, t: -1.1, n: 6, p: -2.2, a: 0.8, b: -0.6, c: 3.1, lambda: -0.9 },
    { x: 2.1, y: -0.9, z: 0.2, t: 0.4, n: 7, p: 1.9, a: 1.2, b: 1.7, c: -2.6, lambda: 1.3 },
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

// Async version for richer checks (used by practice/test flows)
export const isAnswerCorrectAsync = async (userInput: string, expected: string) => {
  const a = normalizeAnswer(userInput);
  const b = normalizeAnswer(expected);
  if (a === b) return true;

  const aNoC = stripTrailingConstant(a);
  const bNoC = stripTrailingConstant(b);
  if (aNoC === bNoC) return true;

  const allowConstantOffset = /\+?c$/i.test(b);
  return expressionsEquivalent(aNoC, bNoC, allowConstantOffset);
};

