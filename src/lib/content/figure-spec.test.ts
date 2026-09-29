import { describe, expect, it } from "vitest";
import { evaluateExpression, parseFigureSpec } from "./figure-spec";

describe("parseFigureSpec", () => {
  it("accepts a plot with ranges and marks", () => {
    const spec = parseFigureSpec('{"type":"plot","x":[0,1],"y":[0,1],"marks":[]}');
    expect(spec).not.toBeNull();
    expect(spec?.type).toBe("plot");
  });

  it("returns null rather than throwing on anything malformed", () => {
    expect(parseFigureSpec("not json")).toBeNull();
    expect(parseFigureSpec('{"type":"bar","x":[0,1],"y":[0,1],"marks":[]}')).toBeNull();
    expect(parseFigureSpec('{"type":"plot","x":[1,0],"y":[0,1],"marks":[]}')).toBeNull();
    expect(parseFigureSpec('{"type":"plot","x":[0,1],"y":[0,1]}')).toBeNull();
  });
});

describe("evaluateExpression", () => {
  it("evaluates polynomials, functions and constants", () => {
    expect(evaluateExpression("x^2+1", 2)).toBe(5);
    expect(Math.abs(evaluateExpression("sin(pi)", 0))).toBeLessThan(1e-12);
    expect(evaluateExpression("-x^2", 3)).toBe(-9);
  });

  it("makes ^ right-associative", () => {
    expect(evaluateExpression("2^3^2", 0)).toBe(512);
  });

  it("reads several variables from a scope", () => {
    expect(evaluateExpression("x*y", { x: 2, y: 5 })).toBe(10);
  });

  it("requires explicit multiplication", () => {
    expect(Number.isNaN(evaluateExpression("2x", 3))).toBe(true);
  });
});
