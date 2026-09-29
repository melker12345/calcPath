import { describe, expect, it } from "vitest";
import { normalizeMathText } from "./math-text-normalize";

describe("normalizeMathText", () => {
  it("adds the missing backslash to bare LaTeX commands inside math", () => {
    expect(normalizeMathText("$frac{1}{2}$")).toBe("$\\frac{1}{2}$");
    expect(normalizeMathText("$pi r^2$")).toBe("$\\pi r^{2}$");
  });

  it("collapses over-escaped commands, in inline and display math", () => {
    expect(normalizeMathText("$\\\\omega + \\\\alpha$")).toBe("$\\omega + \\alpha$");
    expect(normalizeMathText("$$\\\\frac{a}{b}$$")).toBe("$$\\frac{a}{b}$$");
  });

  it("keeps matrix row separators intact", () => {
    const m = "$\\begin{pmatrix} a \\\\ b \\end{pmatrix}$";
    expect(normalizeMathText(m)).toBe(m);
  });

  it("leaves words inside \\text{} alone", () => {
    const t = "$\\text{sum of } x$";
    expect(normalizeMathText(t)).toBe(t);
  });

  it("braces bare numeric exponents", () => {
    expect(normalizeMathText("$e^2 + x^10$")).toBe("$e^{2} + x^{10}$");
  });

  it("treats an escaped dollar as text and never touches prose", () => {
    expect(normalizeMathText("costs \\$5 and $x$")).toBe("costs \\$5 and $x$");
    expect(normalizeMathText("no math here")).toBe("no math here");
    expect(normalizeMathText("")).toBe("");
  });
});
