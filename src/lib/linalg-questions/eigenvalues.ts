import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const eigenvalueProblems: Problem[] = [
  p({ id: "eig-char-1", topicId: "eigenvalues", section: "characteristic", type: "numeric", difficulty: "medium",
    prompt: "Find the larger eigenvalue of $A = \\begin{pmatrix} 4 & 1 \\\\ 0 & 3 \\end{pmatrix}$.",
    answer: "4",
    explanation: "Step 1: Compute $\\det(A - \\lambda I) = (4-\\lambda)(3-\\lambda) - 0 = 0$. Step 2: $(4-\\lambda)(3-\\lambda)=0$ gives $\\lambda=4$ or $\\lambda=3$. Step 3: The larger eigenvalue is $4$. Final answer: $4$." }),
  p({ id: "eig-eigvec-1", topicId: "eigenvalues", section: "eigenvectors", type: "mcq", difficulty: "medium",
    prompt: "If $A\\mathbf{v} = 5\\mathbf{v}$ and $\\mathbf{v} \\neq \\mathbf{0}$, then $\\mathbf{v}$ is called an:",
    answer: "Eigenvector of $A$ with eigenvalue $5$",
    choices: [
      "Eigenvector of $A$ with eigenvalue $5$",
      "Null vector of $A$",
      "Column vector of $A$ scaled by $5$",
      "Unit vector of $A$",
    ],
    explanation: "Step 1: By definition, a nonzero vector $\\mathbf{v}$ satisfying $A\\mathbf{v} = \\lambda\\mathbf{v}$ is an eigenvector of $A$ with eigenvalue $\\lambda$. Step 2: Here $\\lambda = 5$. Final answer: Eigenvector of $A$ with eigenvalue $5$." }),
  p({ id: "eig-diag-1", topicId: "eigenvalues", section: "diagonalization", type: "mcq", difficulty: "hard",
    prompt: "An $n\\times n$ matrix $A$ is diagonalizable if and only if it has:",
    answer: "$n$ linearly independent eigenvectors",
    choices: [
      "$n$ linearly independent eigenvectors",
      "$n$ distinct eigenvalues",
      "All positive eigenvalues",
      "A nonzero determinant",
    ],
    explanation: "Step 1: $A$ is diagonalizable iff it has $n$ linearly independent eigenvectors — then $A = PDP^{-1}$. Step 2: Note that $n$ distinct eigenvalues is a sufficient but not necessary condition. Final answer: $n$ linearly independent eigenvectors." }),
  p({ id: "eig-trace-1", topicId: "eigenvalues", section: "characteristic", type: "numeric", difficulty: "easy",
    prompt: "A $2\\times 2$ matrix has eigenvalues $\\lambda_1 = 2$ and $\\lambda_2 = -3$. What is its trace?",
    answer: "-1",
    explanation: "Step 1: The trace of a matrix equals the sum of its eigenvalues. Step 2: $\\text{tr}(A) = 2 + (-3) = -1$. Final answer: $-1$." }),
];
