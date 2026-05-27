import { describe, expect, it } from "vitest";
import {
  getDiagnosticStatus,
  getRecommendedDiagnosticAction,
  summarizeDiagnosticSkills,
  type DiagnosticResult,
} from "@/lib/diagnostics";
import type { DiagnosticSkill } from "@/lib/diagnostic-content";

const skills: DiagnosticSkill[] = [
  {
    id: "algebra",
    label: "Algebra",
    group: "foundations",
    description: "Algebra basics",
    reviewHref: "/review/algebra",
  },
  {
    id: "limits",
    label: "Limits",
    group: "calculus",
    description: "Limit basics",
    reviewHref: "/review/limits",
  },
];

describe("diagnostic scoring", () => {
  it("maps percentages to readiness statuses", () => {
    expect(getDiagnosticStatus(null)).toBe("not-tested");
    expect(getDiagnosticStatus(100)).toBe("strong");
    expect(getDiagnosticStatus(80)).toBe("strong");
    expect(getDiagnosticStatus(60)).toBe("ready");
    expect(getDiagnosticStatus(30)).toBe("needs-review");
    expect(getDiagnosticStatus(0)).toBe("weak");
  });

  it("summarizes results by skill", () => {
    const results: DiagnosticResult[] = [
      {
        mode: "onboarding",
        completedAt: "2026-05-26T20:00:00.000Z",
        questionResults: [
          { questionId: "q1", skillId: "algebra", correct: true },
          { questionId: "q2", skillId: "algebra", correct: false },
          { questionId: "q3", skillId: "limits", correct: true },
        ],
      },
    ];

    const summaries = summarizeDiagnosticSkills(results, skills);
    expect(summaries.find((summary) => summary.skill.id === "algebra")).toMatchObject({
      correct: 1,
      total: 2,
      percentage: 50,
      status: "needs-review",
    });
    expect(summaries.find((summary) => summary.skill.id === "limits")).toMatchObject({
      correct: 1,
      total: 1,
      percentage: 100,
      status: "strong",
    });
  });

  it("recommends the weakest tested skill first", () => {
    const action = getRecommendedDiagnosticAction([
      {
        skill: skills[0],
        correct: 0,
        total: 2,
        percentage: 0,
        status: "weak",
      },
      {
        skill: skills[1],
        correct: 1,
        total: 1,
        percentage: 100,
        status: "strong",
      },
    ]);

    expect(action.label).toBe("Review Algebra");
    expect(action.href).toBe("/review/algebra");
  });
});
