import { problems as calculusProblems, topics as calculusTopics } from "@/lib/calculus-content";
import { problems as statisticsProblems, topics as statisticsTopics } from "@/lib/statistics-content";
import { problems as linalgProblems, topics as linalgTopics } from "@/lib/linalg-content";
import type { Problem, Topic } from "@/lib/shared-types";

export type SubjectSlug = "calculus" | "statistics" | "linear-algebra";

type ProblemMeta = {
  id: string;
  prompt: string;
  topicId: string;
  topicTitle: string;
  subjectSlug: SubjectSlug;
  subjectLabel: string;
  questionNumber: number;
};

type TopicMeta = {
  id: string;
  title: string;
  subjectSlug: SubjectSlug;
  subjectLabel: string;
};

const SUBJECT_LABELS: Record<SubjectSlug, string> = {
  calculus: "Calculus",
  statistics: "Statistics",
  "linear-algebra": "Linear Algebra",
};

function buildProblemMeta(
  subjectSlug: SubjectSlug,
  topics: Topic[],
  problems: Problem[],
): ProblemMeta[] {
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));
  const perTopicCounts = new Map<string, number>();

  return problems.map((problem) => {
    const topic = topicById.get(problem.topicId);
    const count = (perTopicCounts.get(problem.topicId) ?? 0) + 1;
    perTopicCounts.set(problem.topicId, count);

    return {
      id: problem.id,
      prompt: problem.prompt,
      topicId: problem.topicId,
      topicTitle: topic?.title ?? problem.topicId,
      subjectSlug,
      subjectLabel: SUBJECT_LABELS[subjectSlug],
      questionNumber: count,
    };
  });
}

const allProblemMeta = [
  ...buildProblemMeta("calculus", calculusTopics, calculusProblems),
  ...buildProblemMeta("statistics", statisticsTopics, statisticsProblems),
  ...buildProblemMeta("linear-algebra", linalgTopics, linalgProblems),
];

const problemMetaById = new Map(allProblemMeta.map((problem) => [problem.id, problem]));

const allTopicMeta: TopicMeta[] = [
  ...calculusTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    subjectSlug: "calculus" as const,
    subjectLabel: SUBJECT_LABELS.calculus,
  })),
  ...statisticsTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    subjectSlug: "statistics" as const,
    subjectLabel: SUBJECT_LABELS.statistics,
  })),
  ...linalgTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    subjectSlug: "linear-algebra" as const,
    subjectLabel: SUBJECT_LABELS["linear-algebra"],
  })),
];

const topicMetaBySubjectAndId = new Map(
  allTopicMeta.map((topic) => [`${topic.subjectSlug}:${topic.id}`, topic]),
);

export function getProblemMeta(problemId: string | null | undefined) {
  if (!problemId) return null;
  return problemMetaById.get(problemId) ?? null;
}

export function inferSubjectFromPath(path: string | null | undefined): SubjectSlug | null {
  if (!path) return null;
  const normalized = path.replace(/^https?:\/\/[^/]+/, "");
  if (normalized.startsWith("/calculus")) return "calculus";
  if (normalized.startsWith("/statistics")) return "statistics";
  if (normalized.startsWith("/linear-algebra")) return "linear-algebra";
  return null;
}

export function inferTopicIdFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const normalized = path.replace(/^https?:\/\/[^/]+/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 3) return null;
  if (parts[1] === "practice" || parts[1] === "modules" || parts[1] === "test") {
    return parts[2] ?? null;
  }
  return null;
}

export function getTopicMeta(topicId: string | null | undefined, subjectSlug: SubjectSlug | null | undefined) {
  if (!topicId || !subjectSlug) return null;
  return topicMetaBySubjectAndId.get(`${subjectSlug}:${topicId}`) ?? null;
}

export function getPromptPreview(prompt: string | null | undefined) {
  if (!prompt) return null;
  const compact = prompt.replace(/\s+/g, " ").trim();
  if (compact.length <= 120) return compact;
  return `${compact.slice(0, 117)}...`;
}
