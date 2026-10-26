/**
 * Renders a `:::figure` spec as inline SVG.
 *
 * Every colour is a CSS variable, so a figure re-themes itself with the rest of
 * the page — the reason figures are drawn rather than shipped as images. The
 * drawing area is a fixed viewBox with `width: 100%`, so it scales to the
 * column without the author thinking about pixels.
 *
 * A Server Component: no hooks, so the SVG is part of the static page. The
 * caller passes `uid`, unique within the page, to namespace the marker ids.
 */

import type { ReactNode } from "react";

import {
  computeLayout,
  evaluateExpression,
  fieldSegments,
  leaderGeometry,
  markTone,
  polygonCentroid,
  samplePolar,
  sampleFunction,
  FIGURE_PAD as PAD,
  FIGURE_W as W,
  type FigureSpec,
  type Mark,
  type Point,
} from "@/lib/content/figure-spec";

export function Figure({ spec, alt, uid }: { spec: FigureSpec; alt?: string; uid: string }) {
  const [x0, x1] = spec.x;
  const [y0, y1] = spec.y;

  // Layout lives in figure-spec so the linter measures exactly what the
  // renderer draws; a second copy here would drift and pass broken figures.
  const layout = computeLayout(spec);
  const { height: H, plotW, plotH, sx, sy } = layout;
  const project = ([x, y]: Point) => `${sx(x).toFixed(2)},${sy(y).toFixed(2)}`;

  const showAxes = spec.axes !== false;
  // Axes sit at the origin when it is in frame, otherwise along the edge, so a
  // plot over [2,5] still gets a reference line instead of nothing.
  const axisY = sy(Math.min(Math.max(0, y0), y1));
  const axisX = sx(Math.min(Math.max(0, x0), x1));

  const ticks = (from: number, to: number, step?: number) => {
    if (!step || step <= 0) return [];
    const out: number[] = [];
    // Start at the first multiple of step at or after `from`.
    for (let t = Math.ceil(from / step) * step; t <= to + 1e-9; t += step) {
      if (Math.abs(t) < 1e-9) out.push(0);
      else out.push(Number(t.toFixed(6)));
    }
    return out;
  };

  return (
    <div className="fig-frame">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="fig-svg"
        role="img"
        aria-label={alt || "Figure"}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id={`arrow-alt-${uid}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fig-alt)" />
          </marker>
          <marker
            id={`arrow-result-${uid}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fig-result)" />
          </marker>
          <marker
            id={`arrow-${uid}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fig-accent)" />
          </marker>
          <marker
            id={`arrow-muted-${uid}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fig-muted)" />
          </marker>
        </defs>

        {/* Gridlines first, so every mark sits on top of them. */}
        {spec.xTicks
          ? ticks(x0, x1, spec.xTicks).map((t) => (
              <line
                key={`gx${t}`}
                x1={sx(t)}
                y1={PAD.top}
                x2={sx(t)}
                y2={PAD.top + plotH}
                className="fig-grid"
              />
            ))
          : null}
        {spec.yTicks
          ? ticks(y0, y1, spec.yTicks).map((t) => (
              <line
                key={`gy${t}`}
                x1={PAD.left}
                y1={sy(t)}
                x2={PAD.left + plotW}
                y2={sy(t)}
                className="fig-grid"
              />
            ))
          : null}

        {showAxes && (
          <>
            <line x1={PAD.left} y1={axisY} x2={PAD.left + plotW} y2={axisY} className="fig-axis" />
            <line x1={axisX} y1={PAD.top} x2={axisX} y2={PAD.top + plotH} className="fig-axis" />
          </>
        )}

        {/* Tick labels. The zero label is dropped: it collides with the axes. */}
        {spec.xTicks
          ? ticks(x0, x1, spec.xTicks)
              .filter((t) => Math.abs(t) > 1e-9)
              .map((t) => (
                <text key={`tx${t}`} x={sx(t)} y={axisY + 18} className="fig-tick" textAnchor="middle">
                  {formatTick(t)}
                </text>
              ))
          : null}
        {spec.yTicks
          ? ticks(y0, y1, spec.yTicks)
              .filter((t) => Math.abs(t) > 1e-9)
              .map((t) => (
                <text key={`ty${t}`} x={axisX - 10} y={sy(t) + 4} className="fig-tick" textAnchor="end">
                  {formatTick(t)}
                </text>
              ))
          : null}

        {spec.marks.map((mark, index) => (
          <MarkView
            key={index}
            mark={mark}
            spec={spec}
            uid={uid}
            layout={layout}
            sx={sx}
            sy={sy}
            project={project}
          />
        ))}

        {/* Axis labels live outside the plot rectangle — centred beneath it and
            rotated up its left side — so they cannot land on a bar, a curve or
            another label no matter what the figure contains. */}
        {spec.xLabel && (
          <text
            x={PAD.left + plotW / 2}
            y={H - 16}
            className="fig-axis-label"
            textAnchor="middle"
          >
            {spec.xLabel}
          </text>
        )}
        {spec.yLabel && (
          <text
            x={18}
            y={PAD.top + plotH / 2}
            className="fig-axis-label"
            textAnchor="middle"
            transform={`rotate(-90 18 ${(PAD.top + plotH / 2).toFixed(2)})`}
          >
            {spec.yLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

const formatTick = (t: number) => (Number.isInteger(t) ? String(t) : String(Number(t.toFixed(3))));

type Projector = {
  mark: Mark;
  spec: FigureSpec;
  uid: string;
  layout: ReturnType<typeof computeLayout>;
  sx: (x: number) => number;
  sy: (y: number) => number;
  project: (p: Point) => string;
};

function MarkView({ mark, spec, uid, layout, sx, sy, project }: Projector) {
  const tone = `fig-${markTone(mark)}`;
  const dash = "dashed" in mark && mark.dashed ? "fig-dashed" : "";

  switch (mark.kind) {
    case "function": {
      const from = mark.from ?? spec.x[0];
      const to = mark.to ?? spec.x[1];
      const runs = sampleFunction(mark.fn, from, to, spec.y);
      const last = runs[runs.length - 1];
      const end = last ? last[last.length - 1] : null;
      return (
        <>
          {runs.map((run, i) => (
            <polyline key={i} points={run.map(project).join(" ")} className={`fig-curve ${tone} ${dash}`} />
          ))}
          {mark.label && end && (
            <text x={sx(end[0]) - 6} y={sy(end[1]) - 10} className={`fig-label ${tone}`} textAnchor="end">
              {figureText(mark.label)}
            </text>
          )}
        </>
      );
    }

    case "path": {
      const end = mark.points[mark.points.length - 1];
      return (
        <>
          <polyline points={mark.points.map(project).join(" ")} className={`fig-curve ${tone} ${dash}`} />
          {mark.label && end && (
            <text x={sx(end[0]) - 6} y={sy(end[1]) - 10} className={`fig-label ${tone}`} textAnchor="end">
              {figureText(mark.label)}
            </text>
          )}
        </>
      );
    }

    case "line": {
      const [[ax, ay], [bx, by]] = mark.through;
      let p1: Point = [ax, ay];
      let p2: Point = [bx, by];
      if (mark.extend !== false) {
        // Extend to the frame edges so a secant reads as a line, not a segment.
        const [xMin, xMax] = spec.x;
        if (Math.abs(bx - ax) < 1e-12) {
          p1 = [ax, spec.y[0]];
          p2 = [ax, spec.y[1]];
        } else {
          const slope = (by - ay) / (bx - ax);
          p1 = [xMin, ay + slope * (xMin - ax)];
          p2 = [xMax, ay + slope * (xMax - ax)];
        }
      }
      const mid: Point = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
      return (
        <>
          <line
            x1={sx(p1[0])}
            y1={sy(p1[1])}
            x2={sx(p2[0])}
            y2={sy(p2[1])}
            className={`fig-curve ${tone} ${dash}`}
          />
          {mark.label && (
            <text x={sx(mid[0])} y={sy(mid[1]) - 10} className={`fig-label ${tone}`} textAnchor="middle">
              {figureText(mark.label)}
            </text>
          )}
        </>
      );
    }

    case "point":
      return (
        <>
          <circle
            cx={sx(mark.at[0])}
            cy={sy(mark.at[1])}
            r={5}
            className={`${mark.open ? "fig-point-open" : "fig-point"} ${tone}`}
          />
          {mark.label && (
            <text x={sx(mark.at[0]) + 9} y={sy(mark.at[1]) - 9} className={`fig-label ${tone}`}>
              {figureText(mark.label)}
            </text>
          )}
        </>
      );

    case "arrow": {
      const t = markTone(mark);
      const marker =
        t === "muted"
          ? `arrow-muted-${uid}`
          : t === "result"
            ? `arrow-result-${uid}`
            : t === "alt"
              ? `arrow-alt-${uid}`
              : `arrow-${uid}`;
      const mid: Point = [(mark.from[0] + mark.to[0]) / 2, (mark.from[1] + mark.to[1]) / 2];
      return (
        <>
          <line
            x1={sx(mark.from[0])}
            y1={sy(mark.from[1])}
            x2={sx(mark.to[0])}
            y2={sy(mark.to[1])}
            className={`fig-arrow ${tone} ${dash}`}
            markerEnd={`url(#${marker})`}
          />
          {mark.label && (
            <text x={sx(mid[0]) + 10} y={sy(mid[1]) - 8} className={`fig-label ${tone}`}>
              {figureText(mark.label)}
            </text>
          )}
        </>
      );
    }

    case "area": {
      const top = sampleFunction(mark.fn, mark.from, mark.to, spec.y, 160).flat();
      if (top.length < 2) return null;
      const bottom = mark.below
        ? sampleFunction(mark.below, mark.from, mark.to, spec.y, 160).flat().reverse()
        : [
            [mark.to, 0] as Point,
            [mark.from, 0] as Point,
          ];
      const d = `M ${[...top, ...bottom].map(project).join(" L ")} Z`;
      return (
        <>
          <path d={d} className={`fig-area ${tone}`} />
          {mark.label && (
            <text
              x={sx((mark.from + mark.to) / 2)}
              y={sy(0) - 14}
              className="fig-label fig-accent"
              textAnchor="middle"
            >
              {figureText(mark.label)}
            </text>
          )}
        </>
      );
    }

    case "bars":
      return (
        <>
          {mark.bars.map(([left, right, height], i) => {
            const yTop = sy(height);
            const yBase = sy(0);
            return (
              <rect
                key={i}
                x={sx(left)}
                y={Math.min(yTop, yBase)}
                width={Math.max(sx(right) - sx(left) - 1.5, 1)}
                height={Math.abs(yBase - yTop)}
                className={`fig-bar ${tone}`}
              />
            );
          })}
        </>
      );

    case "field": {
      // Segments come back already in viewBox units: their length is fixed on
      // screen, so the field shows direction only, never magnitude.
      const segs = fieldSegments(mark, spec, layout);
      return (
        <>
          {segs.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={`fig-field ${tone}`} />
          ))}
        </>
      );
    }

    case "polar": {
      const pts = samplePolar(mark.r, mark.from, mark.to);
      if (pts.length < 2) return null;
      const end = pts[pts.length - 1];
      return (
        <>
          <polyline points={pts.map(project).join(" ")} className={`fig-curve ${tone} ${dash}`} />
          {mark.label && (
            <text x={sx(end[0]) - 6} y={sy(end[1]) - 10} className={`fig-label ${tone}`} textAnchor="end">
              {figureText(mark.label)}
            </text>
          )}
        </>
      );
    }

    case "region": {
      if (mark.points.length < 3) return null;
      const c = polygonCentroid(mark.points);
      return (
        <>
          <path d={`M ${mark.points.map(project).join(" L ")} Z`} className={`fig-area ${tone}`} />
          {mark.label && (
            <text x={sx(c[0])} y={sy(c[1])} className="fig-label fig-accent" textAnchor="middle">
              {figureText(mark.label)}
            </text>
          )}
        </>
      );
    }

    case "text": {
      const leader = leaderGeometry(mark, layout);
      return (
        <>
          {leader && (
            <line
              x1={leader.x1}
              y1={leader.y1}
              x2={leader.x2}
              y2={leader.y2}
              className="fig-leader"
            />
          )}
          <text
            x={sx(mark.at[0])}
            y={sy(mark.at[1])}
            className={`fig-label ${tone}`}
            textAnchor="middle"
          >
            {figureText(mark.text)}
          </text>
        </>
      );
    }

    default:
      return null;
  }
}

/** Exposed so a spec can be sanity-checked outside a render (scripts, tests). */
export { evaluateExpression };

/**
 * A label's text with `x^2` and `a_n` set as super- and subscripts, so a plot
 * labelled "y = x^5 - 6x + 3" reads as mathematics rather than as source. The
 * exponent or index is the braced or bracketed group after the sign, else the
 * run of letters, digits and dots. A tspan's dy moves the glyphs that follow
 * it, so the shift is undone on the first glyph after the script.
 */
export function figureText(text: string): ReactNode {
  const re = /([\^_])(\{[^}]*\}|\([^)]*\)|[A-Za-z0-9.]+)/g;
  const pieces: ReactNode[] = [];
  let last = 0;
  // The em shift that brings the baseline back after the previous script.
  let reset = 0;
  let m: RegExpExecArray | null;
  const push = (content: string, dy: number) => {
    pieces.push(dy ? <tspan key={pieces.length} dy={`${dy}em`}>{content}</tspan> : content);
  };
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(last, m.index);
    if (before) {
      push(before, reset);
      reset = 0;
    }
    const raw = m[2];
    const script = raw.startsWith("{") || raw.startsWith("(") ? raw.slice(1, -1) : raw;
    const shift = m[1] === "^" ? -0.45 : 0.45;
    pieces.push(
      <tspan key={pieces.length} dy={`${shift + reset}em`} fontSize="72%">
        {script}
      </tspan>,
    );
    reset = -shift;
    last = m.index + m[0].length;
  }
  if (pieces.length === 0) return text;
  const rest = text.slice(last);
  if (rest) push(rest, reset);
  return pieces;
}
