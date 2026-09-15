/**
 * Figure specs for `:::figure` environments.
 *
 * A figure is authored as a small JSON spec inside the fence, not as SVG:
 *
 *   :::figure[The secant slope approaches the tangent slope]{#secant-figure}
 *   {
 *     "type": "plot",
 *     "x": [-0.2, 2.4], "y": [-0.5, 5],
 *     "marks": [
 *       { "kind": "function", "fn": "x^2", "label": "y = x^2" },
 *       { "kind": "line", "through": [[1, 1], [2, 4]], "dashed": true },
 *       { "kind": "point", "at": [1, 1], "label": "a" }
 *     ]
 *   }
 *   :::
 *
 * Why a spec and not hand-written SVG:
 *
 * - Chapter files run through `marked`, so raw SVG markup in a module would be
 *   unsanitised HTML passing through a Markdown lexer. A spec never becomes
 *   markup until a React component renders it.
 * - Every figure is drawn by the same primitives, so the subject gets one house
 *   style instead of one style per author.
 * - Colours resolve to the site's CSS variables, so a figure re-themes itself in
 *   dark mode. A raster image cannot.
 * - A figure built from the numbers an example actually uses cannot drift away
 *   from the prose beside it.
 *
 * Coordinates in a spec are always in DATA space. The renderer maps them to the
 * viewBox, so an author never thinks in pixels.
 */

export type Point = [number, number];

/** A curve given by an expression in x, sampled by the renderer. */
export type FunctionMark = {
  kind: "function";
  /** Expression in `x` — see evaluateExpression for the accepted grammar. */
  fn: string;
  /** Defaults to the plot's x-range. */
  from?: number;
  to?: number;
  label?: string;
  dashed?: boolean;
  /** Draw in the muted colour rather than the accent. */
  muted?: boolean;
};

/** A polyline through explicit data points — measured data, not a formula. */
export type PathMark = {
  kind: "path";
  points: Point[];
  label?: string;
  dashed?: boolean;
  muted?: boolean;
};

/** An infinite-ish straight line drawn through two points (secants, tangents, fits). */
export type LineMark = {
  kind: "line";
  through: [Point, Point];
  /** Extend past the two points to the edge of the plot. Default true. */
  extend?: boolean;
  label?: string;
  dashed?: boolean;
  muted?: boolean;
};

export type PointMark = {
  kind: "point";
  at: Point;
  label?: string;
  /** Hollow circle instead of filled — an excluded endpoint. */
  open?: boolean;
};

/** An arrow from one point to another — vectors, projections. */
export type ArrowMark = {
  kind: "arrow";
  from: Point;
  to: Point;
  label?: string;
  dashed?: boolean;
  muted?: boolean;
};

/** Region under a curve or between two curves, over [from, to]. */
export type AreaMark = {
  kind: "area";
  fn: string;
  /** Lower boundary; defaults to the x-axis. */
  below?: string;
  from: number;
  to: number;
  label?: string;
};

/** Bars from explicit data — histograms, discrete distributions. */
export type BarsMark = {
  kind: "bars";
  /** [left edge, right edge, height] per bar, in data coordinates. */
  bars: Array<[number, number, number]>;
  label?: string;
};

/** Free-standing text at a data coordinate. */
export type TextMark = {
  kind: "text";
  at: Point;
  text: string;
  muted?: boolean;
};

export type Mark =
  | FunctionMark
  | PathMark
  | LineMark
  | PointMark
  | ArrowMark
  | AreaMark
  | BarsMark
  | TextMark;

export type PlotSpec = {
  type: "plot";
  /** Data-space range [min, max]. */
  x: [number, number];
  y: [number, number];
  marks: Mark[];
  xLabel?: string;
  yLabel?: string;
  /** Tick spacing in data units. Omit for no ticks. */
  xTicks?: number;
  yTicks?: number;
  /** Draw the x and y axes through the origin. Default true. */
  axes?: boolean;
  /** Aspect ratio width/height of the drawing area. Default 1.6. */
  aspect?: number;
  /**
   * Force one data unit in x to be the same length as one data unit in y.
   * Required for anything geometric — a projection, a right angle, a circle —
   * where an unequal scale silently draws the wrong angle. Overrides `aspect`.
   */
  equalAspect?: boolean;
};

export type FigureSpec = PlotSpec;

/**
 * Parse a figure body. Returns null for anything malformed, so a bad spec
 * degrades to the raw text rather than throwing during a page render.
 */
export function parseFigureSpec(body: string): FigureSpec | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body.trim());
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const spec = parsed as Partial<PlotSpec>;
  if (spec.type !== "plot") return null;
  if (!isRange(spec.x) || !isRange(spec.y)) return null;
  if (!Array.isArray(spec.marks)) return null;
  return spec as PlotSpec;
}

const isRange = (v: unknown): v is [number, number] =>
  Array.isArray(v) &&
  v.length === 2 &&
  typeof v[0] === "number" &&
  typeof v[1] === "number" &&
  Number.isFinite(v[0]) &&
  Number.isFinite(v[1]) &&
  v[1] > v[0];

/* ------------------------------------------------------------------ *
 * Expression evaluation
 *
 * A deliberately small recursive-descent evaluator rather than mathjs.
 * mathjs is already a dependency, but it is lazy-loaded in the answer
 * grader precisely because it is large, and module pages render on the
 * client — pulling it in for figures would put it in the chapter bundle.
 * The grammar below covers what a textbook curve needs.
 *
 *   expr   := term (('+' | '-') term)*
 *   term   := power (('*' | '/') power)*
 *   power  := unary ('^' power)?        -- right associative
 *   unary  := '-'? primary
 *   primary := number | 'x' | 'pi' | 'e' | func '(' expr ')' | '(' expr ')'
 *
 * Multiplication must be explicit: write 2*x, not 2x.
 * ------------------------------------------------------------------ */

const FUNCTIONS: Record<string, (v: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
  sign: Math.sign,
  floor: Math.floor,
  ceil: Math.ceil,
};

/**
 * Evaluate `expr` at `x`. Returns NaN for anything unparseable or undefined at
 * this x, which the renderer treats as a break in the curve — so an asymptote
 * or a domain edge leaves a gap instead of a spurious vertical line.
 */
export function evaluateExpression(expr: string, x: number): number {
  let i = 0;
  const s = expr.replace(/\s+/g, "");

  const peek = () => s[i];
  const eat = (c: string) => {
    if (s[i] === c) {
      i += 1;
      return true;
    }
    return false;
  };

  const parseExpr = (): number => {
    let value = parseTerm();
    for (;;) {
      if (eat("+")) value += parseTerm();
      else if (eat("-")) value -= parseTerm();
      else return value;
    }
  };

  const parseTerm = (): number => {
    let value = parsePower();
    for (;;) {
      if (eat("*")) value *= parsePower();
      else if (eat("/")) value /= parsePower();
      else return value;
    }
  };

  const parsePower = (): number => {
    const base = parseUnary();
    if (eat("^")) return Math.pow(base, parsePower());
    return base;
  };

  const parseUnary = (): number => {
    if (eat("-")) return -parseUnary();
    if (eat("+")) return parseUnary();
    return parsePrimary();
  };

  const parsePrimary = (): number => {
    if (eat("(")) {
      const value = parseExpr();
      if (!eat(")")) return NaN;
      return value;
    }

    const numMatch = /^[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/.exec(s.slice(i));
    if (numMatch) {
      i += numMatch[0].length;
      return Number(numMatch[0]);
    }

    const nameMatch = /^[a-zA-Z]+/.exec(s.slice(i));
    if (!nameMatch) return NaN;
    const name = nameMatch[0];
    i += name.length;

    if (name === "x") return x;
    if (name === "pi") return Math.PI;
    if (name === "e") return Math.E;

    const fn = FUNCTIONS[name];
    if (!fn) return NaN;
    if (!eat("(")) return NaN;
    const arg = parseExpr();
    if (!eat(")")) return NaN;
    return fn(arg);
  };

  const result = parseExpr();
  // Trailing junk means the expression was not fully understood; a partial
  // parse that silently drops half the formula would draw a wrong curve.
  if (i !== s.length) return NaN;
  void peek;
  return result;
}

/**
 * Sample a curve into runs of finite points. Each run is drawn as its own
 * polyline, so poles and domain gaps break the line instead of spanning them.
 */
export function sampleFunction(
  fn: string,
  from: number,
  to: number,
  yRange: [number, number],
  samples = 240
): Point[][] {
  const runs: Point[][] = [];
  let run: Point[] = [];
  // Generous vertical slack: a curve may legitimately leave the top of the
  // frame and come back, but a true pole should still break the path.
  const [yMin, yMax] = yRange;
  const slack = (yMax - yMin) * 4;

  for (let k = 0; k <= samples; k++) {
    const x = from + ((to - from) * k) / samples;
    const y = evaluateExpression(fn, x);
    const usable = Number.isFinite(y) && y > yMin - slack && y < yMax + slack;
    if (usable) {
      run.push([x, y]);
    } else if (run.length > 0) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length > 0) runs.push(run);
  return runs.filter((r) => r.length > 1);
}
