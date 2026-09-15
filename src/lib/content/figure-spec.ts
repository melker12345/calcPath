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

/**
 * A mark's role, which is what picks its colour.
 *
 * "accent" is the given data, "result" is what the construction produces,
 * "alt" is a second derived quantity that has to be told apart from the first
 * (a mean beside a median), and "muted" is scaffolding — construction lines,
 * extensions, right-angle marks. Colour by role rather than per mark, so a
 * reader learns one code across every figure instead of re-reading a legend.
 */
export type Tone = "accent" | "muted" | "result" | "alt";

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
  /** Shorthand for tone: "muted". */
  muted?: boolean;
  tone?: Tone;
};

/** A polyline through explicit data points — measured data, not a formula. */
export type PathMark = {
  kind: "path";
  points: Point[];
  label?: string;
  dashed?: boolean;
  muted?: boolean;
  tone?: Tone;
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
  tone?: Tone;
};

export type PointMark = {
  kind: "point";
  at: Point;
  label?: string;
  /** Hollow circle instead of filled — an excluded endpoint. */
  open?: boolean;
  tone?: Tone;
};

/** An arrow from one point to another — vectors, projections. */
export type ArrowMark = {
  kind: "arrow";
  from: Point;
  to: Point;
  label?: string;
  dashed?: boolean;
  muted?: boolean;
  tone?: Tone;
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
  /**
   * Bars carry a tone like every other mark, so two distributions can be drawn
   * on one axis — observed against expected, binomial against its Poisson
   * approximation. Every bar fill is translucent, so the overlap of two series
   * stays readable rather than one hiding the other.
   */
  muted?: boolean;
  tone?: Tone;
};

/**
 * A slope field: a short segment at every grid point whose gradient is given by
 * an expression in `x` and `y`. The segments are drawn at a constant on-screen
 * length, so a steep slope reads as steep rather than as long.
 */
export type FieldMark = {
  kind: "field";
  /** Expression in `x` and `y` — the right-hand side of y' = f(x, y). */
  slope: string;
  /** Grid spacing in data units. Default: one tenth of the range. */
  xStep?: number;
  yStep?: number;
  label?: string;
  muted?: boolean;
  tone?: Tone;
};

/**
 * A polar curve r = f(t), sampled over [from, to] and converted to Cartesian
 * before projecting. The angle is `t`, not `x`, so the expression grammar reads
 * the same whether a mark is polar or Cartesian.
 */
export type PolarMark = {
  kind: "polar";
  /** Expression in `t` (the angle, in radians). */
  r: string;
  from: number;
  to: number;
  label?: string;
  dashed?: boolean;
  muted?: boolean;
  tone?: Tone;
};

/**
 * A shaded region bounded by explicit points. `area` can only shade what lies
 * under a function of x; this draws any closed polygon, which is what a type II
 * region or a general plane area needs.
 */
export type RegionMark = {
  kind: "region";
  points: Point[];
  label?: string;
};

/** Free-standing text at a data coordinate. */
export type TextMark = {
  kind: "text";
  at: Point;
  text: string;
  /**
   * Draw a thin muted leader from the label to the thing it names, so a label
   * placed in clear space still says what it belongs to.
   */
  leaderTo?: Point;
  muted?: boolean;
  tone?: Tone;
};

export type Mark =
  | FunctionMark
  | PathMark
  | LineMark
  | PointMark
  | ArrowMark
  | AreaMark
  | BarsMark
  | FieldMark
  | PolarMark
  | RegionMark
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
 * The tone a mark draws in, resolving the `muted` shorthand. Accepts any mark,
 * including the kinds that carry no tone of their own (an area is always the
 * accent wash, bars are always the bar fill).
 */
export function markTone(mark: Mark | { tone?: Tone; muted?: boolean }): Tone {
  const m = mark as { tone?: Tone; muted?: boolean };
  return m.tone ?? (m.muted ? "muted" : "accent");
}

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
 *   primary := number | variable | 'pi' | 'e' | func '(' expr ')' | '(' expr ')'
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

/** The variables an expression may refer to: `x` for a curve, `x`/`y` for a
 * slope field, `t` for a polar radius. */
export type Scope = Record<string, number>;

/**
 * Evaluate `expr` in a scope. Passing a bare number is shorthand for `{ x }`,
 * which is how every Cartesian call site reads.
 *
 * Returns NaN for anything unparseable or undefined at this point, which the
 * renderer treats as a break in the curve — so an asymptote or a domain edge
 * leaves a gap instead of a spurious vertical line. An unknown variable is NaN
 * too, so `y` in a `function` mark fails loudly at validation rather than
 * drawing a silently wrong curve.
 */
export function evaluateExpression(expr: string, at: number | Scope): number {
  const scope: Scope = typeof at === "number" ? { x: at } : at;
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
    let value = parseUnary();
    for (;;) {
      if (eat("*")) value *= parseUnary();
      else if (eat("/")) value /= parseUnary();
      else return value;
    }
  };

  // Unary minus binds LOOSER than "^", so -x^2 is -(x^2) as it is everywhere
  // else in mathematics. It used to bind tighter, which made exp(-x^2/2)
  // evaluate as exp(+x^2/2): every normal density written the natural way drew
  // upside down and shot off the frame, and the linter passed it, because
  // nothing had left the frame.
  const parseUnary = (): number => {
    if (eat("-")) return -parseUnary();
    if (eat("+")) return parseUnary();
    return parsePower();
  };

  const parsePower = (): number => {
    const base = parsePrimary();
    // The exponent may itself be signed (x^-2); "^" is right associative.
    if (eat("^")) return Math.pow(base, parseUnary());
    return base;
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

    // hasOwn, not `in`: `{}.toString` would otherwise resolve as a "variable".
    if (Object.hasOwn(scope, name)) return scope[name];
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

/**
 * Sample a polar curve r = f(t) into Cartesian points. A polar curve has no
 * poles to break at in the way a Cartesian one does — a negative r is a real
 * point, reflected through the origin — so this returns a single run and drops
 * only the samples where the expression is undefined.
 */
export function samplePolar(r: string, from: number, to: number, samples = 360): Point[] {
  const out: Point[] = [];
  for (let k = 0; k <= samples; k++) {
    const t = from + ((to - from) * k) / samples;
    const radius = evaluateExpression(r, { t });
    if (!Number.isFinite(radius)) continue;
    out.push([radius * Math.cos(t), radius * Math.sin(t)]);
  }
  return out;
}

/**
 * The segments of a slope field, in VIEWBOX coordinates.
 *
 * View space rather than data space because the whole point of a slope field is
 * that every tick is the same length on screen: computed in data space, a slope
 * of 4 would draw a segment four times longer than a slope of 0 and the field
 * would read as a contour map. Shared with the linter, like every other piece
 * of layout maths here.
 */
export function fieldSegments(
  mark: FieldMark,
  spec: PlotSpec,
  layout: FigureLayout
): Array<[number, number, number, number]> {
  const [x0, x1] = spec.x;
  const [y0, y1] = spec.y;
  const xStep = mark.xStep && mark.xStep > 0 ? mark.xStep : (x1 - x0) / 10;
  const yStep = mark.yStep && mark.yStep > 0 ? mark.yStep : (y1 - y0) / 10;
  // Half the shorter grid spacing, so neighbouring segments never touch.
  const half = 0.4 * Math.min(xStep * layout.unitX, yStep * layout.unitY);

  const out: Array<[number, number, number, number]> = [];
  const start = (from: number, step: number) => Math.ceil(from / step - 1e-9) * step;
  for (let x = start(x0, xStep); x <= x1 + 1e-9; x += xStep) {
    for (let y = start(y0, yStep); y <= y1 + 1e-9; y += yStep) {
      const m = evaluateExpression(mark.slope, { x, y });
      if (!Number.isFinite(m)) continue;
      // Direction in view space: one data unit right, m data units up (and up
      // is -y on screen). Normalised, so only the angle survives.
      const dx = layout.unitX;
      const dy = -m * layout.unitY;
      const len = Math.hypot(dx, dy) || 1;
      const ux = (dx / len) * half;
      const uy = (dy / len) * half;
      const cx = layout.sx(x);
      const cy = layout.sy(y);
      out.push([cx - ux, cy - uy, cx + ux, cy + uy]);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Layout
 *
 * Exported so the renderer and the figure linter agree by construction.
 * When these two disagree, the linter passes figures that draw wrong —
 * which is exactly the failure mode the linter exists to catch.
 * ------------------------------------------------------------------ */

/** viewBox units. Not pixels: the SVG scales to its container. */
export const FIGURE_W = 800;
// Bottom and left carry the axis labels, which sit OUTSIDE the plot rectangle.
// They used to be placed inside it — the y label in the top-left corner, the x
// label above the right-hand end of the axis — where they collided with
// whatever the figure actually drew there.
export const FIGURE_PAD = { top: 26, right: 30, bottom: 62, left: 66 };

export type FigureLayout = {
  width: number;
  height: number;
  plotW: number;
  plotH: number;
  /** Data space -> viewBox space. */
  sx: (x: number) => number;
  sy: (y: number) => number;
  /** viewBox units per data unit. Equal on both axes iff equalAspect. */
  unitX: number;
  unitY: number;
};

export function computeLayout(spec: PlotSpec): FigureLayout {
  const [x0, x1] = spec.x;
  const [y0, y1] = spec.y;
  const plotW = FIGURE_W - FIGURE_PAD.left - FIGURE_PAD.right;
  const plotH = spec.equalAspect
    ? (plotW * (y1 - y0)) / (x1 - x0)
    : FIGURE_W / (spec.aspect ?? 1.6) - FIGURE_PAD.top - FIGURE_PAD.bottom;
  const height = Math.round(plotH + FIGURE_PAD.top + FIGURE_PAD.bottom);
  return {
    width: FIGURE_W,
    height,
    plotW,
    plotH,
    sx: (x: number) => FIGURE_PAD.left + ((x - x0) / (x1 - x0)) * plotW,
    sy: (y: number) => FIGURE_PAD.top + plotH - ((y - y0) / (y1 - y0)) * plotH,
    unitX: plotW / (x1 - x0),
    unitY: plotH / (y1 - y0),
  };
}

/**
 * Approximate on-screen box for a label. Real text metrics need a font engine;
 * for collision detection an estimate is enough, and erring wide is the safe
 * direction — it flags near-misses rather than missing real overlaps.
 */
export function estimateTextBox(
  text: string,
  cx: number,
  cy: number,
  anchor: "start" | "middle" | "end" = "middle",
  fontSize = 17
) {
  const width = text.length * fontSize * 0.52;
  const height = fontSize * 1.15;
  const left = anchor === "middle" ? cx - width / 2 : anchor === "end" ? cx - width : cx;
  return { left, right: left + width, top: cy - height * 0.78, bottom: cy + height * 0.32 };
}

/**
 * The leader line for a `text` mark that names something away from itself, in
 * viewBox coordinates. It starts just outside the label's own box — so the line
 * never strikes through its own text, and so the figure linter can treat it as
 * an ordinary drawn segment — and stops just short of the target.
 *
 * Returns null when the target lies inside the label, where a leader would be
 * noise rather than help.
 */
export function leaderGeometry(
  mark: TextMark,
  layout: FigureLayout
): { x1: number; y1: number; x2: number; y2: number } | null {
  if (!mark.leaderTo) return null;
  const cx = layout.sx(mark.at[0]);
  const cy = layout.sy(mark.at[1]);
  const tx = layout.sx(mark.leaderTo[0]);
  const ty = layout.sy(mark.leaderTo[1]);

  const b = estimateTextBox(mark.text, cx, cy);
  const pad = 4;
  const box = { left: b.left - pad, right: b.right + pad, top: b.top - pad, bottom: b.bottom + pad };
  if (tx >= box.left && tx <= box.right && ty >= box.top && ty <= box.bottom) return null;

  const dx = tx - cx;
  const dy = ty - cy;
  // Largest t in [0, 1] at which the ray from the label centre is still inside
  // the padded box: that is where the leader should begin.
  const hits = [
    dx > 0 ? (box.right - cx) / dx : dx < 0 ? (box.left - cx) / dx : Infinity,
    dy > 0 ? (box.bottom - cy) / dy : dy < 0 ? (box.top - cy) / dy : Infinity,
  ].filter((t) => Number.isFinite(t) && t > 0);
  const tEnter = hits.length ? Math.min(...hits) : 0;

  const len = Math.hypot(dx, dy) || 1;
  const tExit = Math.max(tEnter, 1 - 7 / len); // stop short of what it points at
  if (tExit <= tEnter) return null;
  return {
    x1: cx + dx * tEnter,
    y1: cy + dy * tEnter,
    x2: cx + dx * tExit,
    y2: cy + dy * tExit,
  };
}

/** Centroid of a polygon's vertices — where a `region` puts its label. */
export function polygonCentroid(points: Point[]): Point {
  const n = points.length || 1;
  return [
    points.reduce((s, p) => s + p[0], 0) / n,
    points.reduce((s, p) => s + p[1], 0) / n,
  ];
}
