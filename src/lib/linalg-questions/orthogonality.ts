import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const orthogonalityProblems: Problem[] = [
  p({ id: "orth-proj-1", topicId: "orthogonality", section: "projection", type: "numeric", difficulty: "easy",
    prompt: "Find the scalar projection of $\\mathbf{u} = \\langle 3, 4 \\rangle$ onto $\\mathbf{v} = \\langle 1, 0 \\rangle$.",
    answer: "3",
    explanation: "Step 1: Scalar projection $= \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{\\|\\mathbf{v}\\|}$. Step 2: $\\mathbf{u}\\cdot\\mathbf{v} = 3(1)+4(0)=3$. Step 3: $\\|\\mathbf{v}\\|=1$. Step 4: Projection $= 3/1 = 3$. Final answer: $3$." }),
  p({ id: "orth-check-1", topicId: "orthogonality", section: "orthogonal-sets", type: "mcq", difficulty: "easy",
    prompt: "An orthogonal set of nonzero vectors is always:",
    answer: "Linearly independent",
    choices: ["Linearly independent", "Linearly dependent", "A basis for $\\mathbb{R}^n$", "Orthonormal"],
    explanation: "Step 1: An orthogonal set of nonzero vectors is always linearly independent — you cannot express any vector in the set as a linear combination of the others when all dot products are zero. Step 2: It is not necessarily orthonormal (vectors may not be unit length) or a full basis. Final answer: Linearly independent." }),
  p({ id: "orth-least-squares-1", topicId: "orthogonality", section: "least-squares", type: "mcq", difficulty: "medium",
    prompt: "The least-squares solution to $A\\mathbf{x} = \\mathbf{b}$ minimizes:",
    answer: "$\\|A\\mathbf{x} - \\mathbf{b}\\|^2$",
    choices: ["$\\|A\\mathbf{x} - \\mathbf{b}\\|^2$", "$\\|A\\mathbf{x}\\|^2$", "$\\|\\mathbf{b}\\|^2$", "$\\det(A)$"],
    explanation: "Step 1: The least-squares solution finds $\\hat{\\mathbf{x}}$ that minimizes the squared residual $\\|A\\mathbf{x}-\\mathbf{b}\\|^2$. Step 2: This is equivalent to projecting $\\mathbf{b}$ onto the column space of $A$. Final answer: $\\|A\\mathbf{x} - \\mathbf{b}\\|^2$." }),
];
