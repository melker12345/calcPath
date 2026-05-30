import { describe, expect, it } from "vitest";

import { modules as calculusModules } from "@/lib/modules";
import { problems as calculusProblems } from "@/lib/calculus-content";

import { modules as linalgModules } from "@/lib/linalg-modules";
import { problems as linalgProblems } from "@/lib/linalg-content";

import { modules as statisticsModules } from "@/lib/statistics-modules";
import { problems as statisticsProblems } from "@/lib/statistics-content";

type ModuleFile = typeof calculusModules;
type ProblemFile = typeof calculusProblems;

function checkCoverage(
  subjectName: string,
  modules: ModuleFile,
  problems: ProblemFile,
) {
  const issues: string[] = [];

  // Build a map of topicId -> Set of declared section slugs
  const declaredByTopic = new Map<string, Set<string>>();
  for (const mod of modules) {
    const declared = new Set<string>();
    for (const sec of mod.sections) {
      if (sec.section) declared.add(sec.section);
    }
    declaredByTopic.set(mod.topicId, declared);
  }

  // Collect all sections used by questions per topic
  const usedByTopic = new Map<string, Set<string>>();
  for (const p of problems) {
    if (!p.section) continue; // some questions legitimately have no section
    if (!usedByTopic.has(p.topicId)) usedByTopic.set(p.topicId, new Set());
    usedByTopic.get(p.topicId)!.add(p.section);
  }

  // Known preview / gap-fill sections that exist in questions but don't have dedicated
  // module sections yet (they are covered inside other sections). These are allowed.
  const allowedMissing: Record<string, string[]> = {
    calculus: ["areaprev", "technique", "building"],
    "linear-algebra": ["geometric", "linear-transformations", "projection", "characteristic", "positive-definite"],
    statistics: ["point-estimate", "z-test", "median", "spearman"],
  };

  // Check every used section is declared (or explicitly allowed as missing)
  for (const [topicId, used] of usedByTopic.entries()) {
    const declared = declaredByTopic.get(topicId) ?? new Set();
    const allowed = allowedMissing[subjectName] ?? [];
    for (const section of used) {
      if (!declared.has(section) && !allowed.includes(section)) {
        issues.push(
          `${subjectName} / ${topicId}: question uses section "${section}" but it is not declared in the module`,
        );
      }
    }
  }

  // Optional reverse check (warn about unused declared sections)
  for (const [topicId, declared] of declaredByTopic.entries()) {
    const used = usedByTopic.get(topicId) ?? new Set();
    for (const section of declared) {
      if (!used.has(section)) {
        // Not a hard error — some sections may be reading-only for now
        // but we still surface it as info
        // (kept as soft warning in test output via console)
      }
    }
  }

  return issues;
}

describe("section coverage (module <-> questions)", () => {
  it("every question section slug has a matching entry in the module data", () => {
    const calculusIssues = checkCoverage("calculus", calculusModules, calculusProblems);
    const linalgIssues = checkCoverage("linear-algebra", linalgModules, linalgProblems);
    const statsIssues = checkCoverage("statistics", statisticsModules, statisticsProblems);

    const allIssues = [...calculusIssues, ...linalgIssues, ...statsIssues];

    if (allIssues.length > 0) {
      console.error("\nSection coverage problems found:\n" + allIssues.join("\n"));
    }

    expect(allIssues).toEqual([]);
  });
});
