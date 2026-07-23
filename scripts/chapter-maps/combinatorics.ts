import type { ChapterPlan } from "../lib/consolidate-chapters";

export const COMBINATORICS_CHAPTERS: ChapterPlan[] = [
  {
    id: "basic-counting",
    title: "Basic Counting",
    description:
      "Permutations, combinations, and binomial coefficients — the core tools for counting discrete arrangements and selections.",
    order: 1,
    topicIds: [
      "combinatorics",
      "permutation",
      "combination",
      "binomial-coefficient",
    ],
  },
  {
    id: "counting-principles",
    title: "Counting Principles",
    description:
      "The pigeonhole principle, inclusion–exclusion, and bijective proofs for existence and exact counting.",
    order: 2,
    topicIds: [
      "pigeonhole-principle",
      "inclusion-exclusion-principle",
      "bijective-proof",
    ],
  },
  {
    id: "generating-functions",
    title: "Generating Functions & Recurrences",
    description:
      "Ordinary and exponential generating functions, and recurrence relations for encoding and solving counting problems.",
    order: 3,
    topicIds: [
      "generating-function",
      "exponential-generating-function",
      "recurrence-relation",
    ],
  },
  {
    id: "special-sequences",
    title: "Special Sequences & Numbers",
    description:
      "Catalan, Stirling, and Bell numbers — classical combinatorial sequences with deep structural meaning.",
    order: 4,
    topicIds: ["catalan-number", "stirling-number", "bell-number"],
  },
  {
    id: "enumerative-combinatorics",
    title: "Enumerative Combinatorics",
    description:
      "Young tableaux, the hook-length formula, Robinson–Schensted correspondence, and systematic enumeration.",
    order: 5,
    topicIds: [
      "enumerative-combinatorics",
      "young-tableau",
      "hook-length-formula",
      "robinson-schensted-correspondence",
    ],
  },
  {
    id: "graph-combinatorics",
    title: "Graph Combinatorics",
    description:
      "Graph coloring, Ramsey theory, extremal graph theory, Turán's theorem, and Szemerédi's theorem.",
    order: 6,
    topicIds: [
      "graph-coloring",
      "ramsey-theory",
      "extremal-graph-theory",
      "turans-theorem",
      "szemeredis-theorem",
    ],
  },
  {
    id: "combinatorial-optimization",
    title: "Combinatorial Optimization",
    description:
      "Matroids, matchings, network flows, and linear programming for discrete optimization problems.",
    order: 7,
    topicIds: [
      "matroid",
      "matching-graph-theory",
      "network-flow",
      "linear-programming",
    ],
  },
  {
    id: "advanced-combinatorics",
    title: "Advanced Combinatorics",
    description:
      "The probabilistic method, Lovász Local Lemma, combinatorial nullstellensatz, and additive combinatorics.",
    order: 8,
    topicIds: [
      "probabilistic-method",
      "lovasz-local-lemma",
      "combinatorial-nullstellensatz",
      "additive-combinatorics",
    ],
  },
];