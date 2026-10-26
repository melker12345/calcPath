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
 * Numbers and anchors are assigned in a first pass over the segments, before
 * any prose is typeset, so that a citation of a statement by title — "by the
 * theorem *Sum rule for limits*" — can be linked to the statement wherever it
 * sits in the chapter, forwards or backwards, with its number on the link
 * (crossrefs.ts). Citations of statements in other chapters of the subject
 * resolve through `externalRefs`, built by the chapter loader.
 *
 * Figures stay as parsed specs: the page draws them with the <Figure>
 * component, which renders on the server too.
 */

import { type CrossRefTarget, linkCitations, normalizeTitle } from "./crossrefs";
import { parseFigureSpec, type FigureSpec } from "./figure-spec";
import {
  MATH_BLOCK_SPECS,
  formatBlockNumber,
  segmentMathBlocks,
  type MathBlockKind,
  type MathBlockSegment,
  type MathBlockStyle,
  type MdxSegment,
} from "./math-blocks";
import { splitMdxParts } from "./mdx";
import { mathToPlainText, renderMathText } from "./render-math";
import { renderProseHtml, slugify, uniqueId } from "./render-prose";

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

/** Titles of statements in other chapters, keyed by `normalizeTitle`. */
export type ExternalRefs = Map<string, CrossRefTarget>;

type BlockMeta = { id?: string; number?: string };

type Context = {
  chapter: number | undefined;
  ids: Set<string>;
  /** Number and anchor of every environment, assigned in the first pass. */
  meta: Map<MathBlockSegment, BlockMeta>;
  /** Statement titles of this chapter, keyed by `normalizeTitle`. */
  refs: Map<string, CrossRefTarget>;
  externalRefs: ExternalRefs;
  figure: number;
};

function envHead(label: string, number: string | undefined, title: string | undefined): string {
  return (
    `<span class="mb-env-head">` +
    `<span class="mb-env-label">${label}${number ? ` ${number}` : ""}</span>` +
    (title ? `<span class="mb-env-title"> (${renderMathText(title)})</span>` : "") +
    `<span class="mb-env-stop">.</span> ` +
    `</span>`
  );
}

/** Citations in a run of Markdown become links; this chapter wins over others. */
function linkProse(markdown: string, ctx: Context): string {
  if (ctx.refs.size === 0 && ctx.externalRefs.size === 0) return markdown;
  return linkCitations(markdown, (title) => ctx.refs.get(title) ?? ctx.externalRefs.get(title));
}

function renderBlockSegment(segment: MathBlockSegment, ctx: Context): RenderedSegment {
  const spec = MATH_BLOCK_SPECS[segment.kind];
  const { id, number } = ctx.meta.get(segment) ?? {};

  if (segment.kind === "figure") {
    const figureSpec = parseFigureSpec(segment.body);
    if (!figureSpec) {
      // A malformed spec must not take the page down mid-chapter: show the
      // body as prose so the author can see what they wrote.
      return {
        type: "block",
        kind: "note",
        style: "aside",
        id,
        html: renderProseHtml(segment.body, { ids: ctx.ids }),
      };
    }
    return {
      type: "figure",
      id,
      uid: `f${++ctx.figure}`,
      spec: figureSpec,
      // The caption is Markdown with TeX; a screen reader gets its words.
      alt: segment.title ? mathToPlainText(segment.title) : undefined,
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
    id,
    html: renderProseHtml(linkProse(segment.body, ctx), {
      leadInHtml: envHead(spec.label, number, segment.title),
      tailMark: spec.endMark,
      ids: ctx.ids,
    }),
  };
}

function renderSegments(segments: MdxSegment[], ctx: Context): RenderedSegment[] {
  const out: RenderedSegment[] = [];
  for (const segment of segments) {
    if (segment.type === "block") {
      out.push(renderBlockSegment(segment, ctx));
    } else {
      const html = renderProseHtml(linkProse(segment.body, ctx), { ids: ctx.ids });
      if (html) out.push({ type: "prose", html });
    }
  }
  return out;
}

/**
 * First pass: number every numbered environment and reserve its anchor. An
 * environment with `{#id}` keeps it; a titled one without gets a slug of its
 * title, so that every titled statement can be linked to. The same rule is
 * applied by crossrefs.ts when another chapter links here.
 */
function assignNumbersAndIds(parts: MdxSegment[][], ctx: Context): void {
  let item = 0;
  for (const segments of parts) {
    for (const segment of segments) {
      if (segment.type !== "block") continue;
      const spec = MATH_BLOCK_SPECS[segment.kind];
      const number = spec.numbered ? formatBlockNumber(ctx.chapter, ++item) : undefined;
      const titled = spec.numbered && segment.title && segment.kind !== "figure";
      const wanted = segment.id ?? (titled ? slugify(segment.title!) : undefined);
      const id = wanted ? uniqueId(wanted, ctx.ids) : undefined;
      ctx.meta.set(segment, { id, number });
      if (titled && id) {
        const key = normalizeTitle(segment.title!);
        if (!ctx.refs.has(key)) {
          ctx.refs.set(key, { href: `#${id}`, label: number ? `${spec.label} ${number}` : spec.label });
        }
      }
    }
  }
}

/**
 * Render one chapter. `chapter` is the topic's position in its subject, which
 * makes sections read "4.1, 4.2, …" and environments "Theorem 4.3".
 */
export function renderChapter(
  mdxSource: string,
  chapter?: number,
  externalRefs: ExternalRefs = new Map(),
): RenderedChapter {
  const mdxParts = splitMdxParts(mdxSource);
  // Section slugs are the stable anchors questions.json points at; they are
  // reserved first so nothing else on the page — not even the chapter opener,
  // when a section is itself called "intro" — can shadow one.
  const ids = new Set<string>();
  for (const part of mdxParts) if (part.kind === "section") ids.add(part.section);
  const ctx: Context = { chapter, ids, meta: new Map(), refs: new Map(), externalRefs, figure: 0 };

  const segmented = mdxParts.map((part) => segmentMathBlocks(part.body));
  assignNumbersAndIds(segmented, ctx);

  const parts: RenderedPart[] = [];
  const nav: NavItem[] = [];
  let sectionIndex = 0;
  let mistakesIndex = 0;

  mdxParts.forEach((part, index) => {
    const segments = segmented[index];
    if (part.kind === "intro") {
      const id = uniqueId("intro", ids);
      parts.push({ kind: "intro", id, segments: renderSegments(segments, ctx) });
      nav.push({ id, labelHtml: "Introduction" });
      return;
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
        segments: renderSegments(segments, ctx),
      });
      nav.push({ id: part.section, labelHtml: titleHtml, number });
      return;
    }
    mistakesIndex += 1;
    const id = uniqueId("mistakes", ids);
    parts.push({ kind: "mistakes", id, titleText: part.title, segments: renderSegments(segments, ctx) });
    if (mistakesIndex === 1) nav.push({ id, labelHtml: "Common Mistakes" });
  });

  return { parts, nav };
}
