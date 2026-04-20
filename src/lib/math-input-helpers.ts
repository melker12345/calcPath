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

  if (/\bx\b/.test(prompt)) context.hasVariable.push("x");
  if (/\by\b/.test(prompt)) context.hasVariable.push("y");
  if (/\bt\b/.test(prompt)) context.hasVariable.push("t");
  if (/\bn\b/.test(prompt)) context.hasVariable.push("n");
  if (/\bz\b/.test(prompt)) context.hasVariable.push("z");
  if (/\bp\b/.test(prompt)) context.hasVariable.push("p");

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

  const src = `${answerSrc} ${questionCtx?.hasVariable?.join(" ") ?? ""}`;
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
  if (/inf/i.test(src)) add("∞");
  if (/sqrt/i.test(src)) add("√");
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
