import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const determinantProblems: Problem[] = [
  p({ id: "det-2x2-1", topicId: "determinants", section: "cofactor", type: "numeric", difficulty: "easy",
    prompt: "Compute $\\det\\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}$.",
    answer: "10",
    explanation: "Step 1: For a $2\\times 2$ matrix, $\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$. Step 2: $\\det = 3(4) - 2(1) = 12 - 2 = 10$. Final answer: $10$." }),
  p({ id: "det-singular-1", topicId: "determinants", section: "properties", type: "mcq", difficulty: "easy",
    prompt: "A matrix $A$ is invertible if and only if $\\det(A)$ is:",
    answer: "Nonzero",
    choices: ["Nonzero", "Zero", "Positive", "Equal to 1"],
    explanation: "Step 1: A square matrix is invertible (non-singular) if and only if its determinant is nonzero. Step 2: If $\\det(A) = 0$, the matrix is singular and has no inverse. Final answer: Nonzero." }),
  p({ id: "det-scale-1", topicId: "determinants", section: "properties", type: "numeric", difficulty: "medium",
    prompt: "If $\\det(A) = 5$ for a $3\\times 3$ matrix $A$, what is $\\det(2A)$?",
    answer: "40",
    explanation: "Step 1: For an $n\\times n$ matrix, $\\det(cA) = c^n \\det(A)$. Step 2: Here $n=3$ and $c=2$, so $\\det(2A) = 2^3 \\cdot 5 = 8 \\cdot 5 = 40$. Final answer: $40$." }),
];
