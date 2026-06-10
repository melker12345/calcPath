// NOTE: topics/problems/modules are intentionally empty here.
// Full data (topics + problems + module section structure) is sourced at call-sites
// from the @/lib/content/loader + FileSystemContentBundle (or adapters for full ModuleContent).
// The legacy shims and modules/ tree have been fully retired; this thin registry avoids pulling any retired content
// into client bundles that also contain the progress system.
// See deriveModuleStructureFromBundle + guarded loads in homes/dashboard for the pattern.
// Stable IDs + section slugs preserved for full progress compat.

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
 * This is the thin metadata registry (icon, order, hasTests, shortDescription, etc.).
 * The Record here provides graceful fallback/overrides for discovered subjects.
 *
 * For true "just drop content/": new subjects need *no entry here at all*.
 * Use getAvailableSubjectConfigs() from the loader (import directly from "@/lib/content/loader"): it scans
 * content/[*]/index.json and merges metadata from this record only if present.
 *
 * topics/problems/modules are empty (intentionally). Full data sourced at call-sites
 * from @/lib/content/loader + FileSystemContentBundle.
 * See deriveModuleStructureFromBundle + guarded loads.
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
  /** Populated by getAvailableSubjectConfigs for the /subjects overview (from content index topics list) */
  topicCount?: number;
  category?: string;
};

export const subjects: Record<SubjectSlug, SubjectConfig> = {
  precalculus: {
    slug: "precalculus",
    label: "Precalculus",
    shortDescription: "Advanced functions, trigonometry, complex numbers, and preparation for calculus.",
    modulesDescription: "Read the precalculus chapters in order, or jump directly to the topic you need.",
    icon: "ƒ",
    order: 1,
    category: "foundations",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  algebra: {
    slug: "algebra",
    label: "Algebra",
    shortDescription: "Equations, functions, polynomials, exponents, and the language of symbolic mathematics.",
    modulesDescription: "Read the algebra chapters in order, or jump directly to the topic you need.",
    icon: "x²",
    order: 2,
    category: "foundations",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  geometry: {
    slug: "geometry",
    label: "Geometry",
    shortDescription: "Euclidean geometry, proofs, congruence, similarity, circles, and spatial reasoning.",
    modulesDescription: "Read the geometry chapters in order, or jump directly to the topic you need.",
    icon: "△",
    order: 3,
    category: "foundations",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  "discrete-mathematics": {
    slug: "discrete-mathematics",
    label: "Discrete Mathematics",
    shortDescription: "Logic, sets, proofs, combinatorics, graphs, and number theory — the mathematical foundation of computer science.",
    modulesDescription: "Read the discrete mathematics chapters in order, or jump directly to the topic you need.",
    icon: "∅",
    order: 4,
    category: "discrete",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  calculus: {
    slug: "calculus",
    label: "Calculus",
    shortDescription: "A free calculus course covering limits, derivatives, applications, integrals, series, and differential equations.",
    modulesDescription: "Read the calculus chapters in order, or jump directly to the topic you need.",
    icon: "∫",
    order: 5,
    category: "calculus",
    topics: [],
    problems: [],
    modules: [],
    hasTests: true,
  },
  "linear-algebra": {
    slug: "linear-algebra",
    label: "Linear Algebra",
    shortDescription: "A free linear algebra course covering systems, vectors, matrices, determinants, vector spaces, orthogonality, eigenvalues, and symmetric matrices.",
    modulesDescription: "Read the linear algebra chapters in order, or jump directly to the topic you need.",
    icon: "λ",
    order: 6,
    category: "linear",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  statistics: {
    slug: "statistics",
    label: "Statistics",
    shortDescription: "A free statistics course from descriptive summaries through probability, inference, regression, and non-parametric methods.",
    modulesDescription: "Read the statistics chapters in order, or jump directly to the topic you need.",
    icon: "σ",
    order: 7,
    category: "stats",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  "number-theory": {
    slug: "number-theory",
    label: "Number Theory",
    shortDescription: "The queen of mathematics. From elementary divisibility, primes, and congruences to deeper patterns in numbers.",
    modulesDescription: "Read the number theory chapters in order, or jump directly to the topic you need.",
    icon: "ℤ",
    order: 8,
    category: "algebra",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  combinatorics: {
    slug: "combinatorics",
    label: "Combinatorics",
    shortDescription: "The art of counting, arranging, and optimizing discrete structures.",
    modulesDescription: "Read the combinatorics chapters in order, or jump directly to the topic you need.",
    icon: "C",
    order: 9,
    category: "discrete",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  "set-theory": {
    slug: "set-theory",
    label: "Set Theory",
    shortDescription: "Axiomatic set theory, ordinals, cardinals, and the foundations of mathematics.",
    modulesDescription: "Read the set theory chapters in order, or jump directly to the topic you need.",
    icon: "∅",
    order: 10,
    category: "foundations",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  "mathematical-logic": {
    slug: "mathematical-logic",
    label: "Mathematical Logic",
    shortDescription: "Foundations of mathematics: logic, set theory, model theory, and computability.",
    modulesDescription: "Read the mathematical logic chapters in order, or jump directly to the topic you need.",
    icon: "⊢",
    order: 11,
    category: "logic",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  "abstract-algebra": {
    slug: "abstract-algebra",
    label: "Abstract Algebra",
    shortDescription: "Groups, rings, fields, and homomorphisms — the structural heart of modern mathematics.",
    modulesDescription: "Read the abstract algebra chapters in order, or jump directly to the topic you need.",
    icon: "𝔾",
    order: 12,
    category: "algebra",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  "information-theory": {
    slug: "information-theory",
    label: "Information Theory",
    shortDescription: "The mathematical study of the quantification, storage, and communication of information.",
    modulesDescription: "Read the information theory chapters in order, or jump directly to the topic you need.",
    icon: "H(X)",
    order: 13,
    category: "logic",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
  "real-analysis": {
    slug: "real-analysis",
    label: "Real Analysis",
    shortDescription: "Rigorous foundations of calculus: limits, continuity, differentiation, integration, sequences and series on the real line.",
    modulesDescription: "Read the real analysis chapters in order, or jump directly to the topic you need.",
    icon: "ℝ",
    order: 14,
    category: "analysis",
    topics: [],
    problems: [],
    modules: [],
    hasTests: false,
  },
};

// topic tests currently only have data for subjects where test question pools exist in lib/test-questions.ts; new subjects can set hasTests:true in their content/*/index.json once data is provided.
// Only calculus currently enables tests (data exists); others false until test pools are added. New drops (precalculus, geometry, number-theory, etc.) default to false.

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
  // Data-driven sources (loader) provide topics directly from content/{slug}/index + topics/.
  return [...(subject.topics || [])];
}

// Auto-discovery support for "just drop content/" lives ONLY in the loader
// (getAvailableSubjectConfigs / getDiscoveredSubjectSlugs). The dynamic import of
// loader from here would pull "server-only" into client bundles (subjects.ts is
// imported by "use client" components like header/landing/dashboard-content).
// Always import directly from "@/lib/content/loader" for the async merged list
// (works in all server contexts, RSC, server actions, etc.).
// Sync subjectList / get* / getOrderedSubjects remain for declared subjects + client.