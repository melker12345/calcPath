import { vectorProblems } from "./linalg-questions/vectors";
import { matrixProblems } from "./linalg-questions/matrices";
import { systemProblems } from "./linalg-questions/systems";
import { determinantProblems } from "./linalg-questions/determinants";
import { spaceProblems } from "./linalg-questions/spaces";
import { orthogonalityProblems } from "./linalg-questions/orthogonality";
import { eigenvalueProblems } from "./linalg-questions/eigenvalues";
import { symmetricMatrixProblems } from "./linalg-questions/symmetric-matrices";
import { transformationProblems } from "./linalg-questions/transformations";
import { modules } from "./linalg-modules";
import type { Problem, Topic } from "./shared-types";

export type { ProblemType, Problem, Topic } from "./shared-types";

export const topics: Topic[] = [
  {
    id: "systems",
    title: "Systems of Linear Equations",
    description: "Row reduction, Gaussian elimination, and solution types.",
    order: 1,
    estimatedMinutes: 75,
  },
  {
    id: "vectors",
    title: "Vectors and Euclidean Spaces",
    description: "Vector arithmetic, linear combinations, span, and independence.",
    order: 2,
    estimatedMinutes: 60,
  },
  {
    id: "matrices",
    title: "Matrix Algebra",
    description: "Matrix operations, inverses, and characterizations of invertibility.",
    order: 3,
    estimatedMinutes: 75,
  },
  {
    id: "determinants",
    title: "Determinants",
    description: "Cofactor expansion, properties, Cramer's rule, and geometric interpretation.",
    order: 4,
    estimatedMinutes: 60,
  },
  {
    id: "spaces",
    title: "Vector Spaces",
    description: "Subspaces, basis, dimension, rank, and the rank-nullity theorem.",
    order: 5,
    estimatedMinutes: 90,
  },
  {
    id: "orthogonality",
    title: "Orthogonality and Least Squares",
    description: "Orthogonal projections, Gram-Schmidt process, and least-squares fitting.",
    order: 6,
    estimatedMinutes: 90,
  },
  {
    id: "eigenvalues",
    title: "Eigenvalues and Eigenvectors",
    description: "Characteristic equation, diagonalization, and complex eigenvalues.",
    order: 7,
    estimatedMinutes: 90,
  },
  {
    id: "symmetric-matrices",
    title: "Symmetric Matrices and Quadratic Forms",
    description: "Spectral theorem, quadratic forms, SVD, and PCA.",
    order: 8,
    estimatedMinutes: 90,
  },
];

export const problems: Problem[] = [
  ...systemProblems,
  ...vectorProblems,
  ...matrixProblems,
  ...determinantProblems,
  ...spaceProblems,
  ...orthogonalityProblems,
  ...eigenvalueProblems,
  ...symmetricMatrixProblems,
  ...transformationProblems,
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
  systems: {
    gauss: "gaussian-elimination",
    consistency: "solution-types",
    homogeneous: "homogeneous-systems",
    rank: "rank-and-the-rank-nullity-theorem",
  },
  vectors: {
    operations: "vector-addition-and-scalar-multiplication",
    dot: "the-dot-product",
    projection: "projections",
  },
  matrices: {
    operations: "matrix-notation-and-basic-operations",
    multiplication: "matrix-multiplication",
    determinant: "determinants",
    inverse: "matrix-inverse",
  },
  determinants: {
    cofactor: "cofactor-expansion",
    properties: "properties-of-determinants",
    cramer: "cramer-s-rule",
    geometric: "geometric-interpretation",
  },
  spaces: {
    subspaces: "subspaces",
    span: "span",
    independence: "linear-independence",
    basis: "basis-and-dimension",
    "column-space": "column-space-and-null-space",
    "linear-transformations": "column-space-and-null-space",
  },
  eigenvalues: {
    characteristic: "eigenvalues-and-eigenvectors",
    eigenvectors: "eigenvalues-and-eigenvectors",
    diagonalization: "diagonalization",
    geometric: "geometric-transformations",
  },
  orthogonality: {
    projection: "orthogonal-sets-and-projections",
    "orthogonal-sets": "orthogonal-sets-and-projections",
    "gram-schmidt": "the-gram-schmidt-process",
    "least-squares": "least-squares-problems",
  },
  "symmetric-matrices": {
    spectral: "the-spectral-theorem",
    "quadratic-forms": "quadratic-forms",
    svd: "singular-value-decomposition",
    pca: "principal-component-analysis",
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
  if (!anchor) return `/linear-algebra/modules/${topicId}`;
  return `/linear-algebra/modules/${topicId}#${anchor}`;
}
