import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const samplingProblems: Problem[] = [
  p({ id: "samp-clt-1", topicId: "sampling", section: "clt", type: "mcq", difficulty: "medium",
    prompt: "The Central Limit Theorem states that the sampling distribution of $\\bar{x}$ approaches a normal distribution as:",
    answer: "Sample size $n$ increases",
    choices: [
      "Sample size $n$ increases",
      "Population size $N$ increases",
      "The population becomes normal",
      "The variance decreases",
    ],
    explanation: "Step 1: The CLT applies as the sample size $n$ increases, regardless of the shape of the population distribution. Step 2: As a rule of thumb, $n \\geq 30$ is often sufficient. Final answer: Sample size $n$ increases." }),
  p({ id: "samp-se-1", topicId: "sampling", section: "sampling-distribution", type: "numeric", difficulty: "easy",
    prompt: "A population has standard deviation $\\sigma = 12$. What is the standard error of the mean for samples of size $n = 9$?",
    answer: "4",
    explanation: "Step 1: Standard error $SE = \\sigma / \\sqrt{n}$. Step 2: $SE = 12 / \\sqrt{9} = 12 / 3 = 4$. Final answer: $4$." }),
  p({ id: "samp-lln-1", topicId: "sampling", section: "lln", type: "mcq", difficulty: "easy",
    prompt: "The Law of Large Numbers states that as sample size increases, the sample mean:",
    answer: "Converges to the population mean",
    choices: [
      "Converges to the population mean",
      "Converges to zero",
      "Becomes more variable",
      "Equals the sample median",
    ],
    explanation: "Step 1: The Law of Large Numbers guarantees that $\\bar{x} \\to \\mu$ as $n \\to \\infty$. Step 2: This is the formal justification for using sample statistics to estimate population parameters. Final answer: Converges to the population mean." }),
];
