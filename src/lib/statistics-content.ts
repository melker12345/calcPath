import { descriptiveProblems } from "./statistics-questions/descriptive";
import { probabilityProblems } from "./statistics-questions/probability";
import { discreteDistributionProblems } from "./statistics-questions/discrete-distributions";
import { continuousDistributionProblems } from "./statistics-questions/continuous-distributions";
import { samplingProblems } from "./statistics-questions/sampling";
import { estimationProblems } from "./statistics-questions/estimation";
import { hypothesisTestingProblems } from "./statistics-questions/hypothesis-testing";
import { anovaProblems } from "./statistics-questions/anova";
import { regressionProblems } from "./statistics-questions/regression";
import { nonparametricProblems } from "./statistics-questions/nonparametric";
import { distributionProblems } from "./statistics-questions/distributions";
import { inferenceProblems } from "./statistics-questions/inference";
import { modules } from "./statistics-modules";
import type { Problem, Topic } from "./shared-types";

export type { ProblemType, Problem, Topic } from "./shared-types";

export const topics: Topic[] = [
  {
    id: "descriptive",
    title: "Descriptive Statistics",
    description: "Measures of center, spread, shape, and data visualization.",
    order: 1,
    estimatedMinutes: 60,
  },
  {
    id: "probability",
    title: "Foundations of Probability",
    description: "Sample spaces, probability rules, conditional probability, and Bayes' theorem.",
    order: 2,
    estimatedMinutes: 75,
  },
  {
    id: "discrete-distributions",
    title: "Discrete Probability Distributions",
    description: "Random variables, PMFs, expected value, binomial, Poisson, and geometric distributions.",
    order: 3,
    estimatedMinutes: 75,
  },
  {
    id: "continuous-distributions",
    title: "Continuous Probability Distributions",
    description: "PDFs, CDFs, normal, exponential, and uniform distributions.",
    order: 4,
    estimatedMinutes: 75,
  },
  {
    id: "sampling",
    title: "Sampling and Data Distributions",
    description: "Population vs. sample, law of large numbers, central limit theorem, and sampling distributions.",
    order: 5,
    estimatedMinutes: 60,
  },
  {
    id: "estimation",
    title: "Statistical Inference: Estimation",
    description: "Point estimation, maximum likelihood estimation, and confidence intervals.",
    order: 6,
    estimatedMinutes: 75,
  },
  {
    id: "hypothesis-testing",
    title: "Statistical Inference: Hypothesis Testing",
    description: "Null and alternative hypotheses, p-values, Type I/II errors, and t-tests.",
    order: 7,
    estimatedMinutes: 90,
  },
  {
    id: "anova",
    title: "Analysis of Variance",
    description: "One-way ANOVA, the F-test, multiple comparisons, and two-way ANOVA.",
    order: 8,
    estimatedMinutes: 75,
  },
  {
    id: "regression",
    title: "Linear Regression and Correlation",
    description: "Pearson correlation, OLS regression, residuals, and inference for coefficients.",
    order: 9,
    estimatedMinutes: 75,
  },
  {
    id: "nonparametric",
    title: "Non-Parametric Statistics",
    description: "Chi-square tests, Mann-Whitney U, and Wilcoxon signed-rank tests.",
    order: 10,
    estimatedMinutes: 60,
  },
];

export const problems: Problem[] = [
  ...descriptiveProblems,
  ...probabilityProblems,
  ...discreteDistributionProblems,
  ...continuousDistributionProblems,
  ...samplingProblems,
  ...estimationProblems,
  ...hypothesisTestingProblems,
  ...anovaProblems,
  ...regressionProblems,
  ...nonparametricProblems,
  ...distributionProblems,
  ...inferenceProblems,
];

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Maps each problem section slug → module section title slug for deep-linking
 * practice problems to the relevant module section.
 */
const sectionToAnchor: Record<string, Record<string, string>> = {
  descriptive: {
    mean: "measures-of-central-tendency",
    median: "measures-of-central-tendency",
    variance: "measures-of-spread",
    visualization: "data-visualization",
    percentiles: "percentiles-and-the-five-number-summary",
  },
  probability: {
    basic: "basic-probability-rules",
    conditional: "conditional-probability-and-independence",
    bayes: "bayes-theorem",
    counting: "counting-principles",
    total: "law-of-total-probability",
  },
  "discrete-distributions": {
    "expected-value": "random-variables-and-expected-value",
    binomial: "the-binomial-distribution",
    poisson: "the-poisson-distribution",
  },
  "continuous-distributions": {
    normal: "the-normal-distribution",
    exponential: "the-exponential-and-uniform-distributions",
    pdf: "pdfs-and-cdfs",
    approximation: "normal-approximation-to-the-binomial",
  },
  sampling: {
    clt: "the-central-limit-theorem",
    "sampling-distribution": "sampling-distribution-of-the-proportion",
    lln: "the-law-of-large-numbers",
    "pop-vs-sample": "population-vs-sample",
  },
  estimation: {
    "confidence-intervals": "confidence-intervals",
    mle: "sampling-distributions",
    "point-estimate": "sampling-distributions",
  },
  "hypothesis-testing": {
    "p-value": "the-logic-of-hypothesis-testing",
    errors: "type-i-and-type-ii-errors",
    "t-test": "t-tests",
    "z-test": "one-sample-z-test",
  },
  anova: {
    "f-test": "one-way-anova",
    assumptions: "assumptions-of-anova",
    "multiple-comparisons": "multiple-comparisons",
    "two-way": "two-way-anova",
  },
  regression: {
    correlation: "correlation",
    linear: "simple-linear-regression",
    residuals: "residuals-and-model-assessment",
    inference: "conditions-for-regression",
  },
  nonparametric: {
    "chi-square": "chi-square-goodness-of-fit-test",
    "rank-tests": "mann-whitney-u-and-wilcoxon-tests",
    independence: "chi-square-test-for-independence",
  },
};

/**
 * Returns the human-readable module section title for a problem's section,
 * or null if no mapping is found.
 */
export function getModuleSectionTitle(
  topicId: string,
  section: string,
): string | null {
  const anchor = sectionToAnchor[topicId]?.[section];
  if (!anchor) return null;
  const mod = modules.find((m) => m.topicId === topicId);
  if (!mod) return null;
  return mod.sections.find((s) => toSlug(s.title) === anchor)?.title ?? null;
}

/**
 * Returns the URL to the relevant module section for a practice problem,
 * falling back to the module root if no section mapping exists.
 */
export function getModuleSectionUrl(
  topicId: string,
  section: string,
): string | null {
  const anchor = sectionToAnchor[topicId]?.[section];
  if (!anchor) return `/statistics/modules/${topicId}`;
  return `/statistics/modules/${topicId}#${anchor}`;
}
