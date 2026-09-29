import { describe, expect, it } from "vitest";
import {
  extractMdxSectionSlugs,
  extractMdxSections,
  resolveSectionSlug,
  stripFrontmatterAndH1,
  toSlug,
} from "./mdx";

const doc = `---
title: Limits & Continuity
---

# Limits & Continuity

Intro paragraph.

## Direct substitution

<!-- section: directsub -->

Body.

## The Squeeze Theorem {#squeeze}

Body.

## Limits at Infinity

Body.

## Common Mistakes

- one
`;

describe("extractMdxSections", () => {
  it("prefers {#slug}, then a <!-- section --> marker, then the slugified title", () => {
    expect(extractMdxSections(doc)).toEqual([
      { title: "Direct substitution", section: "directsub" },
      { title: "The Squeeze Theorem", section: "squeeze" },
      { title: "Limits at Infinity", section: "limits-at-infinity" },
    ]);
  });

  it("skips Common Mistakes, which is not a practice section", () => {
    expect(extractMdxSectionSlugs(doc)).not.toContain("common-mistakes");
  });

  it("only looks a few lines ahead for a section marker", () => {
    const far = `## Far marker\n\n\n\n\n\n<!-- section: too-far -->\n`;
    expect(extractMdxSections(far)).toEqual([{ title: "Far marker", section: "far-marker" }]);
  });

  it("returns nothing for empty input", () => {
    expect(extractMdxSections(undefined)).toEqual([]);
    expect(extractMdxSections("")).toEqual([]);
  });
});

describe("stripFrontmatterAndH1", () => {
  it("removes the YAML block and the top-level title", () => {
    const stripped = stripFrontmatterAndH1(doc);
    expect(stripped.startsWith("Intro paragraph.")).toBe(true);
    expect(stripped).not.toContain("title: Limits");
  });
});

describe("toSlug", () => {
  it("lower-cases and collapses non-alphanumerics to single dashes", () => {
    expect(toSlug("The Squeeze Theorem")).toBe("the-squeeze-theorem");
    expect(toSlug("L'Hôpital's Rule")).toBe("l-h-pital-s-rule");
    expect(toSlug("  --Trim--  ")).toBe("trim");
  });
});

describe("resolveSectionSlug", () => {
  it("returns an empty slug for Common Mistakes so callers skip it", () => {
    expect(resolveSectionSlug("Common Mistakes", [], 0)).toBe("");
  });

  it("uses a following marker when one is present", () => {
    const lines = ["## Title", "", "<!-- section: custom -->"];
    expect(resolveSectionSlug("Title", lines, 0)).toBe("custom");
  });
});
