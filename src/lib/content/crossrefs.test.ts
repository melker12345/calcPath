import { describe, expect, it } from "vitest";

import {
  collectCitations,
  collectStatementTitles,
  linkCitations,
  looksLikeTitle,
  normalizeTitle,
} from "./crossrefs";
import { renderChapter } from "./render-chapter";

const SOURCE = `# Limits

## Rules
<!-- section: rules -->

:::theorem[Sum rule for limits]{#sum-rule}
Limits add.
:::

:::theorem[Continuation to $\\sigma > 0$]
A second theorem, without an explicit id.
:::

By the theorem *Sum rule for limits* and the theorem *Continuation to $\\sigma>0$*
we are done. Green's theorem *is* Stokes' theorem. The lemma *Nowhere stated* has no target.
`;

describe("statement titles", () => {
  it("collects titles with explicit or slugged ids", () => {
    const titles = collectStatementTitles(SOURCE);
    expect(titles.map((t) => [t.kind, t.id])).toEqual([
      ["theorem", "sum-rule"],
      ["theorem", "continuation-to-sigma-0"],
    ]);
  });

  it("normalises whitespace and case", () => {
    expect(normalizeTitle("Continuation to $\\sigma>0$")).toBe(normalizeTitle("continuation to $\\sigma > 0$"));
  });
});

describe("citations", () => {
  it("finds cited titles and ignores lower-case emphasis", () => {
    expect(collectCitations(SOURCE).map((c) => c.title)).toEqual([
      "Sum rule for limits",
      "Continuation to $\\sigma>0$",
      "Nowhere stated",
    ]);
    expect(looksLikeTitle("is")).toBe(false);
    expect(looksLikeTitle("$F[x]$ is a principal ideal domain")).toBe(true);
  });

  it("links resolvable citations and leaves the rest", () => {
    const out = linkCitations("by the theorem *Sum rule for limits* and the lemma *Nowhere stated*", (title) =>
      title === "sumruleforlimits" ? { href: "#sum-rule", label: "Theorem 1.1" } : undefined,
    );
    expect(out).toBe('by the theorem [*Sum rule for limits*](#sum-rule "Theorem 1.1") and the lemma *Nowhere stated*');
  });
});

describe("renderChapter cross-references", () => {
  it("links a citation to the statement's anchor with its number", () => {
    const rendered = renderChapter(SOURCE, 3);
    const section = rendered.parts.find((p) => p.kind === "section");
    expect(section).toBeDefined();
    const html = section!.segments.map((s) => (s.type === "figure" ? s.captionHtml : s.html)).join("\n");
    expect(html).toContain('href="#sum-rule" class="text-[var(--accent)] underline underline-offset-2" title="Theorem 3.1"');
    expect(html).toContain('href="#continuation-to-sigma-0"');
    expect(html).toContain('title="Theorem 3.2"');
    expect(html).toContain("<em>Nowhere stated</em>");
    expect(html).not.toContain('href="#nowhere');
    // The titled theorem without {#id} received the slug as its anchor.
    const blocks = section!.segments.filter((s) => s.type === "block");
    expect(blocks.map((b) => (b.type === "block" ? b.id : undefined))).toEqual(["sum-rule", "continuation-to-sigma-0"]);
  });

  it("uses external refs for titles from other chapters", () => {
    const rendered = renderChapter("## A\n<!-- section: a -->\n\nSee the theorem *Elsewhere*.\n", 1, new Map([[
      "elsewhere",
      { href: "/calculus/modules/other#elsewhere", label: "Theorem, Other" },
    ]]));
    const html = rendered.parts.flatMap((p) => p.segments).map((s) => (s.type === "figure" ? "" : s.html)).join("");
    expect(html).toContain('href="/calculus/modules/other#elsewhere"');
  });
});
