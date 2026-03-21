import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const symmetricMatrixProblems: Problem[] = [
  p({ id: "sym-check-1", topicId: "symmetric-matrices", section: "spectral", type: "mcq", difficulty: "easy",
    prompt: "All eigenvalues of a real symmetric matrix are:",
    answer: "Real",
    choices: ["Real", "Positive", "Distinct", "Equal to 1"],
    explanation: "Step 1: The Spectral Theorem guarantees that every real symmetric matrix has real eigenvalues and an orthonormal basis of eigenvectors. Step 2: Eigenvalues are not necessarily positive or distinct. Final answer: Real." }),
  p({ id: "sym-svd-1", topicId: "symmetric-matrices", section: "svd", type: "mcq", difficulty: "hard",
    prompt: "In the Singular Value Decomposition $A = U\\Sigma V^T$, the singular values in $\\Sigma$ are:",
    answer: "The square roots of the eigenvalues of $A^T A$",
    choices: [
      "The square roots of the eigenvalues of $A^T A$",
      "The eigenvalues of $A$",
      "The diagonal entries of $A$",
      "The columns of $U$",
    ],
    explanation: "Step 1: The singular values $\\sigma_i = \\sqrt{\\lambda_i}$ where $\\lambda_i$ are the eigenvalues of $A^T A$. Step 2: They are always nonnegative. Final answer: The square roots of the eigenvalues of $A^T A$." }),
  p({ id: "sym-quadform-1", topicId: "symmetric-matrices", section: "quadratic-forms", type: "mcq", difficulty: "medium",
    prompt: "A quadratic form $Q(\\mathbf{x}) = \\mathbf{x}^T A \\mathbf{x}$ is positive definite if:",
    answer: "All eigenvalues of $A$ are positive",
    choices: [
      "All eigenvalues of $A$ are positive",
      "$\\det(A) > 0$",
      "$A$ is invertible",
      "All entries of $A$ are positive",
    ],
    explanation: "Step 1: A symmetric matrix $A$ is positive definite iff $Q(\\mathbf{x}) > 0$ for all $\\mathbf{x} \\neq \\mathbf{0}$. Step 2: This is equivalent to all eigenvalues of $A$ being strictly positive. Final answer: All eigenvalues of $A$ are positive." }),
];
