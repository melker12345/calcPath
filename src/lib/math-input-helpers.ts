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
    new RegExp(`\\b${symbol}\\b|${symbol}(?=[=(a-zA-Z])`).test(answerSrc);

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

  // Any single-letter variable token required by the canonical answer (e.g. "4s").
  for (const token of tokenizeAnswer(answer ?? "")) {
    if (/^[a-z]$/.test(token) && !KNOWN_WORD_TOKENS.includes(token as (typeof KNOWN_WORD_TOKENS)[number])) {
      add(token);
    }
  }
  if (hasUpperSymbol("C")) add("C");
  if (hasUpperSymbol("A")) add("A");
  if (hasUpperSymbol("B")) add("B");
  if (hasUpperSymbol("P")) add("P");
  if (hasUpperSymbol("N")) add("N");
  if (hasUpperSymbol("T")) add("T");
  if (/lambda/i.test(src)) add("λ");

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
  if (/_/.test(answer ?? "")) add("_");
  if (/\//.test(answer ?? "")) add("a/b");
  if (/\^/.test(answer ?? "")) add("xⁿ");

  return labels;
}

const TOKEN_LABEL_MAP: Record<string, string[]> = {
  "π": ["pi"],
  "∞": ["inf"],
  "√": ["sqrt"],
  "λ": ["lambda"],
  "| |": ["|"],
  "a/b": ["/"],
  "xⁿ": ["^"],
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
  const src = stripOptionalLabelPrefix(
    answer.replace(/\s+/g, "").replace(/⟨/g, "<").replace(/⟩/g, ">").replace(/λ/g, "lambda"),
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
