const stripTrailingConstant = (input: string) => {
  // Allow optional "+C" / "C" (indefinite integrals).
  // Examples: "x^2/2+C", "x^2/2 + c", "x^2/2"
  return input.replace(/\+?c$/i, "");
};

export const normalizeAnswer = (input: string) => {
  let out = input.trim().toLowerCase();
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

