import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const estimationProblems: Problem[] = [
  p({ id: "est-ci-1", topicId: "estimation", section: "confidence-intervals", type: "numeric", difficulty: "medium",
    prompt: "A sample has $\\bar{x} = 80$, $s = 10$, $n = 100$. Using $z^* = 1.96$, what is the upper bound of the $95\\%$ confidence interval for $\\mu$?",
    answer: "81.96",
    explanation: "Step 1: $SE = s/\\sqrt{n} = 10/\\sqrt{100} = 1$. Step 2: Margin of error $= z^* \\cdot SE = 1.96 \\times 1 = 1.96$. Step 3: Upper bound $= \\bar{x} + 1.96 = 80 + 1.96 = 81.96$. Final answer: $81.96$." }),
  p({ id: "est-mle-1", topicId: "estimation", section: "mle", type: "mcq", difficulty: "medium",
    prompt: "The Maximum Likelihood Estimator (MLE) selects the parameter value that:",
    answer: "Maximizes the likelihood of observing the sample data",
    choices: [
      "Maximizes the likelihood of observing the sample data",
      "Minimizes the sample variance",
      "Equals the sample mean",
      "Minimizes the sum of squared residuals",
    ],
    explanation: "Step 1: MLE finds the parameter $\\hat{\\theta}$ that maximizes $L(\\theta) = P(\\text{data} | \\theta)$. Step 2: It is the most likely value of the parameter given what was observed. Final answer: Maximizes the likelihood of observing the sample data." }),
  p({ id: "est-t-vs-z-1", topicId: "estimation", section: "confidence-intervals", type: "mcq", difficulty: "easy",
    prompt: "When $\\sigma$ is unknown and $n$ is small, a confidence interval for $\\mu$ should use the:",
    answer: "$t$-distribution",
    choices: ["$t$-distribution", "$z$-distribution", "Chi-squared distribution", "F-distribution"],
    explanation: "Step 1: When the population standard deviation $\\sigma$ is unknown and replaced by the sample standard deviation $s$, we use the $t$-distribution with $n-1$ degrees of freedom. Step 2: The $t$-distribution has heavier tails than the normal, accounting for the extra uncertainty. Final answer: $t$-distribution." }),
];
