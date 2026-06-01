import { modules as calculusModules } from "@/lib/modules";
import { modules as linalgModules } from "@/lib/linalg-modules";
import { modules as statisticsModules } from "@/lib/statistics-modules";

// NOTE: topics/problems intentionally NOT imported from the inert legacy shims
// (calculus-content etc). Those shims exist only for remaining direct call-sites
// in not-yet-migrated per-subject pages (which will be updated by other agents
// to source from @/lib/content/loader + FileSystemContentBundle instead).
// Importing the shims here would pull them into client chunks (e.g. via DashboardContent
// + ProgressProvider, or search) alongside the progress system, recreating the
// "topics is not defined" Turbopack client module evaluation landmine on real routes.
// Subjects now only carries metadata + modules (for section structure). Full lists
// come from the data-driven content system (preserving stable ids for progress compat).

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
 * topics/problems are empty (intentionally; see top-of-file comment). They are
 * sourced at call-sites from the new @/lib/content/loader + FileSystemContentBundle
 * (or legacy shims directly for not-yet-migrated pages). This keeps subjects.ts
 * from pulling inert *-content shims into client bundles that also contain the
 * progress system (ProgressProvider / useProgress), eliminating the
 * "ReferenceError: topics is not defined at module evaluation" landmine in
 * Turbopack client chunks for real practice routes.
 *
 * modules are still provided here (for section structure used by getSectionPracticeProgress etc).
 * getPracticeProgress callers now primarily pass problems lists from the FS bundle
 * (stable ids ensure cross-compat with legacy progress data).
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
    topics: [],
    problems: [],
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
    topics: [],
    problems: [],
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
    topics: [],
    problems: [],
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
