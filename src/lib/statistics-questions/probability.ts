import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const probabilityProblems: Problem[] = [
  p({ id: "prob-basic-1", topicId: "probability", section: "basic", type: "numeric", difficulty: "easy",
    prompt: "A fair die is rolled. What is the probability of getting a number greater than $4$? Express as a decimal.",
    answer: "0.333",
    explanation: "Step 1: Favorable outcomes are $\\{5, 6\\}$, so there are $2$ favorable outcomes. Step 2: Total outcomes $= 6$. Step 3: $P = 2/6 = 1/3 \\approx 0.333$. Final answer: $0.333$." }),
  p({ id: "prob-complement-1", topicId: "probability", section: "basic", type: "numeric", difficulty: "easy",
    prompt: "If $P(A) = 0.3$, what is $P(A^c)$?",
    answer: "0.7",
    explanation: "Step 1: The complement rule states $P(A^c) = 1 - P(A)$. Step 2: $P(A^c) = 1 - 0.3 = 0.7$. Final answer: $0.7$." }),
  p({ id: "prob-independent-1", topicId: "probability", section: "conditional", type: "numeric", difficulty: "medium",
    prompt: "Two independent events have $P(A) = 0.4$ and $P(B) = 0.5$. Find $P(A \\cap B)$.",
    answer: "0.2",
    explanation: "Step 1: For independent events, $P(A \\cap B) = P(A) \\cdot P(B)$. Step 2: $0.4 \\times 0.5 = 0.2$. Final answer: $0.2$." }),
  p({ id: "prob-bayes-1", topicId: "probability", section: "conditional", type: "mcq", difficulty: "medium",
    prompt: "If $P(A|B) = 0.6$, $P(B) = 0.5$, and $P(A) = 0.4$, what is $P(B|A)$?",
    answer: "0.75",
    choices: ["$0.48$", "$0.60$", "$0.75$", "$0.80$"],
    explanation: "Step 1: By Bayes' theorem: $P(B|A) = \\frac{P(A|B) \\cdot P(B)}{P(A)}$. Step 2: $= \\frac{0.6 \\times 0.5}{0.4} = \\frac{0.3}{0.4} = 0.75$. Final answer: $0.75$." }),
  p({ id: "prob-counting-1", topicId: "probability", section: "counting", type: "numeric", difficulty: "easy",
    prompt: "How many ways can you arrange $3$ books on a shelf?",
    answer: "6",
    explanation: "Step 1: This is a permutation of $3$ items. Step 2: $3! = 3 \\times 2 \\times 1 = 6$. Final answer: $6$." }),
];
