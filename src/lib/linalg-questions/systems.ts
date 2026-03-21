import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const systemProblems: Problem[] = [
  p({ id: "sys-2x2-1", topicId: "systems", section: "gauss", type: "numeric", difficulty: "easy",
    prompt: "Solve the system: $x + y = 5$ and $x - y = 1$. What is $x$?",
    answer: "3",
    explanation: "Step 1: Add the two equations: $2x = 6$, so $x = 3$. Step 2: Substitute back: $3 + y = 5$, so $y = 2$. Final answer: $3$." }),
  p({ id: "sys-2x2-2", topicId: "systems", section: "gauss", type: "numeric", difficulty: "easy",
    prompt: "Solve: $2x + 3y = 12$ and $x - y = 1$. What is $y$?",
    answer: "2",
    explanation: "Step 1: From the second equation, $x = y + 1$. Step 2: Substitute into the first: $2(y+1) + 3y = 12 \\Rightarrow 5y + 2 = 12 \\Rightarrow y = 2$. Final answer: $2$." }),
  p({ id: "sys-augmented-1", topicId: "systems", section: "gauss", type: "mcq", difficulty: "medium",
    prompt: "The augmented matrix $\\left(\\begin{array}{cc|c} 1 & 0 & 3 \\\\ 0 & 1 & -2 \\end{array}\\right)$ represents the solution:",
    answer: "$x = 3, y = -2$",
    choices: [
      "$x = 3, y = -2$",
      "$x = -2, y = 3$",
      "$x = 0, y = 0$",
      "The system has no solution.",
    ],
    explanation: "Step 1: The matrix is in reduced row echelon form. Step 2: Reading off: $1 \\cdot x + 0 \\cdot y = 3$ gives $x = 3$, and $0 \\cdot x + 1 \\cdot y = -2$ gives $y = -2$. Final answer: $x = 3, y = -2$." }),
  p({ id: "sys-nosol-1", topicId: "systems", section: "consistency", type: "mcq", difficulty: "medium",
    prompt: "The system $x + y = 3$ and $2x + 2y = 8$ has:",
    answer: "No solution (inconsistent).",
    choices: [
      "Exactly one solution.",
      "Infinitely many solutions.",
      "No solution (inconsistent).",
      "Exactly two solutions.",
    ],
    explanation: "Step 1: Multiply the first equation by $2$: $2x + 2y = 6$. Step 2: But the second equation says $2x + 2y = 8$. Step 3: $6 \\neq 8$, so the system is inconsistent. Final answer: No solution (inconsistent)." }),
  p({ id: "sys-rank-1", topicId: "systems", section: "consistency", type: "numeric", difficulty: "medium",
    prompt: "Find the rank of $A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 0 \\end{pmatrix}$.",
    answer: "2",
    explanation: "Step 1: The matrix is already in row echelon form. Step 2: Count the nonzero rows: rows 1 and 2 are nonzero. Step 3: Rank $= 2$. Final answer: $2$." }),
];
