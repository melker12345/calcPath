import { topics as calculusTopics, problems as calculusProblems } from "@/lib/calculus-content";
import { modules as calculusModules } from "@/lib/modules";
import { topics as statisticsTopics, problems as statisticsProblems } from "@/lib/statistics-content";
import { modules as statisticsModules } from "@/lib/statistics-modules";
import { topics as linalgTopics, problems as linalgProblems } from "@/lib/linalg-content";
import { modules as linalgModules } from "@/lib/linalg-modules";
import type { Problem, Topic } from "@/lib/shared-types";

export type SubjectSlug = "calculus" | "statistics" | "linear-algebra";

type SubjectModule = {
  topicId: string;
  sections: Array<{
    title: string;
    /** Stable slug that must exactly match the `section` field on questions for this topic (e.g. "squeeze", "chain", "gauss"). */
    section?: string;
  }>;
};

export type SubjectConfig = {
  slug: SubjectSlug;
  label: string;
  shortDescription: string;
  modulesDescription: string;
  icon: string;
  topics: Topic[];
  problems: Problem[];
  modules: SubjectModule[];
  hasTests?: boolean;
};

export const subjects: Record<SubjectSlug, SubjectConfig> = {
  calculus: {
    slug: "calculus",
    label: "Calculus",
    shortDescription: "A free calculus course covering limits, derivatives, applications, integrals, series, and differential equations.",
    modulesDescription: "Read the calculus chapters in order, or jump directly to the topic you need.",
    icon: "∫",
    topics: calculusTopics,
    problems: calculusProblems,
    modules: calculusModules,
    hasTests: true,
  },
  statistics: {
    slug: "statistics",
    label: "Statistics",
    shortDescription: "A free statistics course from descriptive summaries through probability, inference, regression, and non-parametric methods.",
    modulesDescription: "Read the statistics chapters in order, or jump directly to the topic you need.",
    icon: "σ",
    topics: statisticsTopics,
    problems: statisticsProblems,
    modules: statisticsModules,
  },
  "linear-algebra": {
    slug: "linear-algebra",
    label: "Linear Algebra",
    shortDescription: "A free linear algebra course covering systems, vectors, matrices, determinants, vector spaces, orthogonality, eigenvalues, and symmetric matrices.",
    modulesDescription: "Read the linear algebra chapters in order, or jump directly to the topic you need.",
    icon: "λ",
    topics: linalgTopics,
    problems: linalgProblems,
    modules: linalgModules,
  },
};

export const subjectList = [subjects.calculus, subjects.statistics, subjects["linear-algebra"]] as const;

export function getSubject(slug: SubjectSlug) {
  return subjects[slug];
}

export function getAvailableTopics(subject: SubjectConfig) {
  return subject.topics.filter((topic) =>
    subject.modules.some((module) => module.topicId === topic.id),
  );
}
