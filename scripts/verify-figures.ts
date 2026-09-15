/**
 * Geometric lint for :::figure environments.
 *
 * Every defect these figures have shipped with so far was a *placement* error,
 * never a wrong number: a label printed on top of another label, a label pushed
 * outside the frame, a right angle drawn at the wrong angle because the frame
 * was setting the scale. None of those needs an eye to catch — they are facts
 * about coordinates, and this script asserts them.
 *
 * It measures with the same computeLayout() the renderer draws with, so a pass
 * here is a statement about the real output rather than about a model of it.
 *
 * What it cannot judge is whether a figure is *good*. That still needs a human
 * looking at a contact sheet. This only guarantees nothing is broken.
 *
 *   npx tsx scripts/verify-figures.ts
 */

import fs from "fs";
import path from "path";
import {
  computeLayout,
  estimateTextBox,
  evaluateExpression,
  parseFigureSpec,
  sampleFunction,
  FIGURE_PAD,
  type FigureSpec,
} from "../src/lib/content/figure-spec";
import { segmentMathBlocks } from "../src/lib/content/math-blocks";

const CONTENT = path.join(process.cwd(), "content");

type Issue = { where: string; figure: string; problem: string };

const issues: Issue[] = [];
const notes: Issue[] = [];
let figureCount = 0;

/** A drawn label: its box plus what it says, for reporting. */
type Label = { text: string; box: ReturnType<typeof estimateTextBox> };

function checkFigure(where: string, caption: string | undefined, spec: FigureSpec) {
  figureCount += 1;
  const name = caption ? `"${caption.slice(0, 48)}${caption.length > 48 ? "…" : ""}"` : "(uncaptioned)";
  const L = computeLayout(spec);
  const fail = (problem: string) => issues.push({ where, figure: name, problem });
  const note = (problem: string) => notes.push({ where, figure: name, problem });

  // 1. Angles are only true when a data unit is the same length on both axes.
  //    A figure containing a right-angle marker or arrows almost always means
  //    geometry, so flag the omission rather than silently drawing it skewed.
  const ratio = L.unitX / L.unitY;
  if (spec.equalAspect && Math.abs(ratio - 1) > 0.01) {
    fail(`equalAspect set but units differ (x/y = ${ratio.toFixed(3)})`);
  }
  if (!spec.equalAspect && spec.marks.some((m) => m.kind === "arrow")) {
    note(`contains arrows but not equalAspect — angles are drawn at ${ratio.toFixed(2)}:1, so any right angle will be wrong`);
  }

  // 2. Nothing may fall outside the drawing area. A label that lands outside
  //    is simply invisible, which is how "y = x²" disappeared once already.
  const frame = {
    left: FIGURE_PAD.left,
    right: FIGURE_PAD.left + L.plotW,
    top: FIGURE_PAD.top,
    bottom: FIGURE_PAD.top + L.plotH,
  };
  const inFrameX = (x: number) => x >= frame.left - 0.5 && x <= frame.right + 0.5;
  const inFrameY = (y: number) => y >= frame.top - 0.5 && y <= frame.bottom + 0.5;

  const labels: Label[] = [];
  const addLabel = (text: string, cx: number, cy: number, anchor: "start" | "middle" | "end" = "middle") => {
    const box = estimateTextBox(text, cx, cy, anchor);
    labels.push({ text, box });
    if (box.left < frame.left - 2 || box.right > frame.right + 2 || box.top < frame.top - 2 || box.bottom > frame.bottom + 2) {
      fail(`label "${text}" is drawn outside the frame and will be invisible or clipped`);
    }
  };

  for (const mark of spec.marks) {
    switch (mark.kind) {
      case "point":
        if (!inFrameX(L.sx(mark.at[0])) || !inFrameY(L.sy(mark.at[1]))) {
          fail(`point (${mark.at.join(", ")}) lies outside the plotted range`);
        }
        if (mark.label) addLabel(mark.label, L.sx(mark.at[0]) + 9, L.sy(mark.at[1]) - 9, "start");
        break;

      case "arrow": {
        for (const p of [mark.from, mark.to]) {
          if (!inFrameX(L.sx(p[0])) || !inFrameY(L.sy(p[1]))) {
            fail(`arrow endpoint (${p.join(", ")}) lies outside the plotted range`);
          }
        }
        if (mark.label) {
          const mx = (mark.from[0] + mark.to[0]) / 2;
          const my = (mark.from[1] + mark.to[1]) / 2;
          addLabel(mark.label, L.sx(mx) + 10, L.sy(my) - 8, "start");
        }
        break;
      }

      case "text":
        if (!inFrameX(L.sx(mark.at[0])) || !inFrameY(L.sy(mark.at[1]))) {
          fail(`text "${mark.text}" is anchored outside the plotted range`);
        }
        addLabel(mark.text, L.sx(mark.at[0]), L.sy(mark.at[1]));
        break;

      case "function": {
        const from = mark.from ?? spec.x[0];
        const to = mark.to ?? spec.x[1];
        const runs = sampleFunction(mark.fn, from, to, spec.y);
        const drawn = runs.reduce((n, r) => n + r.length, 0);
        if (drawn === 0) {
          fail(`curve "${mark.fn}" produces no drawable points on [${from}, ${to}]`);
        } else {
          const inside = runs.flat().filter(([, y]) => y >= spec.y[0] && y <= spec.y[1]).length;
          if (inside < 8) {
            note(`curve "${mark.fn}" is inside the y-range for only ${inside} of ${drawn} samples — most of it is off-frame`);
          }
        }
        if (mark.label) {
          const last = runs[runs.length - 1];
          const end = last?.[last.length - 1];
          if (end) addLabel(mark.label, L.sx(end[0]) - 6, L.sy(end[1]) - 10, "end");
        }
        break;
      }

      case "bars":
        for (const [left, right, h] of mark.bars) {
          if (right <= left) fail(`bar [${left}, ${right}] has non-positive width`);
          if (h > spec.y[1]) fail(`bar [${left}, ${right}] of height ${h} exceeds the y-range top ${spec.y[1]}`);
        }
        break;

      case "area":
        for (const expr of [mark.fn, mark.below]) {
          if (expr && ![mark.from, (mark.from + mark.to) / 2, mark.to].some((x) => Number.isFinite(evaluateExpression(expr, x)))) {
            fail(`area boundary "${expr}" does not evaluate on [${mark.from}, ${mark.to}]`);
          }
        }
        break;
    }
  }

  // 3. A label must not sit on a line either. Caught this one by eye twice —
  //    "v = (3, 1)" printed across the dashed line it was naming — which is
  //    exactly the kind of thing a label-vs-label check alone lets through.
  const segments: Array<[number, number, number, number]> = [];
  for (const mark of spec.marks) {
    if (mark.kind === "path") {
      for (let i = 0; i + 1 < mark.points.length; i++) {
        segments.push([L.sx(mark.points[i][0]), L.sy(mark.points[i][1]), L.sx(mark.points[i + 1][0]), L.sy(mark.points[i + 1][1])]);
      }
    } else if (mark.kind === "arrow") {
      segments.push([L.sx(mark.from[0]), L.sy(mark.from[1]), L.sx(mark.to[0]), L.sy(mark.to[1])]);
    } else if (mark.kind === "line") {
      const [[ax, ay], [bx, by]] = mark.through;
      let p1 = [ax, ay];
      let p2 = [bx, by];
      if (mark.extend !== false) {
        if (Math.abs(bx - ax) < 1e-12) {
          p1 = [ax, spec.y[0]];
          p2 = [ax, spec.y[1]];
        } else {
          const slope = (by - ay) / (bx - ax);
          p1 = [spec.x[0], ay + slope * (spec.x[0] - ax)];
          p2 = [spec.x[1], ay + slope * (spec.x[1] - ax)];
        }
      }
      segments.push([L.sx(p1[0]), L.sy(p1[1]), L.sx(p2[0]), L.sy(p2[1])]);
    }
  }
  for (const label of labels) {
    for (const [x1, y1, x2, y2] of segments) {
      if (segmentHitsBox(x1, y1, x2, y2, label.box)) {
        fail(`label "${label.text}" is drawn across a line — move it clear so the label does not sit on what it names`);
        break;
      }
    }
  }

  // 4. No two labels may overlap. This is the defect that has actually bitten:
  //    "tangent, slope 2" printed across the point label P, and "v = (3, 1)"
  //    sitting on the line it named.
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const a = labels[i].box;
      const b = labels[j].box;
      const overlap = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      if (overlap) {
        fail(`labels "${labels[i].text}" and "${labels[j].text}" overlap — place them with explicit text marks`);
      }
    }
  }
}


/** Does a segment pass through a label's box? Sampled, which is enough here. */
function segmentHitsBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  box: { left: number; right: number; top: number; bottom: number }
) {
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const x = x1 + ((x2 - x1) * i) / steps;
    const y = y1 + ((y2 - y1) * i) / steps;
    if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return true;
  }
  return false;
}

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "module.mdx") {
      const rel = path.relative(CONTENT, full);
      const source = fs.readFileSync(full, "utf-8");
      for (const segment of segmentMathBlocks(source)) {
        if (segment.type !== "block" || segment.kind !== "figure") continue;
        const spec = parseFigureSpec(segment.body);
        if (!spec) {
          issues.push({ where: rel, figure: segment.title ?? "(uncaptioned)", problem: "spec does not parse" });
          continue;
        }
        checkFigure(rel, segment.title, spec);
      }
    }
  }
}

walk(CONTENT);

const show = (list: Issue[]) => {
  for (const i of list) console.log(`  ${i.where}\n    ${i.figure}\n    ${i.problem}`);
};

console.log(`\nChecked ${figureCount} figure(s) across content/\n`);

if (notes.length) {
  console.log("Notes:");
  show(notes);
  console.log("");
}

if (issues.length) {
  console.log("Problems:");
  show(issues);
  console.log(`\n${issues.length} problem(s). These are placement facts, not opinions — fix and re-run.`);
  process.exit(1);
}

console.log("Every figure draws inside its frame with no overlapping labels.");
console.log("(Whether they are any good still needs a look — this only says nothing is broken.)");
