import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const transformationProblems: Problem[] = [
  p({ id: "trans-apply-1", topicId: "transformations", section: "definition", type: "numeric", difficulty: "easy",
    prompt: "The linear transformation $T(\\mathbf{x}) = A\\mathbf{x}$ with $A = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}$. What is the first component of $T(\\langle 4, 1 \\rangle)$?",
    answer: "8",
    explanation: "Step 1: $T(\\langle 4,1 \\rangle) = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix} \\begin{pmatrix} 4 \\\\ 1 \\end{pmatrix} = \\begin{pmatrix} 8 \\\\ 3 \\end{pmatrix}$. Step 2: The first component is $8$. Final answer: $8$." }),
  p({ id: "trans-eigen-1", topicId: "transformations", section: "matrix-representation", type: "numeric", difficulty: "medium",
    prompt: "Find the sum of the eigenvalues of $A = \\begin{pmatrix} 4 & 1 \\\\ 0 & 3 \\end{pmatrix}$.",
    answer: "7",
    explanation: "Step 1: The sum of eigenvalues equals the trace of the matrix. Step 2: $\\text{tr}(A) = 4 + 3 = 7$. Final answer: $7$." }),
  p({ id: "trans-eigen-2", topicId: "transformations", section: "matrix-representation", type: "numeric", difficulty: "medium",
    prompt: "Find the product of the eigenvalues of $A = \\begin{pmatrix} 4 & 1 \\\\ 0 & 3 \\end{pmatrix}$.",
    answer: "12",
    explanation: "Step 1: The product of eigenvalues equals the determinant. Step 2: $\\det(A) = (4)(3) - (1)(0) = 12$. Final answer: $12$." }),
  p({ id: "trans-rotation-1", topicId: "transformations", section: "definition", type: "mcq", difficulty: "medium",
    prompt: "A $90°$ counterclockwise rotation in $\\mathbb{R}^2$ maps $\\langle 1, 0 \\rangle$ to:",
    answer: "$\\langle 0, 1 \\rangle$",
    choices: [
      "$\\langle 1, 0 \\rangle$",
      "$\\langle 0, 1 \\rangle$",
      "$\\langle -1, 0 \\rangle$",
      "$\\langle 0, -1 \\rangle$",
    ],
    explanation: "Step 1: The rotation matrix for $90°$ is $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$. Step 2: $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix} \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix} = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$. Final answer: $\\langle 0, 1 \\rangle$." }),
  p({ id: "trans-kernel-1", topicId: "transformations", section: "definition", type: "mcq", difficulty: "easy",
    prompt: "A linear transformation $T$ is one-to-one (injective) if and only if:",
    answer: "Its kernel contains only the zero vector.",
    choices: [
      "It is represented by a square matrix.",
      "Its kernel contains only the zero vector.",
      "It maps every vector to zero.",
      "Its matrix has all positive entries.",
    ],
    explanation: "Step 1: $T$ is injective iff $T(\\mathbf{x}) = \\mathbf{0}$ implies $\\mathbf{x} = \\mathbf{0}$. Step 2: This is equivalent to $\\ker(T) = \\{\\mathbf{0}\\}$. Final answer: Its kernel contains only the zero vector." }),

  // === More questions for Linear Transformations ===

  // definition
  p({ id: "trans-def-2", topicId: "transformations", section: "definition", type: "mcq", difficulty: "easy",
    prompt: "Which of the following is a linear transformation from $\\mathbb{R}^2$ to $\\mathbb{R}^2$?",
    answer: "$T(x,y) = (2x, 3y)$",
    choices: [
      "$T(x,y) = (2x, 3y)$",
      "$T(x,y) = (x+1, y)$",
      "$T(x,y) = (x^2, y)$",
      "$T(x,y) = (x+y, 1)$",
    ],
    explanation: "Step 1: Check $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$ and $T(c\\mathbf{v}) = cT(\\mathbf{v})$. Only the first option satisfies both. Final answer: $T(x,y) = (2x, 3y)$." }),

  p({ id: "trans-def-3", topicId: "transformations", section: "definition", type: "numeric", difficulty: "medium",
    prompt: "Let $T: \\mathbb{R}^3 \\to \\mathbb{R}^2$ be defined by $T(x,y,z) = (x+y, y-z)$. Compute $T(1,2,-1)$.",
    answer: "(3, 3)",
    explanation: "Step 1: $T(1,2,-1) = (1+2, 2-(-1)) = (3, 3)$. Final answer: (3, 3)." }),

  // kernel-image
  p({ id: "trans-ki-1", topicId: "transformations", section: "kernel-image", type: "mcq", difficulty: "easy",
    prompt: "For a linear transformation $T: \\mathbb{R}^n \\to \\mathbb{R}^m$, the kernel of $T$ is a subspace of:",
    answer: "$\\mathbb{R}^n$",
    choices: ["$\\mathbb{R}^n$", "$\\mathbb{R}^m$", "Both", "Neither"],
    explanation: "Step 1: The kernel is the set of vectors in the domain that map to zero. Final answer: $\\mathbb{R}^n$." }),

  p({ id: "trans-ki-2", topicId: "transformations", section: "kernel-image", type: "numeric", difficulty: "medium",
    prompt: "Let $T(\\mathbf{x}) = A\\mathbf{x}$ where $A = \\begin{pmatrix} 1 & 2 \\\\ 2 & 4 \\end{pmatrix}$. What is the dimension of the kernel of $T$?",
    answer: "1",
    explanation: "Step 1: Row reduce A to find free variables. The second column is a multiple of the first. One free variable → dim(ker) = 1. Final answer: 1." }),

  p({ id: "trans-ki-3", topicId: "transformations", section: "kernel-image", type: "numeric", difficulty: "hard",
    prompt: "A linear transformation $T: \\mathbb{R}^5 \\to \\mathbb{R}^3$ has rank 2. What is the dimension of the kernel?",
    answer: "3",
    explanation: "Step 1: By rank-nullity theorem: dim(ker(T)) = dim(domain) - rank(T) = 5 - 2 = 3. Final answer: 3." }),

  // matrix-representation
  p({ id: "trans-mr-1", topicId: "transformations", section: "matrix-representation", type: "numeric", difficulty: "easy",
    prompt: "The linear transformation $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ given by $T(x,y) = (x, 0)$ (projection onto x-axis). What is its standard matrix?",
    answer: "[[1,0],[0,0]]",
    explanation: "Step 1: T(1,0) = (1,0), T(0,1) = (0,0). Columns are [1,0] and [0,0]. Final answer: [[1,0],[0,0]]." }),

  p({ id: "trans-mr-2", topicId: "transformations", section: "matrix-representation", type: "mcq", difficulty: "medium",
    prompt: "The standard matrix of a 90° clockwise rotation in $\\mathbb{R}^2$ is:",
    answer: "[[0,1],[-1,0]]",
    choices: [
      "[[0,1],[-1,0]]",
      "[[0,-1],[1,0]]",
      "[[1,0],[0,-1]]",
      "[[-1,0],[0,1]]",
    ],
    explanation: "Step 1: 90° clockwise sends (1,0) to (0,-1) and (0,1) to (1,0). Matrix columns: [0,1] and [-1,0]. Final answer: [[0,1],[-1,0]]." }),

  p({ id: "trans-mr-3", topicId: "transformations", section: "matrix-representation", type: "numeric", difficulty: "hard",
    prompt: "Let $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ be the linear transformation that reflects across the line y = x. Find the standard matrix of T.",
    answer: "[[0,1],[1,0]]",
    explanation: "Step 1: T(1,0) = (0,1), T(0,1) = (1,0). The matrix is the swap matrix [[0,1],[1,0]]. Final answer: [[0,1],[1,0]]." }),

  // change-of-basis
  p({ id: "trans-cob-1", topicId: "transformations", section: "change-of-basis", type: "mcq", difficulty: "medium",
    prompt: "If P is the change-of-basis matrix from basis B to the standard basis, then the coordinates of v in basis B are given by:",
    answer: "P^{-1} v",
    choices: ["P v", "P^{-1} v", "P^T v", "v P"],
    explanation: "Step 1: Standard coordinates = P * B-coordinates. Therefore B-coordinates = P^{-1} * standard. Final answer: P^{-1} v." }),

  p({ id: "trans-cob-2", topicId: "transformations", section: "change-of-basis", type: "numeric", difficulty: "hard",
    prompt: "Let B = {(1,1), (1,-1)} be a basis for $\\mathbb{R}^2$. Find the B-coordinates of the vector (3,1).",
    answer: "[2,1]",
    explanation: "Step 1: Solve c1(1,1) + c2(1,-1) = (3,1). This gives the system c1 + c2 = 3, c1 - c2 = 1. Adding: 2c1 = 4 → c1=2. Then c2=1. Final answer: [2,1]." }),

  // composition
  p({ id: "trans-comp-1", topicId: "transformations", section: "composition", type: "numeric", difficulty: "easy",
    prompt: "Let T(x) = 2x and S(x) = x + 1 (on $\\mathbb{R}$). What is (S ∘ T)(3)?",
    answer: "7",
    explanation: "Step 1: T(3)=6. S(6)=7. Final answer: 7." }),

  p({ id: "trans-comp-2", topicId: "transformations", section: "composition", type: "mcq", difficulty: "medium",
    prompt: "If T and S are invertible linear transformations, which of the following is always true?",
    answer: "(S ∘ T)^{-1} = T^{-1} ∘ S^{-1}",
    choices: [
      "(S ∘ T)^{-1} = T^{-1} ∘ S^{-1}",
      "(S ∘ T)^{-1} = S^{-1} ∘ T^{-1}",
      "(S ∘ T)^{-1} = S ∘ T^{-1}",
      "None of the above",
    ],
    explanation: "Step 1: Composition reverses under inversion. (S ∘ T)^{-1} = T^{-1} ∘ S^{-1}. Final answer: (S ∘ T)^{-1} = T^{-1} ∘ S^{-1}." }),

  p({ id: "trans-comp-3", topicId: "transformations", section: "composition", type: "numeric", difficulty: "hard",
    prompt: "Let T be rotation by 90° counterclockwise and S be scaling by 2. What is the matrix of S ∘ T (standard basis)?",
    answer: "[[0,-2],[2,0]]",
    explanation: "Step 1: Rotation matrix R = [[0,-1],[1,0]]. Scaling S = 2I. S∘T has matrix (2I)R = [[0,-2],[2,0]]. Final answer: [[0,-2],[2,0]]." }),
];
