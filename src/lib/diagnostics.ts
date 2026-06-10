import {
  diagnosticQuestions,
  diagnosticSkills,
  type DiagnosticQuestion,
  type DiagnosticSkill,
  type DiagnosticStatus,
} from "@/lib/diagnostic-content";
import type { DiagnosticPrerequisite } from "@/lib/content/schema";
import { getModulesPath, getSubjectPath } from "@/lib/subject-urls";

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

export type DiagnosticSkillSummary = {
  skill: DiagnosticSkill;
  correct: number;
  total: number;
  percentage: number | null;
  status: DiagnosticStatus;
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

export function summarizeDiagnosticSkills(
  results: DiagnosticResult[],
  skills = diagnosticSkills,
): DiagnosticSkillSummary[] {
  const counts = new Map<string, { correct: number; total: number }>();

  for (const result of results) {
    for (const questionResult of result.questionResults) {
      if (!questionResult.skillId) continue;
      const current = counts.get(questionResult.skillId) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (questionResult.correct) current.correct += 1;
      counts.set(questionResult.skillId, current);
    }
  }

  return skills.map((skill) => {
    const count = counts.get(skill.id) ?? { correct: 0, total: 0 };
    const percentage = count.total === 0 ? null : Math.round((count.correct / count.total) * 100);
    return {
      skill,
      correct: count.correct,
      total: count.total,
      percentage,
      status: getDiagnosticStatus(percentage),
    };
  });
}

export function getRecommendedDiagnosticAction(summaries: DiagnosticSkillSummary[]) {
  const weak = summaries.find((summary) => summary.status === "weak");
  if (weak) {
    return {
      label: `Review ${weak.skill.label}`,
      href: weak.skill.reviewHref ?? "/diagnostic",
      description: "Start with the weakest prerequisite before moving deeper.",
    };
  }

  const needsReview = summaries.find((summary) => summary.status === "needs-review");
  if (needsReview) {
    return {
      label: `Practice ${needsReview.skill.label}`,
      href: needsReview.skill.reviewHref ?? "/diagnostic",
      description: "You are close, but this skill needs a little more support.",
    };
  }

  const hasTested = summaries.some((summary) => summary.status !== "not-tested");
  if (!hasTested) {
    return {
      label: "Take diagnostic",
      href: "/diagnostic",
      description: "Find your starting point with a short readiness check.",
    };
  }

  return {
    label: "Start Limits",
    href: getModulesPath("calculus", "limits"),
    description: "Your first diagnostic results look ready for the Limits module.",
  };
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

export function getQuestionsByIds(ids: string[], questions = diagnosticQuestions): DiagnosticQuestion[] {
  const byId = new Map(questions.map((question) => [question.id, question]));
  return ids.map((id) => byId.get(id)).filter((question): question is DiagnosticQuestion => !!question);
}
