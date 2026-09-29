/**
 * A chapter's module.mdx, rendered to HTML on the server.
 *
 * The chapter is cut at its `##` headings (mdx.ts), each part is cut into prose
 * runs and `:::` environments (math-blocks.ts), and every run is typeset
 * (render-prose.ts). Numbered environments — definitions, theorems, examples,
 * figures — share ONE counter through the whole chapter, in document order,
 * so a reader sees Definition 4.1, Theorem 4.2, Example 4.3 exactly as in a
 * printed book. Numbers are a pure function of the source.
 *
 * Figures stay as parsed specs: the page draws them with the <Figure>
 * component, which renders on the server too.
 */

import { parseFigureSpec, type FigureSpec } from "./figure-spec";
import {
  MATH_BLOCK_SPECS,
  formatBlockNumber,
  segmentMathBlocks,
  type MathBlockKind,
  type MathBlockSegment,
  type MathBlockStyle,
} from "./math-blocks";
import { splitMdxParts } from "./mdx";
import { renderMathText } from "./render-math";
import { renderProseHtml, uniqueId } from "./render-prose";

export type RenderedSegment =
  | { type: "prose"; html: string }
  | { type: "block"; kind: MathBlockKind; style: MathBlockStyle; id?: string; html: string }
  | {
      type: "figure";
      id?: string;
      /** Unique within the page; the SVG uses it to namespace marker ids. */
      uid: string;
      spec: FigureSpec;
      alt?: string;
      captionHtml: string;
    };

export type RenderedPart =
  | { kind: "intro"; id: string; segments: RenderedSegment[] }
  | {
      kind: "section";
      id: string;
      number: string;
      titleHtml: string;
      titleText: string;
      segments: RenderedSegment[];
    }
  | { kind: "mistakes"; id: string; titleText: string; segments: RenderedSegment[] };

export type NavItem = { id: string; labelHtml: string; number?: string };

export type RenderedChapter = {
  parts: RenderedPart[];
  nav: NavItem[];
};

type Counter = { item: number; figure: number; ids: Set<string> };

function envHead(label: string, number: string | undefined, title: string | undefined): string {
  return (
    `<span class="mb-env-head">` +
    `<span class="mb-env-label">${label}${number ? ` ${number}` : ""}</span>` +
    (title ? `<span class="mb-env-title"> (${renderMathText(title)})</span>` : "") +
    `<span class="mb-env-stop">.</span> ` +
    `</span>`
  );
}

function renderBlockSegment(
  segment: MathBlockSegment,
  chapter: number | undefined,
  counter: Counter,
): RenderedSegment {
  const spec = MATH_BLOCK_SPECS[segment.kind];
  const number = spec.numbered ? formatBlockNumber(chapter, ++counter.item) : undefined;

  if (segment.kind === "figure") {
    const figureSpec = parseFigureSpec(segment.body);
    if (!figureSpec) {
      // A malformed spec must not take the page down mid-chapter: show the
      // body as prose so the author can see what they wrote.
      return {
        type: "block",
        kind: "note",
        style: "aside",
        id: segment.id && uniqueId(segment.id, counter.ids),
        html: renderProseHtml(segment.body, { ids: counter.ids }),
      };
    }
    return {
      type: "figure",
      id: segment.id && uniqueId(segment.id, counter.ids),
      uid: `f${++counter.figure}`,
      spec: figureSpec,
      alt: segment.title,
      captionHtml:
        `<span class="mb-env-label">${spec.label}${number ? ` ${number}` : ""}</span>` +
        `<span class="mb-env-stop">.</span>` +
        (segment.title ? ` ${renderMathText(segment.title)}` : ""),
    };
  }

  return {
    type: "block",
    kind: segment.kind,
    style: spec.style,
    id: segment.id && uniqueId(segment.id, counter.ids),
    html: renderProseHtml(segment.body, {
      leadInHtml: envHead(spec.label, number, segment.title),
      tailMark: spec.endMark,
      ids: counter.ids,
    }),
  };
}

function renderSegments(body: string, chapter: number | undefined, counter: Counter): RenderedSegment[] {
  const out: RenderedSegment[] = [];
  for (const segment of segmentMathBlocks(body)) {
    if (segment.type === "block") {
      out.push(renderBlockSegment(segment, chapter, counter));
    } else {
      const html = renderProseHtml(segment.body, { ids: counter.ids });
      if (html) out.push({ type: "prose", html });
    }
  }
  return out;
}

/**
 * Render one chapter. `chapter` is the topic's position in its subject, which
 * makes sections read "4.1, 4.2, …" and environments "Theorem 4.3".
 */
export function renderChapter(mdxSource: string, chapter?: number): RenderedChapter {
  const mdxParts = splitMdxParts(mdxSource);
  // Section slugs are the stable anchors questions.json points at; they are
  // reserved first so nothing else on the page — not even the chapter opener,
  // when a section is itself called "intro" — can shadow one.
  const ids = new Set<string>();
  for (const part of mdxParts) if (part.kind === "section") ids.add(part.section);
  const counter: Counter = { item: 0, figure: 0, ids };
  const parts: RenderedPart[] = [];
  const nav: NavItem[] = [];
  let sectionIndex = 0;
  let mistakesIndex = 0;

  for (const part of mdxParts) {
    if (part.kind === "intro") {
      const id = uniqueId("intro", ids);
      parts.push({ kind: "intro", id, segments: renderSegments(part.body, chapter, counter) });
      nav.push({ id, labelHtml: "Introduction" });
      continue;
    }
    if (part.kind === "section") {
      sectionIndex += 1;
      const number = chapter ? `${chapter}.${sectionIndex}` : `${sectionIndex}`;
      const titleHtml = renderMathText(part.title);
      parts.push({
        kind: "section",
        id: part.section,
        number,
        titleHtml,
        titleText: part.title,
        segments: renderSegments(part.body, chapter, counter),
      });
      nav.push({ id: part.section, labelHtml: titleHtml, number });
      continue;
    }
    mistakesIndex += 1;
    const id = uniqueId("mistakes", ids);
    parts.push({ kind: "mistakes", id, titleText: part.title, segments: renderSegments(part.body, chapter, counter) });
    if (mistakesIndex === 1) nav.push({ id, labelHtml: "Common Mistakes" });
  }

  return { parts, nav };
}
