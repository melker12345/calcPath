const stripTrailingConstant = (input: string) => {
  // Allow optional "+C" / "C" (indefinite integrals).
  // Examples: "x^2/2+C", "x^2/2 + c", "x^2/2"
  return input.replace(/\+?c$/i, "");
};

const hasUnsupportedConstant = (expr: string) => {
  // If the expression contains "c" anywhere other than trailing +c, skip numeric equivalence.
  const s = expr.toLowerCase().replace(/\s+/g, "");
  if (!s.includes("c")) return false;
  return !/\+?c$/.test(s);
};

const removeLatexSizing = (s: string) =>
  s.replace(/\\left/g, "").replace(/\\right/g, "");

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

const latexToPlain = (latex: string) => {
  let s = removeLatexSizing(latex);

  // Replace \cdot with *
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\div/g, "/");

  // Replace trig/log constants
  s = s
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\sec/g, "sec")
    .replace(/\\csc/g, "csc")
    .replace(/\\cot/g, "cot")
    .replace(/\\arcsin/g, "arcsin")
    .replace(/\\arccos/g, "arccos")
    .replace(/\\arctan/g, "arctan")
    .replace(/\\ln/g, "ln")
    .replace(/\\log/g, "log")
    .replace(/\\exp/g, "exp")
    .replace(/\\pi/g, "pi");

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

export const normalizeAnswer = (input: string) => {
  let out = input.trim();
  if (out.includes("\\")) out = latexToPlain(out);
  out = out.toLowerCase();
  out = out.replace(/\s+/g, "");
  out = out
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/[{}]/g, "");

  // Normalize exponent parentheses: x^(2x) -> x^2x
  out = out.replace(/\^\(([^)]+)\)/g, "^$1");

  // Normalize trig/func^n(arg) -> func(arg)^n  e.g. sec^2(x) -> sec(x)^2
  out = out.replace(
    /(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|ln|log|exp)\^([\w.]+)\(([^)]*)\)/g,
    "$1($3)^$2",
  );

  // Common unicode arrow variants don't matter once we strip whitespace.
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

  // Sample points (avoid 0 to reduce log/div issues)
  const xs = [-1.7, -1.2, -0.7, -0.3, 0.2, 0.6, 1.1, 1.8];
  const pairs: Array<{ x: number; a: number; b: number }> = [];

  for (const x of xs) {
    const a = tryEval(m, aExpr, { x });
    const b = tryEval(m, bExpr, { x });
    if (a === null || b === null) continue;
    pairs.push({ x, a, b });
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

  if (hasUnsupportedConstant(aNoC) || hasUnsupportedConstant(bNoC)) return false;

  const allowConstantOffset = /\+?c$/i.test(b);
  return expressionsEquivalent(aNoC, bNoC, allowConstantOffset);
};

