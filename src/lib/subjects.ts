import { modules as calculusModules } from "@/lib/modules";
import type { Problem, Topic } from "@/lib/shared-types";

/**
 * Subject identifier.
 * Kept as `string` intentionally so we can add new subjects (e.g. Real Analysis, Discrete Math)
 * without having to update this type or touch dozens of files.
 */
export type SubjectSlug = string;

type SubjectModule = {
  topicId: string;
  sections: Array<{
    title: string;
    /** Stable slug that must exactly match the `section` field on questions for this topic (e.g. "squeeze", "chain", "gauss"). */
    section?: string;
  }>;
};

/**
 * Central configuration for a subject.
 * This is the single source of truth for subject metadata.
 * When adding a new subject, you should only need to add an entry here
 * (plus the actual content files).
 *
 * During transition: the `topics`, `problems`, and `modules` here (sourced from
 * legacy shims) are used by the main DashboardContent + CourseContentsPage for
 * structure + feeding getPracticeProgress / getSectionPracticeProgress.
 * Because ported subjects in content/ preserve exact `id` / `topicId` / `section`
 * values (see schema.ts + content ports), the resulting mastery stats are
 * accurate for work done via FileSystemContentBundle data in /x/ (and vice versa).
 * No lists from FS bundles are needed in this file yet; the helpers abstract the source.
 */
export type SubjectConfig = {
  slug: SubjectSlug;
  label: string;
  shortDescription: string;
  modulesDescription: string;
  icon: string;
  order: number; // Used for consistent ordering across the app
  topics: Topic[];
  problems: Problem[];
  modules: SubjectModule[];
  hasTests: boolean;
};

export const subjects: Record<SubjectSlug, SubjectConfig> = {
  calculus: {
    slug: "calculus",
    label: "Calculus",
    shortDescription: "A free calculus course covering limits, derivatives, applications, integrals, series, and differential equations.",
    modulesDescription: "Read the calculus chapters in order, or jump directly to the topic you need.",
    icon: "∫",
    order: 1,
    topics: calculusTopics,
    problems: calculusProblems,
    modules: calculusModules,
    hasTests: true,
  },
  "linear-algebra": {
    slug: "linear-algebra",
    label: "Linear Algebra",
    shortDescription: "A free linear algebra course covering systems, vectors, matrices, determinants, vector spaces, orthogonality, eigenvalues, and symmetric matrices.",
    modulesDescription: "Read the linear algebra chapters in order, or jump directly to the topic you need.",
    icon: "λ",
    order: 2,
    topics: linalgTopics,
    problems: linalgProblems,
    modules: linalgModules,
    hasTests: false,
  },
  statistics: {
    slug: "statistics",
    label: "Statistics",
    shortDescription: "A free statistics course from descriptive summaries through probability, inference, regression, and non-parametric methods.",
    modulesDescription: "Read the statistics chapters in order, or jump directly to the topic you need.",
    icon: "σ",
    order: 3,
    topics: statisticsTopics,
    problems: statisticsProblems,
    modules: statisticsModules,
    hasTests: false,
  },
};

/** Subjects sorted by `order` — use this instead of hardcoding arrays elsewhere. */
export const subjectList: SubjectConfig[] = Object.values(subjects).sort(
  (a, b) => a.order - b.order
);

export function getSubject(slug: SubjectSlug): SubjectConfig | undefined {
  return subjects[slug];
}

/** Returns all subjects in display order */
export function getOrderedSubjects(): SubjectConfig[] {
  return [...subjectList];
}

export function getAvailableTopics(subject: SubjectConfig) {
  return subject.topics.filter((topic) =>
    subject.modules.some((module) => module.topicId === topic.id),
  );
}
