import type { DiagnosticPrerequisite } from "@/lib/content/schema";
import { getModulesPath, getSubjectPath } from "@/lib/subject-urls";

export type DiagnosticStatus = "strong" | "ready" | "needs-review" | "weak" | "not-tested";

export type DiagnosticQuestionResult = {
  questionId: string;
  skillId?: string;
  prerequisiteId?: string;
  correct: boolean;
};

export type DiagnosticResult = {
  completedAt: string;
  mode: "onboarding" | "topic-readiness" | "prerequisite";
  topicId?: string;
  targetSubject?: string;
  score?: number;
  total?: number;
  id?: string;
  questionResults: DiagnosticQuestionResult[];
  prerequisiteSummaries?: DiagnosticPrerequisiteSummary[];
};

export type DiagnosticPrerequisiteSummary = {
  prerequisite: DiagnosticPrerequisite;
  correct: number;
  total: number;
  percentage: number | null;
  status: DiagnosticStatus;
};

export function getDiagnosticStatus(percentage: number | null): DiagnosticStatus {
  if (percentage === null) return "not-tested";
  if (percentage >= 80) return "strong";
  if (percentage >= 60) return "ready";
  if (percentage >= 30) return "needs-review";
  return "weak";
}

export function summarizeDiagnosticPrerequisites(
  results: DiagnosticResult[],
  prerequisites: DiagnosticPrerequisite[],
): DiagnosticPrerequisiteSummary[] {
  const counts = new Map<string, { correct: number; total: number }>();

  for (const result of results) {
    for (const questionResult of result.questionResults) {
      if (!questionResult.prerequisiteId) continue;
      const current = counts.get(questionResult.prerequisiteId) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (questionResult.correct) current.correct += 1;
      counts.set(questionResult.prerequisiteId, current);
    }
  }

  return prerequisites.map((prerequisite) => {
    const count = counts.get(prerequisite.id) ?? { correct: 0, total: 0 };
    const percentage = count.total === 0 ? null : Math.round((count.correct / count.total) * 100);
    return {
      prerequisite,
      correct: count.correct,
      total: count.total,
      percentage,
      status: getDiagnosticStatus(percentage),
    };
  });
}

export function getRecommendedPrerequisiteAction(
  summaries: DiagnosticPrerequisiteSummary[],
  prerequisites: DiagnosticPrerequisite[],
  targetSubject: string,
) {
  const weak = summaries.find((summary) => summary.status === "weak");
  if (weak) {
    const link = weak.prerequisite.reviewLinks?.[0];
    return {
      label: link?.label ?? `Review ${weak.prerequisite.label}`,
      href: link?.href ?? getSubjectPath(targetSubject),
      description: "Start with the weakest prerequisite before moving deeper.",
    };
  }

  const needsReview = summaries.find((summary) => summary.status === "needs-review");
  if (needsReview) {
    const link = needsReview.prerequisite.reviewLinks?.[0];
    return {
      label: link?.label ?? `Practice ${needsReview.prerequisite.label}`,
      href: link?.href ?? getSubjectPath(targetSubject),
      description: "You are close, but this prerequisite needs a little more support.",
    };
  }

  const hasTested = summaries.some((summary) => summary.status !== "not-tested");
  if (!hasTested) {
    const firstPrerequisite = prerequisites[0];
    return {
      label: "Take prerequisite diagnostic",
      href: getSubjectPath(targetSubject),
      description: firstPrerequisite
        ? `Find your starting point before ${targetSubject}.`
        : "Find your starting point with a short readiness check.",
    };
  }

  return {
    label: `Start ${targetSubject}`,
    href: getModulesPath(targetSubject),
    description: "Your prerequisite results look ready to begin this subject.",
  };
}