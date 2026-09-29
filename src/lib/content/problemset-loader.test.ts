import { describe, expect, it } from "vitest";
import {
  hasProblemSet,
  listAllProblemSets,
  listTopicsWithProblemSets,
  loadProblemSet,
  problemSetMinutes,
} from "./problemset-loader";

// These read the real content/ folder: a problem set exists exactly when its
// problemset.json is on disk, and calculus/limits was the first one written.

describe("loadProblemSet", () => {
  it("loads and validates a real sheet", async () => {
    const set = await loadProblemSet("calculus", "limits");
    expect(set).not.toBeNull();
    expect(set?.topicId).toBe("limits");
    expect(set?.problems.length).toBeGreaterThan(0);
    expect(problemSetMinutes(set!)).toBe(set!.problems.reduce((n, p) => n + p.minutes, 0));
  });

  it("returns null for a chapter without a sheet", async () => {
    expect(await loadProblemSet("calculus", "no-such-chapter")).toBeNull();
  });
});

describe("hasProblemSet / listTopicsWithProblemSets", () => {
  it("agree with each other", async () => {
    const topics = await listTopicsWithProblemSets("calculus");
    expect(topics).toContain("limits");
    expect(await hasProblemSet("calculus", "limits")).toBe(true);
    expect(await hasProblemSet("calculus", "no-such-chapter")).toBe(false);
    expect(await listTopicsWithProblemSets("no-such-subject")).toEqual([]);
  });
});

describe("listAllProblemSets", () => {
  it("groups sheets by subject and omits subjects with none", async () => {
    const groups = await listAllProblemSets();
    const calculus = groups.find((g) => g.subjectSlug === "calculus");
    expect(calculus).toBeDefined();
    expect(calculus!.sets.length).toBeGreaterThan(0);
    for (const g of groups) expect(g.sets.length).toBeGreaterThan(0);
  });
});
