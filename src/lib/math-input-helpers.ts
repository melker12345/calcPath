export type QuestionContext = {
  hasVariable?: string[];
  hasTrig?: boolean;
  hasExp?: boolean;
  hasLn?: boolean;
  hasPi?: boolean;
};

const stripOptionalLabelPrefix = (input: string) =>
  input.replace(/^(?:[a-z]+(?:_[a-z0-9]+)?|[a-z])=/i, "");

export function detectQuestionContext(prompt: string): QuestionContext {
  const context: Required<QuestionContext> = {
    hasVariable: [],
    hasTrig: false,
    hasExp: false,
    hasLn: false,
    hasPi: false,
  };

  const pushVar = (letter: string) => {
    if (!context.hasVariable.includes(letter)) context.hasVariable.push(letter);
  };

  if (/\bx\b/.test(prompt)) pushVar("x");
  if (/\by\b/.test(prompt)) pushVar("y");
  if (/\bt\b/.test(prompt)) pushVar("t");
  if (/\bn\b/.test(prompt)) pushVar("n");
  if (/\bz\b/.test(prompt)) pushVar("z");
  if (/\bp\b/i.test(prompt)) pushVar("p");
  if (/\bs\b/i.test(prompt)) pushVar("s");
  if (/\br\b/.test(prompt)) pushVar("r");
  if (/\bu\b/.test(prompt)) pushVar("u");
  if (/\bv\b/.test(prompt)) pushVar("v");
  if (/\bw\b/.test(prompt)) pushVar("w");
  if (/\bk\b/.test(prompt)) pushVar("k");
  if (/\bm\b/.test(prompt)) pushVar("m");
  if (/\bh\b/.test(prompt)) pushVar("h");
  if (/\bd\b/.test(prompt)) pushVar("d");
  if (/\bf\b/.test(prompt)) pushVar("f");
  if (/\bg\b/.test(prompt)) pushVar("g");
  if (/\bl\b/.test(prompt)) pushVar("l");
  if (/\bq\b/.test(prompt)) pushVar("q");
  if (/\bc\b/.test(prompt)) pushVar("c");

  if (/\\?(sin|cos|tan|sec|csc|cot|sinh|cosh|tanh)/i.test(prompt)) context.hasTrig = true;
  if (/e\^|\\exp/i.test(prompt)) context.hasExp = true;
  if (/\\ln|\\log/i.test(prompt)) context.hasLn = true;
  if (/\\pi|π/i.test(prompt)) context.hasPi = true;

  return context;
}

export function deriveSuggestionLabels(
  answer: string | undefined,
  questionCtx: QuestionContext | undefined,
): string[] {
  const labels: string[] = [];
  const added = new Set<string>();
  const answerSrc = stripOptionalLabelPrefix(
    (answer ?? "")
      .replace(/⟨/g, "<")
      .replace(/⟩/g, ">")
      .replace(/λ/g, "lambda"),
  );

  const add = (label: string) => {
    if (added.has(label)) return;
    added.add(label);
    labels.push(label);
  };

  // Build richer src including ctx flags for constants (e, ln, pi).
  // IMPORTANT: do NOT inject full trig family from hasTrig (that used to cause "way too many options"
  // for any question whose prompt mentioned sin/cos etc., even when final answer was a plain number).
  // Trig buttons only surface if the answer string itself contains them (rare for final numeric answers).
  // hasExp/hasLn/hasPi still help suggest 'e'/'ln'/'π' when prompt signals the form but answer string may vary.
  let ctxExtra = "";
  if (questionCtx?.hasExp) ctxExtra += " e exp ";
  if (questionCtx?.hasLn) ctxExtra += " ln log ";
  if (questionCtx?.hasPi) ctxExtra += " pi π ";
  const src = `${answerSrc} ${questionCtx?.hasVariable?.join(" ") ?? ""} ${ctxExtra}`;
  const hasLowerSymbol = (symbol: string) =>
    new RegExp(`(^|[^a-z])${symbol}($|[^a-z])`).test(src);
  const hasUpperSymbol = (symbol: string) =>
    new RegExp(`\\b${symbol}(?![A-Za-z])|${symbol}(?=[=(a-zA-Z])`).test(answerSrc);

  if (hasLowerSymbol("x")) add("x");
  if (hasLowerSymbol("y")) add("y");
  if (hasLowerSymbol("t")) add("t");
  if (hasLowerSymbol("n")) add("n");
  if (hasLowerSymbol("a")) add("a");
  if (hasLowerSymbol("z")) add("z");
  if (hasLowerSymbol("p")) add("p");
  if (hasLowerSymbol("s")) add("s");
  if (hasLowerSymbol("r")) add("r");
  if (hasLowerSymbol("u")) add("u");
  if (hasLowerSymbol("v")) add("v");
  if (hasLowerSymbol("w")) add("w");
  if (hasLowerSymbol("k")) add("k");
  if (hasLowerSymbol("m")) add("m");
  if (hasLowerSymbol("h")) add("h");
  if (hasLowerSymbol("d")) add("d");
  if (hasLowerSymbol("f")) add("f");
  if (hasLowerSymbol("g")) add("g");
  if (hasLowerSymbol("l")) add("l");
  if (hasLowerSymbol("q")) add("q");
  if (hasLowerSymbol("c")) add("c");
  if (hasLowerSymbol("b")) add("b");

  // Any single-letter variable token required by the canonical answer (e.g.
  // "4s", "2R", "k*M", "IV"): a letter the learner must type gets a key,
  // whatever its case. LaTeX commands are single tokens, so their letters
  // never leak onto the keypad.
  const upperFromTokens: string[] = [];
  for (const token of tokenizeAnswer(answer ?? "")) {
    if (/^[a-z]$/.test(token) && !KNOWN_WORD_TOKENS.includes(token as (typeof KNOWN_WORD_TOKENS)[number])) {
      add(token);
    } else if (/^[A-Z]$/.test(token)) {
      upperFromTokens.push(token);
    }
  }
  if (hasUpperSymbol("C")) add("C");
  if (hasUpperSymbol("A")) add("A");
  if (hasUpperSymbol("B")) add("B");
  if (hasUpperSymbol("P")) add("P");
  if (hasUpperSymbol("N")) add("N");
  if (hasUpperSymbol("T")) add("T");
  for (const token of upperFromTokens) add(token);
  if (/lambda/i.test(src)) add("λ");
  if (/theta|θ/i.test(src)) add("θ");
  // Logic and set-theory answers: a phone keyboard has none of these, so each
  // symbol the stored answer uses (as LaTeX or as the character) gets a key.
  for (const { label, pattern } of SYMBOL_KEYS) {
    if (pattern.test(answer ?? "")) add(label);
  }

  if (/sin/i.test(src)) add("sin");
  if (/cos/i.test(src)) add("cos");
  if (/tan/i.test(src)) add("tan");
  if (/sinh/i.test(src)) add("sinh");
  if (/cosh/i.test(src)) add("cosh");
  if (/tanh/i.test(src)) add("tanh");
  if (/sec/i.test(src)) add("sec");
  if (/csc/i.test(src)) add("csc");
  if (/cot/i.test(src)) add("cot");
  if (/arcsin/i.test(src)) add("arcsin");
  if (/arccos/i.test(src)) add("arccos");
  if (/arctan/i.test(src)) add("arctan");

  if (/\be\b|e\^/.test(src)) add("e");
  if (/\bln\b/i.test(src)) add("ln");
  if (/\blog\b/i.test(src)) add("log");
  if (/pi|π/i.test(src) || questionCtx?.hasPi) add("π");
  if (/inf|∞/i.test(src)) add("∞");
  if (/sqrt|√/i.test(src)) add("√");
  if (/=/.test(answer ?? "")) add("=");
  if (/,/.test(answer ?? "")) add(",");
  if (/\|/.test(answer ?? "")) add("| |");
  if (/\[/.test(answer ?? "")) add("[");
  if (/\]/.test(answer ?? "")) add("]");
  if (/</.test(answerSrc) || /⟨/.test(answer ?? "")) add("<");
  if (/>/.test(answerSrc) || /⟩/.test(answer ?? "")) add(">");
  // Inequalities: there is no ≤/≥ on a phone keyboard, so an answer written
  // with \le / \ge (or the characters themselves) gets its own key.
  if (/\\leq?\b|≤|<=/.test(answer ?? "")) add("≤");
  if (/\\geq?\b|≥|>=/.test(answer ?? "")) add("≥");
  if (/_/.test(answer ?? "")) add("_");
  if (/\//.test(answer ?? "")) add("a/b");
  if (/\^/.test(answer ?? "")) add("xⁿ");

  return labels;
}

/**
 * Symbol keys for logic and set theory. `pattern` matches the stored answer in
 * any spelling; `latex` is what the key writes into the MathQuill field.
 * Report cb8e6375 found ~55 answers needing these with no way to type them.
 */
export const SYMBOL_KEYS: Array<{ label: string; latex: string; pattern: RegExp }> = [
  { label: "∀", latex: "\\forall ", pattern: /\\forall(?![A-Za-z])|∀/ },
  { label: "∃", latex: "\\exists ", pattern: /\\exists(?![A-Za-z])|∃/ },
  { label: "¬", latex: "\\neg ", pattern: /\\l?not(?![A-Za-z])|\\neg(?![A-Za-z])|¬/ },
  { label: "∧", latex: "\\wedge ", pattern: /\\land(?![A-Za-z])|\\wedge(?![A-Za-z])|∧/ },
  { label: "∨", latex: "\\vee ", pattern: /\\lor(?![A-Za-z])|\\vee(?![A-Za-z])|∨/ },
  { label: "→", latex: "\\to ", pattern: /\\to(?![A-Za-z])|\\rightarrow(?![A-Za-z])|\\implies(?![A-Za-z])|\\Rightarrow(?![A-Za-z])|→|⇒|->/ },
  { label: "↔", latex: "\\leftrightarrow ", pattern: /\\leftrightarrow(?![A-Za-z])|\\Leftrightarrow(?![A-Za-z])|\\iff(?![A-Za-z])|↔|⇔|<->|<=>/ },
  { label: "∅", latex: "\\emptyset ", pattern: /\\emptyset(?![A-Za-z])|\\varnothing(?![A-Za-z])|∅/ },
  { label: "∈", latex: "\\in ", pattern: /\\in(?![A-Za-z])|∈/ },
  { label: "∉", latex: "\\notin ", pattern: /\\notin(?![A-Za-z])|∉/ },
  { label: "⊆", latex: "\\subseteq ", pattern: /\\subseteq(?![A-Za-z])|⊆/ },
  { label: "⊂", latex: "\\subset ", pattern: /\\subset(?![A-Za-z])|⊂/ },
  { label: "∪", latex: "\\cup ", pattern: /\\cup(?![A-Za-z])|∪/ },
  { label: "∩", latex: "\\cap ", pattern: /\\cap(?![A-Za-z])|∩/ },
  { label: "≠", latex: "\\ne ", pattern: /\\neq?(?![A-Za-z])|≠|!=/ },
  { label: "ℵ", latex: "\\aleph ", pattern: /\\aleph(?![A-Za-z])|ℵ/ },
  { label: "ω", latex: "\\omega ", pattern: /\\omega(?![A-Za-z])|ω/ },
  { label: "Π", latex: "\\Pi ", pattern: /\\Pi(?![A-Za-z])|Π/ },
  // Set braces only: a LaTeX grouping brace (after ^, _, } or a command name)
  // is not something the learner types.
  { label: "{ }", latex: "\\{\\}", pattern: /\\\{|(?:^|[^A-Za-z^_}\\])\{/ },
];

const TOKEN_LABEL_MAP: Record<string, string[]> = {
  "π": ["pi"],
  "∞": ["inf"],
  "√": ["sqrt"],
  "λ": ["lambda"],
  "θ": ["theta"],
  "| |": ["|"],
  "a/b": ["/"],
  "xⁿ": ["^"],
  "{ }": ["{", "}"],
  "→": ["→"],
  "↔": ["↔"],
  "¬": ["¬"],
  "≠": ["≠"],
};

const ALWAYS_AVAILABLE_TOKENS = new Set([
  "+",
  "-",
  "*",
  "/",
  "^",
  "(",
  ")",
  ".",
  "=",
  ",",
  "[",
  "]",
  "<",
  ">",
  "sqrt",
  "number",
]);

const KNOWN_WORD_TOKENS = [
  "lambda",
  "theta",
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
  "ln",
  "pi",
  "inf",
] as const;

function tokenizeAnswer(answer: string): string[] {
  const tokens: string[] = [];
  let folded = answer
    .replace(/\$/g, "")
    // Spacing and sizing commands are typeset, not typed.
    .replace(/\\[,;:! ]|\\(?:left|right|quad|qquad)(?![A-Za-z])/g, "")
    .replace(/\\leq?\b|<=/g, "≤")
    .replace(/\\geq?\b|>=/g, "≥")
    .replace(/\\infty\b|infinity/g, "inf")
    .replace(/\\(?:mathbb|mathrm|mathbf|mathcal|operatorname|text)\b/g, "")
    .replace(/\\([{}])/g, "$1")
    .replace(/\\lambda\b/g, "lambda")
    .replace(/\\theta\b|θ/g, "theta")
    .replace(/\\pi\b/g, "pi");
  for (const { label, pattern } of SYMBOL_KEYS) {
    if (label === "{ }") continue;
    folded = folded.replace(new RegExp(pattern.source, "g"), label);
  }
  const src = stripOptionalLabelPrefix(
    folded
      .replace(/\s+/g, "")
      .replace(/⟨/g, "<")
      .replace(/⟩/g, ">")
      .replace(/λ/g, "lambda"),
  );
  let i = 0;

  while (i < src.length) {
    const char = src[i];

    if (/\d/.test(char)) {
      i += 1;
      while (i < src.length && /[\d.]/.test(src[i])) i += 1;
      tokens.push("number");
      continue;
    }

    const word = KNOWN_WORD_TOKENS.find((token) => src.startsWith(token, i));
    if (word) {
      tokens.push(word);
      i += word.length;
      continue;
    }

    // A LaTeX command (\hat, \mathbb, \alpha) is one token, not a run of
    // letters the keypad would otherwise offer one by one.
    if (char === "\\") {
      let j = i + 1;
      while (j < src.length && /[A-Za-z]/.test(src[j])) j += 1;
      if (j > i + 1) {
        tokens.push(src.slice(i, j));
        i = j;
        continue;
      }
    }

    if (/[A-Za-z]/.test(char)) {
      tokens.push(char);
      i += 1;
      continue;
    }

    tokens.push(char);
    i += 1;
  }

  return tokens;
}

export function analyzeAnswerInput(
  answer: string,
  questionCtx: QuestionContext | undefined,
) {
  const suggestionLabels = deriveSuggestionLabels(answer, questionCtx);
  const supported = new Set(ALWAYS_AVAILABLE_TOKENS);

  for (const label of suggestionLabels) {
    supported.add(label);
    for (const token of TOKEN_LABEL_MAP[label] ?? []) supported.add(token);
  }

  const requiredTokens = tokenizeAnswer(answer);
  const missing = [...new Set(requiredTokens.filter((token) => !supported.has(token)))];

  return {
    suggestionLabels,
    requiredTokens,
    missing,
    canEnter: missing.length === 0,
  };
}
