import { limitsProblems } from "./calculus-questions/limits";
import { derivativeProblems } from "./calculus-questions/derivatives";
import { applicationProblems } from "./calculus-questions/applications";
import { integralProblems } from "./calculus-questions/integrals";
import { seriesProblems } from "./calculus-questions/series";
import { differentialEquationProblems } from "./calculus-questions/differential-equations";
import { appIntProblems } from "./calculus-questions/applications-of-integration";
import { multivariableProblems } from "./calculus-questions/multivariable";
import { parametricPolarProblems } from "./calculus-questions/parametric-polar";
import { modules } from "./modules";
import type { Problem, Topic } from "./shared-types";

export type { ProblemType, Problem, Topic } from "./shared-types";

export const topics: Topic[] = [
  {
    id: "limits",
    title: "Limits & Continuity",
    description: "Build intuition for approaching values and continuity.",
    order: 1,
    estimatedMinutes: 90,
  },
  {
    id: "derivatives",
    title: "Derivatives",
    description: "Compute derivatives and interpret rates of change.",
    order: 2,
    estimatedMinutes: 120,
  },
  {
    id: "applications",
    title: "Applications of Derivatives",
    description: "Optimization, related rates, and motion.",
    order: 3,
    estimatedMinutes: 110,
  },
  {
    id: "integrals",
    title: "Integrals",
    description: "Understand accumulation and compute integrals.",
    order: 4,
    estimatedMinutes: 120,
  },
  {
    id: "series",
    title: "Series & Sequences",
    description: "Analyze convergence and common series tests.",
    order: 5,
    estimatedMinutes: 120,
  },
  {
    id: "differential-equations",
    title: "Differential Equations",
    description: "Solve basic differential equations and interpret models.",
    order: 6,
    estimatedMinutes: 90,
  },
  {
    id: "applications-of-integration",
    title: "Applications of Integration",
    description: "Areas, volumes, arc length, work, hydrostatic force, center of mass, average value, and parametric curves.",
    order: 7,
    estimatedMinutes: 130,
  },
  {
    id: "parametric-polar",
    title: "Parametric Equations and Polar Coordinates",
    description: "Curves defined by parameters and the power of polar coordinates for circular and radial regions.",
    order: 8,
    estimatedMinutes: 100,
  },
  {
    id: "multivariable",
    title: "Multivariable & Vector Calculus",
    description: "Partial derivatives, multiple integrals, and vector fields.",
    order: 9,
    estimatedMinutes: 150,
  },
];

export const problems: Problem[] = [
  ...limitsProblems,
  ...derivativeProblems,
  ...applicationProblems,
  ...integralProblems,
  ...seriesProblems,
  ...differentialEquationProblems,
  ...appIntProblems,
  ...multivariableProblems,
  ...parametricPolarProblems,
];

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Maps each problem section slug to its module section title slug.
 * Built from the modules data so we can deep-link practice → module section.
 */
const sectionToAnchor: Record<string, Record<string, string>> = {
  limits: {
    directsub: "evaluating-limits-direct-substitution",
    trig: "key-trigonometric-limits",
    indeterminate: "indeterminate-forms-and-algebraic-tricks",
    lhopital: "l-h-pital-s-rule",
    atinfinity: "limits-at-infinity-and-horizontal-asymptotes",
    continuity: "continuity",
    funcrep: "functional-representations-the-language-before-the-calculus",
    intuition: "building-intuition-what-does-approaching-mean",
    onesided: "one-sided-limits",
    squeeze: "the-squeeze-theorem",
    piecewise: "evaluating-limits-of-piecewise-functions",
    infinite: "infinite-limits-and-vertical-asymptotes",
  },
  derivatives: {
    definition: "the-definition-and-what-it-means",
    rules: "core-differentiation-rules",
    common: "derivatives-of-common-functions",
    product: "product-rule",
    quotient: "quotient-rule",
    chain: "chain-rule",
    invtrig: "inverse-trigonometric-derivatives",
    implicit: "implicit-differentiation",
    logdiff: "logarithmic-differentiation",
    higherorder: "higher-order-derivatives",
    tangent: "tangent-lines-and-linearization",
    graphical: "interpreting-the-derivative-graphically",
    hyperbolic: "hyperbolic-functions-and-their-derivatives",
  },
  applications: {
    critical: "critical-points-and-the-first-derivative-test",
    secondderiv: "the-second-derivative-test",
    concavity: "concavity-and-inflection-points",
    extrema: "absolute-extrema-on-closed-intervals-extreme-value-theorem",
    curvesketch: "curve-sketching-putting-it-all-together",
    optimization: "optimization-problems",
    relatedrates: "related-rates",
    motion: "motion-along-a-line",
    linearization: "linearization-and-differentials",
    mvt: "the-mean-value-theorem",
    newton: "newton-s-method",
    ratesci: "rates-of-change-in-the-sciences",
  },
  integrals: {
    riemann: "the-big-idea-riemann-sums",
    ftc: "the-fundamental-theorem-of-calculus-ftc",
    netarea: "net-area-vs-total-area",
    antideriv: "antiderivatives-and-the-constant-of-integration",
    toolbox: "common-integrals-your-core-toolbox",
    usub: "substitution-reverse-chain-rule",
    parts: "integration-by-parts-reverse-product-rule",
    trigint: "trigonometric-integrals",
    trigsub: "trigonometric-substitution",
    partial: "partial-fractions",
    improper: "improper-integrals",
    technique: "which-technique-should-i-use-decision-tree",
    areaprev: "area-between-curves-and-volumes-preview",
  },
  series: {
    sequences: "sequences-and-their-limits",
    partialsums: "series-partial-sums-and-convergence",
    geometric: "geometric-series",
    telescoping: "telescoping-series",
    divergence: "the-divergence-test-nth-term-test",
    pseries: "p-series-and-the-harmonic-series",
    integraltest: "the-integral-test",
    comparison: "comparison-and-limit-comparison-tests",
    ratioroot: "ratio-and-root-tests",
    alternating: "alternating-series-test",
    absconv: "absolute-vs-conditional-convergence",
    power: "power-series",
    taylor: "taylor-and-maclaurin-series",
    remainder: "taylor-remainder-and-error-bounds",
    building: "building-new-series-from-known-ones",
    strategy: "choosing-the-right-convergence-test-strategy",
  },
  "differential-equations": {
    intro: "what-is-a-differential-equation",
    slopefields: "direction-fields-slope-fields",
    separable: "separable-equations",
    expgrowth: "exponential-growth-and-decay",
    cooling: "newton-s-law-of-cooling",
    linear: "linear-first-order-equations",
    logistic: "logistic-growth",
    bernoulli: "bernoulli-equations",
    secondorder: "second-order-linear-homogeneous-equations",
    nonhomog: "non-homogeneous-equations-and-particular-solutions",
    springs: "applications-springs-and-oscillations",
    ivp: "initial-value-problems-ivps",
  },
  "applications-of-integration": {
    areacurves: "areas-between-curves",
    diskwasher: "volumes-of-solids-of-revolution-disk-and-washer-methods",
    shells: "volumes-by-cylindrical-shells",
    arclength: "arc-length",
    parametric: "parametric-equations-curves-in-motion",
    surfacearea: "surface-area-of-revolution",
    work: "work-and-physical-applications",
    averagevalue: "average-value-of-a-function",
    hydrostatic: "hydrostatic-force",
    centerofmass: "center-of-mass-and-moments",
  },
  "parametric-polar": {
    "parametric-basics": "parametric-equations-curves-with-a-parameter",
    "parametric-derivatives": "derivatives-and-tangent-lines-for-parametric-curves",
    "parametric-arclength": "arc-length-of-parametric-curves",
    "parametric-area": "areas-and-other-integrals-with-parametric-curves",
    "polar-intro": "introduction-to-polar-coordinates",
    "polar-area": "area-in-polar-coordinates",
    "polar-areabetween": "area-between-polar-curves",
    "polar-arclength": "arc-length-in-polar-coordinates",
    "polar-calculus": "calculus-with-polar-curves",
    "polar-conics": "conic-sections-in-polar-form",
  },
  multivariable: {
    vectors: "vectors-and-the-geometry-of-space",
    vectorfunc: "vector-functions-and-space-curves",
    partials: "partial-derivatives",
    gradient: "the-gradient-vector-and-directional-derivatives",
    optimization: "optimization-and-lagrange-multipliers",
    multiint: "multiple-integrals",
    vectorfields: "vector-fields",
    lineint: "line-integrals",
    curldiv: "curl-and-divergence",
    theorems: "green-s-stokes-and-the-divergence-theorem",
  },
};

/**
 * Returns the module section title (human-readable) for a problem's section,
 * or null if no match is found.
 */
export function getModuleSectionTitle(
  topicId: string,
  section: string,
): string | null {
  const anchor = sectionToAnchor[topicId]?.[section];
  if (!anchor) return null;

  const mod = modules.find((m) => m.topicId === topicId);
  if (!mod) return null;

  return (
    mod.sections.find((s) => toSlug(s.title) === anchor)?.title ?? null
  );
}

/**
 * Returns the URL path to the module section for a given problem.
 */
export function getModuleSectionUrl(
  topicId: string,
  section: string,
): string | null {
  const anchor = sectionToAnchor[topicId]?.[section];
  if (!anchor) return `/calculus/modules/${topicId}`;
  return `/calculus/modules/${topicId}#${anchor}`;
}

/**
 * Returns the next section slug (for question filtering) within the same topic,
 * or null if this is the last section in the topic.
 */
export function getNextSection(topicId: string, currentSection: string): string | null {
  const mod = modules.find((m) => m.topicId === topicId);
  if (!mod || !mod.sections) return null;

  const anchorMap = sectionToAnchor[topicId] || {};
  // Build ordered list of question sections based on module order
  const orderedSections: string[] = [];

  for (const moduleSection of mod.sections) {
    const moduleAnchor = toSlug(moduleSection.title);
    // Find which question section maps to this anchor
    const questionSection = Object.keys(anchorMap).find(
      (key) => anchorMap[key] === moduleAnchor
    );
    if (questionSection) {
      orderedSections.push(questionSection);
    }
  }

  const currentIndex = orderedSections.indexOf(currentSection);
  if (currentIndex === -1 || currentIndex === orderedSections.length - 1) {
    return null;
  }

  return orderedSections[currentIndex + 1];
}

