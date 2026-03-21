import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const matrixProblems: Problem[] = [
  p({ id: "mat-add-1", topicId: "matrices", section: "operations", type: "numeric", difficulty: "easy",
    prompt: "Let $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ and $B = \\begin{pmatrix} 5 & 6 \\\\ 7 & 8 \\end{pmatrix}$. What is the $(1,1)$ entry of $A + B$?",
    answer: "6",
    explanation: "Step 1: Add corresponding entries: $(A+B)_{11} = 1 + 5 = 6$. Final answer: $6$." }),
  p({ id: "mat-mult-1", topicId: "matrices", section: "multiplication", type: "numeric", difficulty: "medium",
    prompt: "Let $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ and $B = \\begin{pmatrix} 2 & 0 \\\\ 1 & 3 \\end{pmatrix}$. What is the $(1,1)$ entry of $AB$?",
    answer: "4",
    explanation: "Step 1: $(AB)_{11} = (\\text{row 1 of } A) \\cdot (\\text{col 1 of } B)$. Step 2: $= (1)(2) + (2)(1) = 2 + 2 = 4$. Final answer: $4$." }),
  p({ id: "mat-det-1", topicId: "matrices", section: "determinant", type: "numeric", difficulty: "easy",
    prompt: "Find the determinant of $A = \\begin{pmatrix} 3 & 1 \\\\ 2 & 5 \\end{pmatrix}$.",
    answer: "13",
    explanation: "Step 1: For a $2 \\times 2$ matrix, $\\det(A) = ad - bc$. Step 2: $= (3)(5) - (1)(2) = 15 - 2 = 13$. Final answer: $13$." }),
  p({ id: "mat-transpose-1", topicId: "matrices", section: "operations", type: "numeric", difficulty: "easy",
    prompt: "Let $A = \\begin{pmatrix} 1 & 4 \\\\ 2 & 5 \\\\ 3 & 6 \\end{pmatrix}$. What is the $(2,1)$ entry of $A^T$?",
    answer: "4",
    explanation: "Step 1: The transpose swaps rows and columns: $(A^T)_{ij} = A_{ji}$. Step 2: $(A^T)_{21} = A_{12} = 4$. Final answer: $4$." }),
  p({ id: "mat-inverse-1", topicId: "matrices", section: "determinant", type: "mcq", difficulty: "medium",
    prompt: "A matrix $A$ is invertible if and only if:",
    answer: "$\\det(A) \\neq 0$",
    choices: [
      "$\\det(A) = 0$",
      "$\\det(A) \\neq 0$",
      "$A$ is symmetric",
      "$A$ has all positive entries",
    ],
    explanation: "Step 1: A square matrix is invertible (nonsingular) if and only if its determinant is nonzero. Step 2: When $\\det(A) = 0$, the matrix is singular and has no inverse. Final answer: $\\det(A) \\neq 0$." }),
];
