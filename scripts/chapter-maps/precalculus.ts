import type { ChapterPlan } from "../lib/consolidate-chapters";

export const PRECALCULUS_CHAPTERS: ChapterPlan[] = [
  {
    id: "functions-and-graphs",
    title: "Functions & Graphs",
    description:
      "Function notation, domain and range, symmetry, inverses, composition, transformations, and piecewise definitions.",
    order: 1,
    topicIds: [
      "function-mathematics",
      "domain-of-a-function",
      "range-mathematics",
      "even-and-odd-functions",
      "inverse-function",
      "function-composition",
      "transformation-of-functions",
      "piecewise-function",
    ],
  },
  {
    id: "polynomial-rational-functions",
    title: "Polynomial & Rational Functions",
    description:
      "Polynomial behavior, zeros and roots, rational functions, asymptotes, and partial fractions.",
    order: 2,
    topicIds: [
      "polynomial",
      "root-of-a-function",
      "rational-function",
      "asymptote",
      "partial-fraction-decomposition",
    ],
  },
  {
    id: "exponential-logarithmic-functions",
    title: "Exponential & Logarithmic Functions",
    description:
      "Exponential and logarithmic rules, the natural log, logarithmic scales, and growth models.",
    order: 3,
    topicIds: [
      "exponential-function",
      "logarithm",
      "natural-logarithm",
      "logarithmic-scale",
      "exponential-growth",
    ],
  },
  {
    id: "trigonometric-functions",
    title: "Trigonometric Functions",
    description:
      "Sine, cosine, tangent, the unit circle, and core trigonometric identities.",
    order: 4,
    topicIds: [
      "trigonometric-functions-overview",
      "sine",
      "cosine",
      "tangent",
      "unit-circle",
      "trigonometric-identity",
    ],
  },
  {
    id: "analytic-trigonometry",
    title: "Analytic Trigonometry",
    description:
      "Angle formulas, laws of sines and cosines, inverse trig, equations, and substitution preview.",
    order: 5,
    topicIds: [
      "double-angle-formula",
      "half-angle-formula",
      "sum-to-product-identity",
      "sum-and-difference-formulas",
      "law-of-sines",
      "law-of-cosines",
      "inverse-trigonometric-functions",
      "trigonometric-equation",
      "trigonometric-substitution",
    ],
  },
  {
    id: "systems-and-matrices",
    title: "Systems & Matrices",
    description:
      "Linear systems, matrix arithmetic, determinants, inverses, and Gaussian elimination.",
    order: 6,
    topicIds: [
      "system-of-linear-equations",
      "matrix-mathematics",
      "determinant",
      "inverse-matrix",
      "matrix-multiplication",
      "gaussian-elimination",
    ],
  },
  {
    id: "complex-and-polar",
    title: "Complex Numbers & Polar Coordinates",
    description:
      "Complex arithmetic, the complex plane, polar form, De Moivre's theorem, polar and parametric curves.",
    order: 7,
    topicIds: [
      "complex-number",
      "complex-plane",
      "polar-form-of-complex-numbers",
      "de-moivres-theorem",
      "polar-coordinates",
      "parametric-equation",
    ],
  },
  {
    id: "sequences-series-conics",
    title: "Sequences, Series & Conics",
    description:
      "Sequences, arithmetic and geometric progressions, the binomial theorem, and conic sections.",
    order: 8,
    topicIds: [
      "sequence",
      "arithmetic-progression",
      "geometric-progression",
      "binomial-theorem",
      "conic-section",
    ],
  },
  {
    id: "introduction-to-limits",
    title: "Introduction to Limits",
    description:
      "Limit notation and intuition as a bridge from precalculus into calculus.",
    order: 9,
    topicIds: ["limit-mathematics"],
  },
];