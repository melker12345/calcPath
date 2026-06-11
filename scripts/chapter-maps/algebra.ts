import type { ChapterPlan } from "../lib/consolidate-chapters";

export const ALGEBRA_CHAPTERS: ChapterPlan[] = [
  {
    id: "algebra-foundations",
    title: "Foundations of Algebra",
    description:
      "Variables, expressions, equations, inequalities, and order of operations — the language of symbolic math.",
    order: 1,
    topicIds: [
      "algebra",
      "variable-mathematics",
      "expression-mathematics",
      "equation",
      "inequality-mathematics",
      "order-of-operations",
    ],
  },
  {
    id: "linear-equations-systems",
    title: "Linear Equations & Systems",
    description: "Solving linear equations and systems of linear equations in one or more variables.",
    order: 2,
    topicIds: ["linear-equation", "system-of-linear-equations"],
  },
  {
    id: "inequalities-absolute-value",
    title: "Inequalities & Absolute Value",
    description:
      "Absolute value, linear and quadratic inequalities, and compound inequality techniques.",
    order: 3,
    topicIds: [
      "absolute-value",
      "inequality",
      "absolute-value-equation",
      "absolute-value-inequality",
      "quadratic-inequality",
    ],
  },
  {
    id: "quadratic-equations",
    title: "Quadratic Equations",
    description:
      "Quadratic equations, the quadratic formula, the discriminant, and rational equations.",
    order: 4,
    topicIds: [
      "quadratic-equation",
      "quadratic-formula",
      "discriminant",
      "rational-equation",
    ],
  },
  {
    id: "functions-and-graphs",
    title: "Functions & Graphs",
    description:
      "Function notation, domain and range, linear and quadratic graphs, transformations, and inverses.",
    order: 5,
    topicIds: [
      "function-mathematics",
      "domain-of-a-function",
      "range-mathematics",
      "graph-of-a-function",
      "linear-function",
      "quadratic-function",
      "piecewise-function",
      "transformation-of-functions",
      "even-and-odd-functions",
      "inverse-function",
    ],
  },
  {
    id: "polynomials-factoring",
    title: "Polynomials & Factoring",
    description:
      "Polynomial structure, factoring patterns, division, and rational expressions.",
    order: 6,
    topicIds: [
      "polynomial",
      "monomial",
      "binomial-polynomial",
      "factorization",
      "difference-of-two-squares",
      "sum-and-difference-of-cubes",
      "polynomial-long-division",
      "synthetic-division",
      "rational-expression",
    ],
  },
  {
    id: "exponents-radicals-logarithms",
    title: "Exponents, Radicals & Logarithms",
    description:
      "Exponent rules, roots, rational exponents, exponential functions, logarithms, and radical equations.",
    order: 7,
    topicIds: [
      "exponentiation",
      "power-rule",
      "square-root",
      "nth-root",
      "rational-exponent",
      "exponential-function",
      "logarithm",
      "radical-equation",
    ],
  },
  {
    id: "complex-numbers-sequences",
    title: "Complex Numbers & Sequences",
    description:
      "Complex numbers, the imaginary unit, and arithmetic and geometric sequences.",
    order: 8,
    topicIds: [
      "complex-number",
      "imaginary-unit",
      "arithmetic-progression",
      "geometric-progression",
    ],
  },
];