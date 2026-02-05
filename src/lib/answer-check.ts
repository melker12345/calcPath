const stripTrailingConstant = (input: string) => {
  // Allow optional "+C" / "C" (indefinite integrals).
  // Examples: "x^2/2+C", "x^2/2 + c", "x^2/2"
  return input.replace(/\+?c$/i, "");
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

  // Replace trig/log constants
  s = s
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\ln/g, "ln")
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

  // Common unicode arrow variants don't matter once we strip whitespace.
  out = stripTrailingConstant(out);
  return out;
};

export const isAnswerCorrect = (userInput: string, expected: string) => {
  const a = normalizeAnswer(userInput);
  const b = normalizeAnswer(expected);
  if (a === b) return true;

  // If expected includes "+c" but user omitted it, allow it.
  const aNoC = stripTrailingConstant(a);
  const bNoC = stripTrailingConstant(b);
  return aNoC === bNoC;
};

