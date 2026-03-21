import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const spaceProblems: Problem[] = [
  p({ id: "space-span-1", topicId: "spaces", section: "span", type: "mcq", difficulty: "easy",
    prompt: "The span of $\\{\\langle 1, 0 \\rangle, \\langle 0, 1 \\rangle\\}$ is:",
    answer: "All of $\\mathbb{R}^2$.",
    choices: [
      "A single point.",
      "A line through the origin.",
      "All of $\\mathbb{R}^2$.",
      "A plane in $\\mathbb{R}^3$.",
    ],
    explanation: "Step 1: Any vector $\\langle a, b \\rangle$ can be written as $a\\langle 1,0 \\rangle + b\\langle 0,1 \\rangle$. Step 2: These two vectors span all of $\\mathbb{R}^2$. Final answer: All of $\\mathbb{R}^2$." }),
  p({ id: "space-indep-1", topicId: "spaces", section: "independence", type: "mcq", difficulty: "medium",
    prompt: "Are $\\langle 1, 2 \\rangle$ and $\\langle 2, 4 \\rangle$ linearly independent?",
    answer: "No, because one is a scalar multiple of the other.",
    choices: [
      "Yes, because they are both nonzero.",
      "Yes, because they have different magnitudes.",
      "No, because one is a scalar multiple of the other.",
      "No, because their sum is zero.",
    ],
    explanation: "Step 1: $\\langle 2, 4 \\rangle = 2 \\langle 1, 2 \\rangle$. Step 2: Since one is a scalar multiple of the other, they are linearly dependent. Final answer: No, because one is a scalar multiple of the other." }),
  p({ id: "space-basis-1", topicId: "spaces", section: "basis", type: "numeric", difficulty: "easy",
    prompt: "What is the dimension of $\\mathbb{R}^3$?",
    answer: "3",
    explanation: "Step 1: The standard basis of $\\mathbb{R}^3$ is $\\{\\mathbf{e}_1, \\mathbf{e}_2, \\mathbf{e}_3\\}$, which has $3$ vectors. Step 2: The dimension equals the number of vectors in any basis. Final answer: $3$." }),
  p({ id: "space-null-1", topicId: "spaces", section: "subspaces", type: "mcq", difficulty: "medium",
    prompt: "The null space of a matrix $A$ is the set of all vectors $\\mathbf{x}$ such that:",
    answer: "$A\\mathbf{x} = \\mathbf{0}$.",
    choices: [
      "$A\\mathbf{x} = \\mathbf{x}$.",
      "$A\\mathbf{x} = \\mathbf{0}$.",
      "$\\mathbf{x}^T A = \\mathbf{0}$.",
      "$A + \\mathbf{x} = \\mathbf{0}$.",
    ],
    explanation: "Step 1: By definition, the null space (or kernel) of $A$ is $\\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$. Final answer: $A\\mathbf{x} = \\mathbf{0}$." }),
  p({ id: "space-dim-1", topicId: "spaces", section: "basis", type: "numeric", difficulty: "medium",
    prompt: "A $3 \\times 3$ matrix has rank $2$. What is the dimension of its null space?",
    answer: "1",
    explanation: "Step 1: By the rank-nullity theorem: $\\text{rank} + \\text{nullity} = n$ (number of columns). Step 2: $2 + \\text{nullity} = 3$, so nullity $= 1$. Final answer: $1$." }),
];
