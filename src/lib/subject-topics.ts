import type { Topic } from "@/lib/shared-types";

export type TopicSummary = Pick<Topic, "id" | "title">;

export const calculusTopics: TopicSummary[] = [
  { id: "limits", title: "Limits & Continuity" },
  { id: "derivatives", title: "Derivatives" },
  { id: "applications", title: "Applications of Derivatives" },
  { id: "integrals", title: "Integrals" },
  { id: "series", title: "Series & Sequences" },
  { id: "differential-equations", title: "Differential Equations" },
  { id: "applications-of-integration", title: "Applications of Integration" },
  { id: "multivariable", title: "Multivariable & Vector Calculus" },
];

export const statisticsTopics: TopicSummary[] = [
  { id: "descriptive", title: "Descriptive Statistics" },
  { id: "probability", title: "Foundations of Probability" },
  { id: "discrete-distributions", title: "Discrete Probability Distributions" },
  { id: "continuous-distributions", title: "Continuous Probability Distributions" },
  { id: "sampling", title: "Sampling and Data Distributions" },
  { id: "estimation", title: "Statistical Inference: Estimation" },
  { id: "hypothesis-testing", title: "Statistical Inference: Hypothesis Testing" },
  { id: "anova", title: "Analysis of Variance" },
  { id: "regression", title: "Linear Regression and Correlation" },
  { id: "nonparametric", title: "Nonparametric Methods" },
];

export const linalgTopics: TopicSummary[] = [
  { id: "systems", title: "Systems of Linear Equations" },
  { id: "vectors", title: "Vectors and Euclidean Spaces" },
  { id: "matrices", title: "Matrix Algebra" },
  { id: "determinants", title: "Determinants" },
  { id: "spaces", title: "Vector Spaces" },
  { id: "orthogonality", title: "Orthogonality and Least Squares" },
  { id: "eigenvalues", title: "Eigenvalues and Eigenvectors" },
  { id: "symmetric-matrices", title: "Symmetric Matrices and Quadratic Forms" },
];
