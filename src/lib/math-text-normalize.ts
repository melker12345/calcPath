/**
 * Fixes common LaTeX authoring mistakes inside $...$ / $$...$$ before KaTeX render.
 * Only mutates math delimiters — prose outside dollars is left unchanged.
 */

const MATH_COMMAND_FIXES: Array<[RegExp, string]> = [
  [/(?<!\\)\bLeftrightarrow\b/g, "\\Leftrightarrow"],
  [/(?<!\\)\bRightarrow\b/g, "\\Rightarrow"],
  [/(?<!\\)\bLeftarrow\b/g, "\\Leftarrow"],
  [/(?<!\\)\brightarrow\b/g, "\\rightarrow"],
  [/(?<!\\)\bleftarrow\b/g, "\\leftarrow"],
  [/(?<!\\)\bneq\b/g, "\\neq"],
  [/(?<!\\)\bleq\b/g, "\\leq"],
  [/(?<!\\)\bgeq\b/g, "\\geq"],
  [/(?<!\\)\bcdot\b/g, "\\cdot"],
  [/(?<!\\)\btimes\b/g, "\\times"],
  [/(?<!\\)\binfty\b/g, "\\infty"],
  [/(?<!\\)\bfrac\b/g, "\\frac"],
  [/(?<!\\)\bsqrt\b/g, "\\sqrt"],
  [/(?<!\\)\bpm\b/g, "\\pm"],
  [/(?<!\\)\bmp\b/g, "\\mp"],
  [/(?<!\\)\bpi\b/g, "\\pi"],
  [/(?<!\\)\btheta\b/g, "\\theta"],
  [/(?<!\\)\balpha\b/g, "\\alpha"],
  [/(?<!\\)\bbeta\b/g, "\\beta"],
  [/(?<!\\)\bgamma\b/g, "\\gamma"],
  [/(?<!\\)\bdelta\b/g, "\\delta"],
  [/(?<!\\)\bvarepsilon\b/g, "\\varepsilon"],
  [/(?<!\\)\blambda\b/g, "\\lambda"],
  [/(?<!\\)\bsigma\b/g, "\\sigma"],
  [/(?<!\\)\bsum\b/g, "\\sum"],
  [/(?<!\\)\bint\b/g, "\\int"],
  [/(?<!\\)\blim\b/g, "\\lim"],
  [/(?<!\\)\bsin\b/g, "\\sin"],
  [/(?<!\\)\bcos\b/g, "\\cos"],
  [/(?<!\\)\btan\b/g, "\\tan"],
  [/(?<!\\)\bln\b/g, "\\ln"],
  [/(?<!\\)\blog\b/g, "\\log"],
];

function normalizeMathInner(inner: string): string {
  let normalized = inner;

  // Some authored math over-escapes commands (e.g. "\\omega", "\\frac") where a
  // single backslash was meant. We undo that, but ONLY outside \begin{...}\end{...}
  // environments — inside matrices/arrays/cases the "\\" is a real row separator
  // and must be preserved (collapsing it produces an invalid lone "\").
  const envs: string[] = [];
  normalized = normalized.replace(
    /\\begin\{[\s\S]*?\\end\{[a-zA-Z*]+\}/g,
    (match) => {
      envs.push(match);
      return `\u0000ENV${envs.length - 1}\u0000`;
    },
  );
  // Outside environments, "\\" immediately before a letter is an over-escaped command.
  normalized = normalized.replace(/\\\\(?=[a-zA-Z])/g, "\\");
  normalized = normalized.replace(/\u0000ENV(\d+)\u0000/g, (_, i: string) => envs[Number(i)]);

  for (const [pattern, replacement] of MATH_COMMAND_FIXES) {
    normalized = normalized.replace(pattern, replacement);
  }
  // Bare exponents like e^2 or x^10 are fragile in some KaTeX paths — prefer braces.
  normalized = normalized.replace(/([A-Za-z])\^(\d+)/g, "$1^{$2}");
  return normalized;
}

export function normalizeMathText(text: string): string {
  if (!text) return text;

  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, inner: string) => `$$${normalizeMathInner(inner)}$$`)
    .replace(/\$([\s\S]*?)\$/g, (_, inner: string) => `$${normalizeMathInner(inner)}$`);
}