import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const transformationProblems: Problem[] = [
  p({ id: "trans-apply-1", topicId: "spaces", section: "linear-transformations", type: "numeric", difficulty: "easy",
    prompt: "The linear transformation $T(\\mathbf{x}) = A\\mathbf{x}$ with $A = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}$. What is the first component of $T(\\langle 4, 1 \\rangle)$?",
    answer: "8",
    explanation: "Step 1: $T(\\langle 4,1 \\rangle) = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix} \\begin{pmatrix} 4 \\\\ 1 \\end{pmatrix} = \\begin{pmatrix} 8 \\\\ 3 \\end{pmatrix}$. Step 2: The first component is $8$. Final answer: $8$." }),
  p({ id: "trans-eigen-1", topicId: "eigenvalues", section: "diagonalization", type: "numeric", difficulty: "medium",
    prompt: "Find the sum of the eigenvalues of $A = \\begin{pmatrix} 4 & 1 \\\\ 0 & 3 \\end{pmatrix}$.",
    answer: "7",
    explanation: "Step 1: The sum of eigenvalues equals the trace of the matrix. Step 2: $\\text{tr}(A) = 4 + 3 = 7$. Final answer: $7$." }),
  p({ id: "trans-eigen-2", topicId: "eigenvalues", section: "diagonalization", type: "numeric", difficulty: "medium",
    prompt: "Find the product of the eigenvalues of $A = \\begin{pmatrix} 4 & 1 \\\\ 0 & 3 \\end{pmatrix}$.",
    answer: "12",
    explanation: "Step 1: The product of eigenvalues equals the determinant. Step 2: $\\det(A) = (4)(3) - (1)(0) = 12$. Final answer: $12$." }),
  p({ id: "trans-rotation-1", topicId: "spaces", section: "linear-transformations", type: "mcq", difficulty: "medium",
    prompt: "A $90°$ counterclockwise rotation in $\\mathbb{R}^2$ maps $\\langle 1, 0 \\rangle$ to:",
    answer: "$\\langle 0, 1 \\rangle$",
    choices: [
      "$\\langle 1, 0 \\rangle$",
      "$\\langle 0, 1 \\rangle$",
      "$\\langle -1, 0 \\rangle$",
      "$\\langle 0, -1 \\rangle$",
    ],
    explanation: "Step 1: The rotation matrix for $90°$ is $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$. Step 2: $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix} \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix} = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$. Final answer: $\\langle 0, 1 \\rangle$." }),
  p({ id: "trans-kernel-1", topicId: "spaces", section: "linear-transformations", type: "mcq", difficulty: "easy",
    prompt: "A linear transformation $T$ is one-to-one (injective) if and only if:",
    answer: "Its kernel contains only the zero vector.",
    choices: [
      "It is represented by a square matrix.",
      "Its kernel contains only the zero vector.",
      "It maps every vector to zero.",
      "Its matrix has all positive entries.",
    ],
    explanation: "Step 1: $T$ is injective iff $T(\\mathbf{x}) = \\mathbf{0}$ implies $\\mathbf{x} = \\mathbf{0}$. Step 2: This is equivalent to $\\ker(T) = \\{\\mathbf{0}\\}$. Final answer: Its kernel contains only the zero vector." }),
];
