import type { ChapterPlan } from "../lib/consolidate-chapters";

export const REAL_ANALYSIS_CHAPTERS: ChapterPlan[] = [
  {
    id: "real-number-system",
    title: "The Real Number System",
    description:
      "Construction and properties of the real numbers: completeness, order, density, Dedekind cuts, and cardinality.",
    order: 1,
    topicIds: [
      "real-number",
      "construction-of-the-real-numbers",
      "least-upper-bound-property",
      "archimedean-property",
      "density-of-the-rationals",
      "dedekind-cut",
      "cardinality-of-the-continuum",
    ],
  },
  {
    id: "sequences-and-series",
    title: "Sequences & Series",
    description:
      "Convergence of sequences, Cauchy sequences, infinite series, absolute convergence, and power series.",
    order: 2,
    topicIds: [
      "sequence",
      "limit-of-a-sequence",
      "cauchy-sequence",
      "series-mathematics",
      "absolute-convergence",
      "power-series",
    ],
  },
  {
    id: "limits-and-continuity",
    title: "Limits & Continuity",
    description:
      "ε-δ limits of functions, continuity, uniform continuity, and the intermediate and extreme value theorems.",
    order: 3,
    topicIds: [
      "limit-of-a-function",
      "epsilon-delta-definition-of-limit",
      "continuous-function",
      "uniform-continuity",
      "intermediate-value-theorem",
      "extreme-value-theorem",
    ],
  },
  {
    id: "differentiation",
    title: "Differentiation",
    description:
      "The derivative, mean value theorem, Taylor approximations, and L'Hôpital's rule.",
    order: 4,
    topicIds: [
      "derivative",
      "mean-value-theorem",
      "taylors-theorem",
      "lhopitals-rule",
    ],
  },
  {
    id: "riemann-integration",
    title: "Riemann Integration",
    description:
      "Riemann sums, the fundamental theorem of calculus, improper integrals, and Riemann–Stieltjes integration.",
    order: 5,
    topicIds: [
      "riemann-integral",
      "fundamental-theorem-of-calculus",
      "improper-integral",
      "riemann-stieltjes-integral",
    ],
  },
  {
    id: "lebesgue-integration",
    title: "Lebesgue Integration",
    description:
      "Measure-theoretic integration, convergence theorems, and the dominated convergence theorem.",
    order: 6,
    topicIds: ["lebesgue-integral", "dominated-convergence-theorem"],
  },
  {
    id: "metric-spaces",
    title: "Metric Spaces & Topology",
    description:
      "Metric spaces, open and closed sets, compactness, completeness, connectedness, and fixed-point theorems.",
    order: 7,
    topicIds: [
      "metric-space",
      "open-set-and-closed-set",
      "compact-space",
      "complete-metric-space",
      "connected-space",
      "banach-fixed-point-theorem",
      "baire-category-theorem",
    ],
  },
  {
    id: "advanced-analysis",
    title: "Advanced Topics",
    description:
      "Functions of bounded variation, absolute continuity, Lᵖ spaces, Fourier series, and rigorous multivariable calculus.",
    order: 8,
    topicIds: [
      "function-of-bounded-variation",
      "absolutely-continuous-function",
      "differentiation-of-measures",
      "lp-space",
      "fourier-series",
      "multivariable-calculus-rigorous",
    ],
  },
];