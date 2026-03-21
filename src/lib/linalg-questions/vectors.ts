import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const vectorProblems: Problem[] = [
  p({ id: "vec-add-1", topicId: "vectors", section: "operations", type: "numeric", difficulty: "easy",
    prompt: "Let $\\mathbf{u} = \\langle 2, 3 \\rangle$ and $\\mathbf{v} = \\langle 1, -1 \\rangle$. What is the first component of $\\mathbf{u} + \\mathbf{v}$?",
    answer: "3",
    explanation: "Step 1: Add component-wise: $\\mathbf{u} + \\mathbf{v} = \\langle 2+1, 3+(-1) \\rangle = \\langle 3, 2 \\rangle$. Step 2: The first component is $3$. Final answer: $3$." }),
  p({ id: "vec-scalar-1", topicId: "vectors", section: "operations", type: "numeric", difficulty: "easy",
    prompt: "If $\\mathbf{v} = \\langle 4, -2 \\rangle$, what is the second component of $3\\mathbf{v}$?",
    answer: "-6",
    explanation: "Step 1: Scalar multiplication: $3\\mathbf{v} = \\langle 3(4), 3(-2) \\rangle = \\langle 12, -6 \\rangle$. Step 2: The second component is $-6$. Final answer: $-6$." }),
  p({ id: "vec-dot-1", topicId: "vectors", section: "dot", type: "numeric", difficulty: "easy",
    prompt: "Compute the dot product: $\\langle 1, 2, 3 \\rangle \\cdot \\langle 4, -1, 2 \\rangle$",
    answer: "8",
    explanation: "Step 1: $\\mathbf{u} \\cdot \\mathbf{v} = (1)(4) + (2)(-1) + (3)(2)$. Step 2: $= 4 - 2 + 6 = 8$. Final answer: $8$." }),
  p({ id: "vec-magnitude-1", topicId: "vectors", section: "operations", type: "numeric", difficulty: "easy",
    prompt: "Find $\\|\\mathbf{v}\\|$ for $\\mathbf{v} = \\langle 3, 4 \\rangle$.",
    answer: "5",
    explanation: "Step 1: $\\|\\mathbf{v}\\| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25}$. Step 2: $= 5$. Final answer: $5$." }),
  p({ id: "vec-orthogonal-1", topicId: "vectors", section: "dot", type: "mcq", difficulty: "medium",
    prompt: "Are $\\langle 2, -3 \\rangle$ and $\\langle 3, 2 \\rangle$ orthogonal?",
    answer: "Yes, because their dot product is zero.",
    choices: [
      "No, because they have different magnitudes.",
      "Yes, because their dot product is zero.",
      "No, because they point in different directions.",
      "Yes, because they are unit vectors.",
    ],
    explanation: "Step 1: Compute the dot product: $(2)(3) + (-3)(2) = 6 - 6 = 0$. Step 2: Two vectors are orthogonal if and only if their dot product is zero. Final answer: Yes, because their dot product is zero." }),
];
