/**
 * Answer grading.
 *
 * A learner types into a MathQuill field, so the raw input is LaTeX; the stored
 * answer is whatever the author wrote in questions.json. Grading has to accept
 * every spelling of the right answer without accepting a wrong one, and the
 * balance between those two is the whole design.
 *
 * The contract, in order:
 *
 *  1. Canonicalize both sides (`canonicalizeInput`): unwrap LaTeX, fold case and
 *     whitespace, fold every spelling of a symbol onto one character (\\ge, >=
 *     and \u2265 are one thing), turn MathQuill's `^{...}` into `^(...)`, and set
 *     aside a label prefix such as "f'(x)=".
 *  2. Compare as strings. Most correct answers land here.
 *  3. Compare as numbers, where an answer given to fewer decimals is accepted
 *     when it is the correct rounding of the stored one (`scalarsAgree`).
 *  4. Compare as expressions by sampling both at fixed points
 *     (`expressionsEquivalent`) — this is what accepts a factored form against
 *     an expanded one.
 *  5. Compare as comma-separated lists, ignoring order when no part is labelled.
 *
 * Two guards keep leniency from becoming wrong: labels must agree when both
 * sides carry one ("y = -3" is not "x = -3"), and normalization never deletes a
 * symbol it does not recognise — deleting made opposites equal.
 *
 * Multiple choice does NOT come through here: a selected choice is graded by
 * identity (`isMcqAnswerCorrect`), because equivalence buys nothing when the
 * input is one of the offered strings and can only collapse distractors onto
 * the answer.
 *
 * Changes here are covered by `npm run content:answers`, which replays the whole
 * question corpus: every stored answer respelled the ways learners type it, every
 * multiple-choice distractor, and every pair of answers within a topic.
 */

import { logicEquivalent, looksLikeLogic } from "./logic-equivalence";
const stripTrailingConstant = (input: string) => {
  // Allow optional trailing "+C" for indefinite integrals.
  // Do not strip multiplicative forms like "Ce^(2x)" or "e^(2x)C", and never
  // strip an answer down to nothing: an answer that IS "c" (e.g. "b = c" once
  // its label is gone) must stay "c", or an empty submission would match it.
  const stripped = input.replace(/\+c$/i, "");
  return stripped === "" ? input : stripped;
};

const removeLatexSizing = (s: string) =>
  s.replace(/\\left/g, "").replace(/\\right/g, "");

/**
 * A label prefix on an answer: "y=", "f(x)=", "f'(x)=", "dy/dx=", "T=".
 *
 * Labels are dropped before comparing, so a learner may answer "10" where the
 * stored answer is "T=10". But when BOTH sides carry a label the labels have to
 * agree, or "y = -3" would be accepted for "x = -3" — a different line.
 * Spellings of the same thing share a family: y, f(x) and g(x) are all a
 * function value; y', f'(x) and dy/dx are all its derivative.
 */
const LABEL_PATTERNS: Array<{ re: RegExp; family: string }> = [
  { re: /^d([a-z])\/d[a-z]=/i, family: "derivative" },
  { re: /^[a-z]'\s*(?:\([a-z]\))?=/i, family: "derivative" },
  { re: /^([fgh])\([a-z]\)=/i, family: "value" },
  { re: /^y=/i, family: "value" },
  { re: /^([a-z])\([a-z]\)=/i, family: "apply" },
  { re: /^([a-z]+)(?:_[a-z0-9]+)?=/i, family: "name" },
];

type AnswerLabel = { family: string; raw: string };

const matchLabelPrefix = (input: string): AnswerLabel | null => {
  for (const { re, family } of LABEL_PATTERNS) {
    const m = input.match(re);
    if (!m) continue;
    // "apply" and "name" are labels whose identity matters: K(s) vs P(s), T vs N.
    const family_ =
      family === "apply" || family === "name" ? `${family}:${(m[1] ?? "").toLowerCase()}` : family;
    return { family: family_, raw: m[0] };
  }
  return null;
};

const stripOptionalLabelPrefix = (input: string) => {
  const label = matchLabelPrefix(input);
  return label ? input.slice(label.raw.length) : input;
};

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
  "combinations",
  "arcsin",
  "arccos",
  "arctan",
  "sech",
  "csch",
  "coth",
  "sinh",
  "cosh",
  "tanh",
  "sqrt",
  "cbrt",
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
  "theta",
] as const;

/**
 * One canonical spelling per symbol. Every LaTeX, ASCII and Unicode way of
 * writing a relation collapses onto the same character, so "x \\ge 4",
 * "x >= 4" and "x \u2265 4" are one answer — and "x \\le 4" stays a different one.
 *
 * Longest keys first: "\\leq" must be consumed before "\\le".
 */
const LATEX_SYMBOLS: Array<[string, string]> = [
  ["\\leftrightarrow", "\u21d4"],
  ["\\Leftrightarrow", "\u21d4"],
  ["\\rightarrow", "\u2192"],
  ["\\Rightarrow", "\u21d2"],
  ["\\implies", "\u21d2"],
  ["\\iff", "\u21d4"],
  ["\\varnothing", "\u2205"],
  ["\\emptyset", "\u2205"],
  ["\\subseteq", "\u2286"],
  ["\\supseteq", "\u2287"],
  ["\\subset", "\u2282"],
  ["\\supset", "\u2283"],
  ["\\notin", "\u2209"],
  ["\\infty", "inf"],
  ["\\forall", "\u2200"],
  ["\\exists", "\u2203"],
  ["\\wedge", "\u2227"],
  ["\\land", "\u2227"],
  ["\\vee", "\u2228"],
  ["\\lor", "\u2228"],
  ["\\lnot", "\u00ac"],
  ["\\neg", "\u00ac"],
  ["\\leq", "\u2264"],
  ["\\geq", "\u2265"],
  ["\\neq", "\u2260"],
  ["\\cup", "\u222a"],
  ["\\cap", "\u2229"],
  ["\\mid", "|"],
  ["\\le", "\u2264"],
  ["\\ge", "\u2265"],
  ["\\ne", "\u2260"],
  ["\\in", "\u2208"],
  ["\\to", "\u2192"],
  ["\\pm", "\u00b1"],
  ["\\mp", "\u2213"],
];

/** Style and spacing commands: no meaning, and their content must survive. */
const FORMATTING_COMMANDS =
  /\\(?:displaystyle|textstyle|scriptstyle|limits|nolimits|quad|qquad|thinspace|boldsymbol|operatorname|mathbb|mathbf|mathrm|mathcal|mathit|mathsf|mathfrak|textbf|textit|text|bf|it|rm)\b/g;

/** The same symbols as typed on a keyboard, folded onto the canonical form. */
const ASCII_SYMBOLS: Array<[RegExp, string]> = [
  [/<=>/g, "\u21d4"],
  [/<=/g, "\u2264"],
  [/>=/g, "\u2265"],
  [/!=/g, "\u2260"],
  [/=>/g, "\u21d2"],
  [/->/g, "\u2192"],
  [/\+\/-/g, "\u00b1"],
  [/-\/\+/g, "\u2213"],
  [/&&/g, "\u2227"],
  [/\|\|/g, "\u2228"],
];

/** Greek letters and roots a learner may paste or type directly. */
const UNICODE_LETTERS: Array<[RegExp, string]> = [
  [/\u03b1/g, "alpha"],
  [/\u03b2/g, "beta"],
  [/\u03b3/g, "gamma"],
  [/\u03b4/g, "delta"],
  [/\u03b5/g, "epsilon"],
  [/\u03b8/g, "theta"],
  [/\u03bc/g, "mu"],
  [/\u03c0/g, "pi"],
  [/\u03c1/g, "rho"],
  [/\u03c3/g, "sigma"],
  [/\u03c4/g, "tau"],
  [/\u03c6/g, "phi"],
  [/\u03c9/g, "omega"],
  [/\u03c8/g, "psi"],
  [/\u03be/g, "xi"],
  [/\u03ba/g, "kappa"],
  [/\u03b7/g, "eta"],
  [/\u03b6/g, "zeta"],
  [/\u03bd/g, "nu"],
  [/\u03c7/g, "chi"],
  [/\u0394/g, "Delta"],
  [/\u03a3/g, "Sigma"],
  [/\u03a9/g, "Omega"],
  [/\u03a0/g, "Pi"],
  [/\u0393/g, "Gamma"],
  [/\u03a6/g, "Phi"],
  [/\u03a8/g, "Psi"],
  [/\u2223/g, "|"],
  [/\u221e/g, "inf"],
];

const latexToPlain = (latex: string) => {
  let s = removeLatexSizing(latex);

  // A matrix environment is a nested list: \begin{pmatrix}1&2\\3&4\end{pmatrix}
  // becomes [[1,2],[3,4]], the spelling stored answers use. Without this a
  // learner typing into a MathQuill matrix field could never match a stored
  // matrix answer, whatever they entered.
  s = s.replace(
    /\\begin\{([pbBvV]?matrix)\}([\s\S]*?)\\end\{\1\}/g,
    (_m, _env, body: string) => {
      const rows = body
        .split(/\\\\/)
        .map((row) => row.trim())
        .filter((row) => row !== "");
      if (rows.length === 0) return "[]";
      const cells = rows.map((row) => row.split("&").map((cell) => cell.trim()));
      // A single column is a vector; keep it one level deep so that a column
      // vector and the list a learner types agree.
      if (cells.every((row) => row.length === 1)) {
        return `(${cells.map((row) => row[0]).join(",")})`;
      }
      return `[${cells.map((row) => `[${row.join(",")}]`).join(",")}]`;
    },
  );

  // \langle 1,2,3 \rangle is the same tuple as (1,2,3).
  s = s.replace(/\\langle/g, "(").replace(/\\rangle/g, ")");

  // Replace \cdot / \times with *
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\times/g, "*");
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
    .replace(/\\lambda/g, "lambda")
    // The variant forms are the same letters: \varepsilon is epsilon.
    .replace(/\\var(epsilon|theta|phi|sigma|rho|pi|kappa)/g, "\\$1")
    // MathQuill turns typed "inf" into the operator \inf, so "infinity" typed
    // letter by letter arrives as "\inf inity" (report 63c4c667).
    .replace(/\\inf(?![a-z])/g, "inf")
    .replace(/\\mid(?![a-z])/g, "|")
    .replace(/\\uparrow(?![a-z])/g, "\u2191");

  // \sqrt[n]{x} is the nth root of x, not "sqrt[n]x": rewrite it as a power
  // before the plain-sqrt loop, which only knows the index-free form.
  while (/\\sqrt\[[^\]]*\]\{/.test(s)) {
    const m = s.match(/\\sqrt\[([^\]]*)\]\{/);
    if (!m || m.index === undefined) break;
    const g = parseGroup(s, m.index + m[0].length - 1);
    if (!g) break;
    s = s.slice(0, m.index) + `(${g.content})^(1/(${m[1]}))` + s.slice(g.end);
  }

  // sqrt
  while (s.includes("\\sqrt{")) {
    const idx = s.indexOf("\\sqrt{");
    const g = parseGroup(s, idx + "\\sqrt".length);
    if (!g) break;
    s = s.slice(0, idx) + `sqrt(${g.content})` + s.slice(g.end);
  }

  // \binom{n}{k} -> combinations(n,k), which mathjs evaluates. Falling through
  // to the keep-command-name rule produced "binom*93", a string nothing else
  // could ever equal.
  while (s.includes("\\binom{")) {
    const idx = s.indexOf("\\binom{");
    const top = parseGroup(s, idx + "\\binom".length);
    if (!top) break;
    const bottom = parseGroup(s, top.end);
    if (!bottom) break;
    s = s.slice(0, idx) + `combinations(${top.content},${bottom.content})` + s.slice(bottom.end);
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

  // Relations, logic and set operations become canonical symbols rather than
  // being deleted. Deleting them collapsed opposites onto each other — "p \\land
  // \\neg p" and "p \\lor \\neg p" both became "pp" — so a wrong answer could
  // compare equal to the right one.
  for (const [command, symbol] of LATEX_SYMBOLS) {
    s = s.split(command).join(symbol);
  }

  // Formatting commands carry no meaning; their braced content is kept and the
  // braces are stripped downstream, so \\mathbb{R} still reduces to R.
  s = s.replace(FORMATTING_COMMANDS, "");

  // Anything left is a named symbol (\\theta, \\aleph, ...). Keep the name: two
  // different symbols must not reduce to the same empty string.
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  s = s.replace(/\\(.)/g, "$1");
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
const canonicalizeInputBase = (input: string, keepLabel = false) => {
  let out = input.trim();
  if (out.includes("\\")) out = latexToPlain(out);
  out = out.toLowerCase();
  // "x = 2 or x = 3" and "x = 8 and x = -8" are the lists "x=2,x=3" and
  // "x=8,x=-8": the word is a separator between values, and a learner who
  // types "2,3" has given the same two roots.
  out = out.replace(/\s+(?:or|and)\s+/g, ",");
  out = out.replace(/\s+/g, "");
  // "\\ln x" and "\\sin x^2" apply the function to the one symbol that follows:
  // give it the parentheses the evaluator needs (report 154635bb).
  out = out.replace(
    /(arcsin|arccos|arctan|sinh|cosh|tanh|sin|cos|tan|sec|csc|cot|ln|log|exp)(?!\(|h)(\d+(?:\.\d+)?|[a-z])(\^(?:\d+|[a-z]|\([^()]*\)))?/g,
    "$1($2$3)",
  );
  // The word and the symbol are one value, and so is the LaTeX \\infty the
  // keypad's ∞ key produces (folded to "inf" in latexToPlain).
  out = out.replace(/infinity/g, "inf");
  // "oo" is the keyboard spelling of infinity.
  out = out.replace(/(^|[^a-z])oo(?![a-z])/g, "$1inf");
  // A leading sign of "+" says nothing: "+inf" and "+5" are "inf" and "5".
  out = out.replace(/^\+/, "");
  out = out
    .replace(/\u2212/g, "-")
    .replace(/\u00d7/g, "*")
    .replace(/\u00f7/g, "/")
    .replace(/\u27e8/g, "<")
    .replace(/\u27e9/g, ">")
    .replace(/\u03bb/g, "lambda");

  // Keyboard and Unicode spellings of the symbols LaTeX also produces, folded
  // onto the same canonical character so "x >= 4" and "x \\ge 4" are one answer.
  for (const [pattern, symbol] of ASCII_SYMBOLS) out = out.replace(pattern, symbol);
  for (const [pattern, name] of UNICODE_LETTERS) out = out.replace(pattern, name);
  // \u221a2 and \u221a(x+1) are sqrt(2) and sqrt(x+1).
  out = out.replace(/\u221a\(/g, "sqrt(");
  out = out.replace(/\u221a(\d+(?:\.\d+)?|[a-z])/g, "sqrt($1)");

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

  // Match the label while any subscript is still visible — deleting "_" first
  // turned "v_0=" into "v0=", which no label pattern recognises.
  if (!keepLabel) out = stripOptionalLabelPrefix(out);
  out = out.replace(/_/g, "");
  // A sentence-ending period is punctuation, not arithmetic.
  out = out.replace(/\.$/, "");
  // Angle brackets around a list are vector notation: <1,2,3> and \langle
  // 1,2,3 \rangle (already turned into parentheses above) both mean the tuple
  // (1,2,3). Square brackets are deliberately NOT folded in — "[0,2)" and
  // "[-1,5]" are intervals, where the bracket carries the meaning.
  if (/^<[^<>[\]()]*>$/.test(out) && out.includes(",")) {
    out = `(${out.slice(1, -1)})`;
  }

  return out;
};

/** "2 ≤ x" is "x ≥ 2": the variable goes on the left (report 00a76918). */
const FLIP = { "<": ">", ">": "<", "\u2264": "\u2265", "\u2265": "\u2264" } as const;
const normalizeInequalitySide = (part: string): string => {
  const m = part.match(/^(-?(?:\d+(?:\.\d+)?|pi|e))([<>\u2264\u2265])([a-z])$/);
  if (!m) return part;
  return `${m[3]}${FLIP[m[2] as keyof typeof FLIP]}${m[1]}`;
};

const canonicalizeInput = (input: string, keepLabel = false) => {
  // Spacing commands (\, \; \: \! and "\ ") are typesetting, not content; a
  // thin space in a stored formula must not become a list comma.
  const prepared = input.replace(/\\[dt]frac/g, "\\frac").replace(/\\[,;:!]|\\ /g, " ");
  let out = canonicalizeInputBase(prepared, keepLabel);
  // Scientific notation: 4e-6 is 4*10^(-6), not four times Euler's number
  // minus six (report 03f870ec).
  out = out.replace(/(\d(?:\.\d+)?)e([+-]?\d+)(?![\d.a-z])/g, "$1*10^($2)");
  // A logarithm to a base: log_2(10) is log(10)/log(2) (report f8f221cf).
  out = out.replace(/log_?\{?(\d+(?:\.\d+)?|[a-z])\}?\(([^()]*)\)/g, "(log($2)/log($1))");
  // A degree sign on an angle is the unit the prompt asked for (report d6cf7e4f).
  out = out.replace(/\^\{?\\?circ\}?|\u00b0|\\degree/g, "");
  if (/[<>\u2264\u2265]/.test(out)) {
    // "x<-2 or x>4", typed without spaces or with ∨, is the list "x<-2, x>4".
    out = out.replace(/(?<=[0-9a-z)])(?:or|\u2228)(?=[a-z(-]?[a-z0-9(-]*[<>\u2264\u2265])/g, ",");
    out = (splitTopLevelList(out) ?? [out]).map(normalizeInequalitySide).join(",");
  }
  return out;
};

/** The label family an answer carries, or null when it carries none. */
const labelFamilyOf = (input: string): string | null => {
  let out = input.trim();
  if (out.includes("\\")) out = latexToPlain(out);
  // Keep "_": the label patterns read subscripts, and canonicalizeInput also
  // matches the label before deleting them.
  out = out.toLowerCase().replace(/\s+/g, "").replace(/[{}$]/g, "");
  return matchLabelPrefix(out)?.family ?? null;
};

/**
 * True when the two answers are labelled in ways that cannot mean the same
 * thing — "x=" against "y=", or "T=" against "N=". An unlabelled side never
 * conflicts: omitting the label is normal.
 */
const labelsConflict = (a: string, b: string): boolean => {
  const aLabel = labelFamilyOf(a);
  const bLabel = labelFamilyOf(b);
  return aLabel !== null && bLabel !== null && aLabel !== bLabel;
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
  // Wrapped in its own parentheses so that "ln|x+1|" becomes "ln((abs(x+1)))",
  // a function applied to a parenthesised argument, which the ln→log rewrite
  // and the evaluator both read; "lnabs(x+1)" was a name mathjs did not know,
  // and every antiderivative with a log of an absolute value failed to grade
  // (report 00167fb4).
  while (/\|[^|]+\|/.test(out)) {
    out = out.replace(/\|([^|]+)\|/g, "(abs($1))");
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

// Named constants and Greek letters stand for values: "lambda*d" needs the
// "*" that "lambda d" leaves implicit, exactly as "2x" does.
const NAMED_VALUE_TOKENS = new Set(["pi", "inf", "lambda", "theta"]);

const isValueToken = (token: string) =>
  /^[\d.]+$/.test(token) ||
  /^[a-z]$/.test(token) ||
  token === ")" ||
  NAMED_VALUE_TOKENS.has(token);

const FUNCTION_TOKENS = [
  "combinations",
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
] as const;

const isFunctionToken = (token: string) => (FUNCTION_TOKENS as readonly string[]).includes(token);

const startsValueLike = (token: string) =>
  /^[\d.]+$/.test(token) ||
  /^[a-z]$/.test(token) ||
  token === "(" ||
  NAMED_VALUE_TOKENS.has(token) ||
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

  // mathjs spells the inverse trigonometric functions asin, acos, atan. Done
  // after tokenising, or "acos" would be read as the product a*cos.
  return result.join("").replace(/arc(sin|cos|tan)\(/g, "a$1(");
};

export const normalizeAnswer = (input: string) => {
  let out = canonicalizeInput(input);
  out = insertImplicitMultiplication(out);
  return out;
};

/** The single-letter symbols of a canonical answer, in order, repeats kept. */
const singleLetterTokens = (s: string): string[] =>
  tokenizeForEvaluation(s).filter((tok) => /^[a-z]$/.test(tok));

/** Rename one single-letter symbol throughout a canonical answer. */
const renameLetter = (s: string, from: string, to: string): string =>
  tokenizeForEvaluation(s)
    .map((tok) => (tok === from ? to : tok))
    .join("");

/** Letters a learner might choose for an arbitrary constant. */
const CONSTANT_LETTERS = /^[abcdkmpq]$/;

/**
 * An arbitrary constant is a name, not a value: "y = K e^(x^2/2)" is the
 * stored "y = C e^(x^2/2)", and "x^4/4 + K" is "x^4/4 + C" (report ec52d6b3).
 * When the learner's answer uses exactly one single letter the stored answer
 * does not, and the stored answer uses exactly one constant-like letter the
 * learner's does not, the learner's letter is read as that constant. A
 * variable can never be renamed this way: x, y, t and the other sampled
 * variables are not constant-like, so "t^2 + C" stays wrong for "x^2 + C".
 */
const harmonizeConstantLetter = (a: string, b: string): string => {
  const aLetters = new Set(singleLetterTokens(a));
  const bLetters = new Set(singleLetterTokens(b));
  const onlyA = [...aLetters].filter((l) => !bLetters.has(l) && l !== "e" && l !== "i");
  const onlyB = [...bLetters].filter((l) => !aLetters.has(l) && l !== "e" && l !== "i");
  if (onlyA.length !== 1 || onlyB.length !== 1) return a;
  if (!CONSTANT_LETTERS.test(onlyA[0]) || !CONSTANT_LETTERS.test(onlyB[0])) return a;
  return renameLetter(a, onlyA[0], onlyB[0]);
};

/**
 * Two arbitrary constants A and B label the two terms of a general solution,
 * and nothing says which is which: "A x^(-3) + B x^2" is "A x^2 + B x^(-3)"
 * (report 154635bb). The swapped reading is tried when both answers use both.
 */
const swapAB = (s: string): string | null => {
  const letters = new Set(singleLetterTokens(s));
  if (!letters.has("a") || !letters.has("b")) return null;
  return tokenizeForEvaluation(s)
    .map((tok) => (tok === "a" ? "b" : tok === "b" ? "a" : tok))
    .join("");
};

/**
 * "(11/4, 1/4, 0)", "<2/3, -1/3, 2/3>", "[[1/4,1/4],[1/4,1/4]]": a point,
 * vector or matrix is an ORDERED list of entries, each compared as a value, so
 * a decimal, a fraction and a LaTeX fraction are the same entry (report
 * 9a503a29). Returns null unless the whole string is one bracketed list.
 */
const bracketedEntries = (s: string): { open: string; parts: string[] } | null => {
  const open = s[0];
  const close = { "(": ")", "[": "]", "<": ">" }[open as "(" | "[" | "<"];
  if (!close || s[s.length - 1] !== close) return null;
  // The opening bracket must close at the very end, or "(x-2)(x+3)" would split.
  let depth = 0;
  for (let i = 0; i < s.length; i += 1) {
    if ("([<".includes(s[i])) depth += 1;
    else if (")]>".includes(s[i])) depth -= 1;
    if (depth === 0 && i < s.length - 1) return null;
  }
  const parts = splitTopLevelList(s.slice(1, -1));
  if (!parts) return null;
  return { open, parts };
};

const tuplesEquivalent = async (a: string, b: string): Promise<boolean> => {
  const ta = bracketedEntries(a);
  const tb = bracketedEntries(b);
  if (!ta || !tb) return false;
  if (ta.open !== tb.open || ta.parts.length !== tb.parts.length) return false;
  for (let i = 0; i < ta.parts.length; i += 1) {
    const x = ta.parts[i];
    const y = tb.parts[i];
    if (bracketedEntries(x) && bracketedEntries(y)) {
      if (!(await tuplesEquivalent(x, y))) return false;
    } else if (!(await valuesEquivalent(x, y))) {
      return false;
    }
  }
  return true;
};

// Numeric / expression equivalence (client-side).
//
// The number-only build of mathjs: the grader only ever reads `evaluate` as a
// finite number (see tryEval), so BigNumber, Complex, Fraction, Matrix and
// Unit support would be dead weight — about two thirds of the full library.
// Loaded on the first grade, not with the page. `npm run content:answers`
// replays the whole corpus through this same code, so a build that changed
// what evaluates would fail that gate.
type MathNumber = typeof import("mathjs/number");
let math: MathNumber | null = null;
const getMath = async () => {
  if (math) return math;
  math = await import("mathjs/number");
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

/** Half-up rounding to `places` decimals, nudged past float representation error. */
const roundTo = (value: number, places: number): number => {
  const factor = 10 ** places;
  const nudged = value + Math.sign(value) * 1e-9;
  return Math.round(nudged * factor) / factor;
};

/**
 * Compare two scalar values when at least one side is written as a rounded
 * decimal.
 *
 * A learner may answer to fewer decimals than the stored answer carries, so
 * 0.3 has to be accepted for 0.333. But a raw half-a-unit-in-the-last-place
 * tolerance also accepted 0.25 for 0.2 — half a unit away in *both*
 * directions is a whole unit wide, so neighbouring answers overlapped.
 *
 * The rule instead is the one a marker would use: rounded to the coarser of
 * the two precisions, the values must agree. 0.333 and 0.3 both round to 0.3
 * at one decimal, so 0.3 is accepted; 0.25 rounds to 0.3 and 0.2 does not, so
 * it is not.
 */
const scalarsAgree = (a: number, b: number, aPrepared: string, bPrepared: string): boolean => {
  if (a === b) return true;
  const aPlaces = decimalPlaces(aPrepared);
  const bPlaces = decimalPlaces(bPrepared);
  if (aPlaces === null && bPlaces === null) {
    return Math.abs(a - b) <= 1e-4;
  }
  // The stored answer is a decimal: it was written to the precision the
  // question asks for, so the learner's value must agree with it at THAT
  // precision, and may not be coarser. 0.1 is not 0.1151 to four places, and
  // 0.75 is not 0.7504 (report e3f36995); 0.11506 is.
  if (bPlaces !== null) {
    if (aPlaces !== null && aPlaces < bPlaces) return false;
    if (Math.abs(a - b) > 0.5 * 10 ** -bPlaces) return false;
    return roundTo(a, bPlaces) === roundTo(b, bPlaces);
  }
  // The stored answer is exact (e, pi/4, sqrt 2, 720) and the learner gave a
  // decimal: two places at least, and correct to the last one given.
  if (aPlaces !== null && aPlaces < 2) return false;
  const places = aPlaces ?? 12;
  if (Math.abs(a - b) > 0.5 * 10 ** -places) return false;
  return roundTo(a, places) === roundTo(b, places);
};

const scalarNumericEquivalent = async (aExpr: string, bExpr: string): Promise<boolean> => {
  const m = await getMath();
  const aPrepared = prepareExpressionForEvaluation(aExpr);
  const bPrepared = prepareExpressionForEvaluation(bExpr);
  const aVal = tryEval(m, aPrepared, {});
  const bVal = tryEval(m, bPrepared, {});
  if (aVal === null || bVal === null) return false;
  return scalarsAgree(aVal, bVal, aPrepared, bPrepared);
};

const tryEval = (
  m: MathNumber,
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

// // Sample points (avoid 0 to reduce log/div issues).
// The last four sit inside (-0.5, 0.5) so that answers defined only on a small
// interval — arcsin/arccos derivatives such as 2/sqrt(1-4x^2) — still produce
// the three usable pairs this check requires. Without them a correct answer
// could only ever pass by spelling the stored string exactly.
const SAMPLE_SCOPES = [
  { x: -1.7, y: 0.8, z: -0.4, t: 1.2, n: 2, p: 1.5, s: 0.6, r: 1.1, a: 2.3, b: -1.1, c: 0.7, lambda: 1.9, d: 0.9, k: 1.3, m: -0.6, u: 1.7, v: -1.2, w: 0.4, h: 2.2, q: -0.7, theta: 0.8, i: 1.3 },
  { x: -0.8, y: -1.3, z: 0.6, t: -0.7, n: 3, p: 2.1, s: -1.2, r: 0.4, a: -0.9, b: 1.4, c: 2.2, lambda: -1.2, d: -1.4, k: 0.7, m: 2.1, u: -0.5, v: 1.6, w: -1.9, h: 0.3, q: 1.2, theta: -0.6, i: -0.7 },
  { x: 0.2, y: 1.1, z: 0.9, t: 0.5, n: 4, p: -0.8, s: 2.1, r: -0.7, a: 1.6, b: 0.4, c: -1.7, lambda: 0.6, d: 0.6, k: -1.1, m: 0.8, u: 2.3, v: 0.2, w: 1.1, h: -1.5, q: 0.9, theta: 1.4, i: 0.4 },
  { x: 0.9, y: -0.5, z: -1.4, t: 1.7, n: 5, p: 0.3, s: -0.5, r: 1.8, a: -2.5, b: 2.8, c: 1.1, lambda: 2.4, d: 2.4, k: 1.9, m: -1.3, u: 0.7, v: -2.1, w: 0.9, h: 1.2, q: -1.6, theta: -1.1, i: 2.1 },
  { x: 1.6, y: 0.3, z: 1.5, t: -1.1, n: 6, p: -2.2, s: 1.4, r: -1.3, a: 0.8, b: -0.6, c: 3.1, lambda: -0.9, d: -0.8, k: -0.4, m: 1.5, u: -1.8, v: 0.8, w: -0.3, h: 2.6, q: 2.1, theta: 0.3, i: -1.6 },
  { x: 2.1, y: -0.9, z: 0.2, t: 0.4, n: 7, p: 1.9, s: 0.9, r: 2.2, a: 1.2, b: 1.7, c: -2.6, lambda: 1.3, d: 1.1, k: 2.5, m: 0.3, u: 1.2, v: 1.9, w: -2.2, h: -0.9, q: 0.5, theta: 2.1, i: 0.9 },
  { x: 0.35, y: 0.45, z: -0.25, t: 0.3, n: 2, p: 0.4, s: 0.25, r: 0.35, a: 0.45, b: -0.3, c: 0.2, lambda: 0.4, d: 0.3, k: 0.25, m: -0.35, u: 0.45, v: 0.15, w: 0.2, h: -0.3, q: 0.4, theta: 0.35, i: 0.35 },
  { x: -0.3, y: -0.25, z: 0.4, t: -0.35, n: 3, p: -0.45, s: 0.3, r: -0.2, a: -0.4, b: 0.25, c: -0.35, lambda: -0.3, d: -0.2, k: 0.45, m: 0.3, u: -0.15, v: -0.4, w: 0.35, h: 0.25, q: -0.3, theta: -0.25, i: -0.2 },
  { x: 0.15, y: 0.3, z: 0.15, t: 0.45, n: 4, p: 0.2, s: -0.35, r: 0.15, a: 0.25, b: 0.35, c: 0.45, lambda: 0.2, d: 0.4, k: -0.3, m: 0.15, u: 0.3, v: 0.45, w: -0.25, h: 0.4, q: 0.2, theta: 0.15, i: 0.45 },
  { x: -0.45, y: 0.2, z: -0.4, t: -0.15, n: 5, p: -0.25, s: 0.45, r: -0.45, a: 0.35, b: -0.2, c: 0.3, lambda: -0.45, d: -0.35, k: 0.15, m: -0.2, u: -0.4, v: 0.25, w: 0.45, h: -0.15, q: -0.45, theta: -0.4, i: -0.4 },
  // Three points with x well above 2, so that a real fractional power such as
  // (x-2)^(1/3) — NaN for x < 2 in real arithmetic — still yields the three
  // finite pairs the comparison needs (report 535e41d9).
  { x: 3.3, y: 2.6, z: 3.1, t: 2.8, n: 6, p: 3.4, s: 2.9, r: 3.2, a: 2.7, b: 3.6, c: 2.4, lambda: 2.9, d: 3.1, k: 2.6, m: 3.3, u: 2.8, v: 3.5, w: 2.7, h: 3.4, q: 2.9, theta: 2.6, i: 2.7 },
  { x: 4.7, y: 3.9, z: 4.2, t: 4.4, n: 7, p: 4.1, s: 4.6, r: 3.8, a: 4.3, b: 4.9, c: 3.7, lambda: 4.2, d: 4.5, k: 3.9, m: 4.8, u: 4.1, v: 4.4, w: 3.6, h: 4.7, q: 4.3, theta: 3.8, i: 3.9 },
  { x: 6.2, y: 5.3, z: 5.8, t: 5.6, n: 8, p: 5.9, s: 5.2, r: 6.1, a: 5.5, b: 6.4, c: 5.1, lambda: 5.7, d: 6.3, k: 5.4, m: 5.9, u: 6.1, v: 5.3, w: 5.8, h: 5.6, q: 6.2, theta: 5.4, i: 5.1 },
];

/** "L=R" split into its two sides, or null when the string is not one equation. */
const equationSides = (s: string): [string, string] | null => {
  const idx = s.indexOf("=");
  if (idx <= 0 || idx !== s.lastIndexOf("=") || idx === s.length - 1) return null;
  return [s.slice(0, idx), s.slice(idx + 1)];
};

/**
 * Two equations with free variables describe the same curve, surface or plane
 * when their "left minus right" sides are nonzero constant multiples of each
 * other: 2x-y+4z=12, 4z+2x-y=12, -2x+y-4z=-12 and 2x-y+4z-12=0 are one plane,
 * and 9x^2+5y^2=45 is the ellipse x^2/5+y^2/9=1. Sampling both differences at
 * the shared scopes and checking that their ratio is one nonzero constant
 * decides it; an equation whose difference vanishes everywhere (0=0) matches
 * nothing. Labelled forms such as "y=x^2" never reach here — their label is
 * stripped earlier and the remaining side is compared as an expression.
 */
const equationsEquivalent = async (a: string, b: string): Promise<boolean> => {
  const aSides = equationSides(a);
  const bSides = equationSides(b);
  if (!aSides || !bSides) return false;
  const m = await getMath();
  const fa = prepareExpressionForEvaluation(`(${aSides[0]})-(${aSides[1]})`);
  const fb = prepareExpressionForEvaluation(`(${bSides[0]})-(${bSides[1]})`);
  const ratios: number[] = [];
  for (const scope of SAMPLE_SCOPES) {
    const va = tryEval(m, fa, scope);
    const vb = tryEval(m, fb, scope);
    if (va === null || vb === null) continue;
    if (Math.abs(vb) < 1e-9) {
      if (Math.abs(va) >= 1e-9) return false;
      continue;
    }
    ratios.push(va / vb);
    if (ratios.length >= 5) break;
  }
  if (ratios.length < 3) return false;
  const base = ratios[0];
  if (Math.abs(base) < 1e-9) return false;
  return ratios.every((r) => Math.abs(r - base) <= 1e-6 * Math.max(1, Math.abs(base)));
};

const expressionsEquivalent = async (
  aExpr: string,
  bExpr: string,
  allowConstantOffset: boolean,
) => {
  const m = await getMath();
  const aPrepared = prepareExpressionForEvaluation(aExpr);
  const bPrepared = prepareExpressionForEvaluation(bExpr);

  const pairs: Array<{ a: number; b: number }> = [];

  for (const scope of SAMPLE_SCOPES) {
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
  if (labelsConflict(userInput, expected)) return false;
  const a = normalizeAnswer(userInput);
  const b = normalizeAnswer(expected);
  // An empty submission is never a correct answer, whatever it is compared to.
  if (a === "" || b === "") return false;
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
 * Compare identity instead.
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

/**
 * Split "1,-1" into its parts, but leave "(-2,2)", "<0,0,1>" and "f(x,y)" alone:
 * only commas outside every bracket separate list items.
 */
const splitTopLevelList = (input: string): string[] | null => {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  // Angle brackets delimit a vector only when they enclose the whole answer;
  // in "x>4, x<-2" they are inequalities and must not count as brackets.
  const angle = input.startsWith("<") && input.endsWith(">");
  const opens = angle ? "([{<" : "([{";
  const closes = angle ? ")]}>" : ")]}";
  for (const char of input) {
    if (opens.includes(char)) depth += 1;
    else if (closes.includes(char)) depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  if (depth !== 0 || parts.length < 2) return null;
  if (parts.some((part) => part.trim() === "")) return null;
  return parts.map((part) => part.trim());
};

/**
 * A stored answer may restate the expression before giving its value —
 * "\\binom{9}{3} = 84" normalizes to "combinations(9,3)=84". When every side
 * of the "=" evaluates to the same constant, the identity as a whole means that
 * constant, and a learner may answer with any one side of it. An equation with
 * free variables ("x^2=4") is no identity and is left alone — and so is a
 * worked arithmetic chain ("1+2=3", "289-288=1"): only a side that applies a
 * named function is a restatement rather than shown working, and the sweep
 * counts on the chain forms NOT collapsing onto their value.
 */
const constantIdentityValue = async (input: string): Promise<string | null> => {
  const sides = input.split("=");
  if (sides.length < 2 || sides.some((side) => side === "")) return null;
  if (!sides.some((side) => FUNCTION_TOKENS.some((name) => side.includes(`${name}(`)))) {
    return null;
  }
  const m = await getMath();
  const values = sides.map((side) => tryEval(m, prepareExpressionForEvaluation(side), {}));
  const first = values[0];
  if (first === null) return null;
  if (values.some((v) => v === null || !nearlyEqual(v, first))) return null;
  return sides[sides.length - 1];
};

/** The single-value comparison, without list handling (which builds on it). */
const valuesEquivalent = async (a: string, b: string): Promise<boolean> => {
  // An empty submission is never a correct answer, whatever it is compared to.
  if (a === "" || b === "") return false;
  if (a === b) return true;
  // A trailing "+C" is dropped from both sides only when both have one, so two
  // antiderivatives may differ by a constant; an answer that omits the constant
  // the stored answer carries is not the general solution (report ec52d6b3).
  const bothHaveC = /\+c$/i.test(a) && /\+c$/i.test(b);
  const aNoC = bothHaveC ? stripTrailingConstant(a) : a;
  const bNoC = bothHaveC ? stripTrailingConstant(b) : b;
  if (aNoC === bNoC) return true;
  // An inequality is a condition, not a value: "x>5" and "x>4" evaluate alike
  // at most sample points, so they are compared only as canonical strings.
  if (/[<>\u2264\u2265]/.test(a) || /[<>\u2264\u2265]/.test(b)) return false;
  if (await scalarNumericEquivalent(aNoC, bNoC)) return true;
  const aIdentity = await constantIdentityValue(aNoC);
  const bIdentity = await constantIdentityValue(bNoC);
  if (aIdentity !== null || bIdentity !== null) {
    return valuesEquivalent(aIdentity ?? aNoC, bIdentity ?? bNoC);
  }
  if (await equationsEquivalent(aNoC, bNoC)) return true;
  return expressionsEquivalent(aNoC, bNoC, bothHaveC);
};

/**
 * "2±3i" is the pair "2+3i, 2-3i", so a learner who lists the two roots has
 * given the stored answer and one who writes ± has given the stored list.
 * Only a single ± with no list around it is expanded.
 */
const expandPlusMinus = (input: string): string[] | null => {
  const idx = input.indexOf("\u00b1");
  if (idx === -1 || idx !== input.lastIndexOf("\u00b1") || input.includes(",")) return null;
  if (idx === input.length - 1) return null;
  return [input.replace("\u00b1", "+"), input.replace("\u00b1", "-")];
};

/**
 * Compare comma-separated answers such as "1,-1" — the two roots of a problem
 * with no natural order, which a learner may list either way round.
 *
 * Order is ignored only when no part carries an "=": in "x=-1, y=3" the labels
 * make position meaningful, and swapping them is a different answer.
 */
const listsEquivalent = async (aParts: string[], bParts: string[]): Promise<boolean> => {
  if (aParts.length !== bParts.length) return false;

  // Each item is compared like a whole answer, so "x = 3, x = -3" accepts the
  // "3,-3" a learner would type — while still refusing a swapped labelled pair.
  const partsEquivalent = async (a: string, b: string) => {
    if (labelsConflict(a, b)) return false;
    return valuesEquivalent(normalizeAnswer(a), normalizeAnswer(b));
  };

  const ordered = await Promise.all(aParts.map((part, i) => partsEquivalent(part, bParts[i])));
  if (ordered.every(Boolean)) return true;

  // Labels fix the order only when they differ: "x=3, x=-3" names the same
  // unknown twice, so "x=-3, x=3" is the same pair of roots, while "x=3, y=-1"
  // against "x=-1, y=3" is a different point.
  const families = new Set(
    [...aParts, ...bParts].map((part) => labelFamilyOf(part)).filter((f): f is string => f !== null),
  );
  if (families.size > 1) return false;

  const unmatched = [...bParts];
  for (const part of aParts) {
    let found = -1;
    for (let i = 0; i < unmatched.length; i += 1) {
      if (await partsEquivalent(part, unmatched[i])) {
        found = i;
        break;
      }
    }
    if (found === -1) return false;
    unmatched.splice(found, 1);
  }
  return true;
};

// Async version for richer checks (used by practice/test flows)
export type GradingOptions = {
  /**
   * The question's prompt. "Factor", "Expand" and "Simplify" questions ask for
   * a FORM, not just a value: with the prompt the grader refuses the
   * question's own expression typed back, an unfactored product or an
   * unexpanded power (report 7c34cb2c).
   */
  prompt?: string;
};

/** Top-level factors of a canonical product: "2*(x+2)*(x+3)" has three. */
const topLevelFactors = (s: string): string[] | null => {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let k = 0; k < s.length; k += 1) {
    const ch = s[k];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    // A + or - at the top level (other than a leading sign) means a sum.
    if (depth === 0 && (ch === "+" || (ch === "-" && k > 0 && !"*/^(".includes(s[k - 1])))) return null;
    if (depth === 0 && ch === "*") {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts.filter((p) => p !== "");
};

const satisfiesRequestedForm = (typed: string, stored: string, prompt: string): boolean => {
  if (typed === stored) return true;
  // The question's own expression, typed back, is never the answer.
  // Parentheses are dropped for this comparison only: the LaTeX fraction in
  // the prompt and the typed one differ in grouping, not in substance.
  const bare = (s: string) => s.replace(/[()]/g, "");
  const fragments = [...prompt.matchAll(/\$([^$]+)\$/g)].map((m) => bare(normalizeAnswer(m[1])));
  if (fragments.some((f) => f === bare(typed) && f !== bare(stored))) return false;
  const head = prompt.trim().toLowerCase();
  if (/^factor/.test(head)) {
    const typedFactors = topLevelFactors(typed);
    const storedFactors = topLevelFactors(stored);
    if (!typedFactors) return false;
    if (storedFactors && typedFactors.length < storedFactors.length) return false;
  } else if (/^(expand|multiply out)/.test(head)) {
    if (typed.includes("(") && !stored.includes("(")) return false;
  }
  return true;
};

export const isAnswerCorrectAsync = async (
  userInput: string,
  expected: string,
  options: GradingOptions = {},
): Promise<boolean> => {
  const ok = await answersEquivalent(userInput, expected);
  if (!ok || !options.prompt) return ok;
  const b = normalizeAnswer(expected);
  const a = harmonizeConstantLetter(normalizeAnswer(userInput), b);
  return satisfiesRequestedForm(a, b, options.prompt);
};

const answersEquivalent = async (userInput: string, expected: string): Promise<boolean> => {
  // "y = -3" must not pass for "x = -3": different labels, different answers.
  if (labelsConflict(userInput, expected)) return false;

  const b = normalizeAnswer(expected);
  const a = harmonizeConstantLetter(normalizeAnswer(userInput), b);
  if (await valuesEquivalent(a, b)) return true;
  // "46.9%" where the stored answer is the percentage figure 46.90: the unit
  // the prompt asked for is not a factor of 1/100 (report d6cf7e4f).
  if (a.endsWith("%") && !b.includes("%") && (await valuesEquivalent(a.slice(0, -1), b))) return true;
  if (await tuplesEquivalent(a, b)) return true;
  if (looksLikeLogic(a) && looksLikeLogic(b) && logicEquivalent(a, b)) return true;
  const swapped = swapAB(a);
  if (swapped && swapAB(b) && (await valuesEquivalent(swapped, b))) return true;

  // Lists are split with every label still in place, so that "x=3, y=-1"
  // keeps both of its labels for the order check below; each part drops its
  // own label when it is compared.
  const aList = canonicalizeInput(userInput, true);
  const bList = canonicalizeInput(expected, true);
  const aParts = splitTopLevelList(aList) ?? expandPlusMinus(aList);
  const bParts = splitTopLevelList(bList) ?? expandPlusMinus(bList);
  if (aParts && bParts) return listsEquivalent(aParts, bParts);

  // "x - 1 = 0" is the plane "x = 1": with the label kept, the two are one
  // equation (report 10f75610).
  if (aList.includes("=") && bList.includes("=") && !aParts && !bParts && (await equationsEquivalent(aList, bList))) {
    return true;
  }

  // Information-theoretic answers such as 2^(n*I(Y;U)) are not expressions
  // the sampler can evaluate (the ";" alone rules that out), so they are
  // compared as symbols — and a product written implicitly, 2^(nI(Y;U)), is
  // the same symbols (report 8cbca1fd).
  if (a.includes(";") && b.includes(";")) {
    return a.replace(/\*/g, "") === b.replace(/\*/g, "");
  }

  return false;
};

