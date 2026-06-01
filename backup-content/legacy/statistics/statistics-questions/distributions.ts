import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const distributionProblems: Problem[] = [
  p({ id: "dist-binomial-1", topicId: "discrete-distributions", section: "binomial", type: "numeric", difficulty: "medium",
    prompt: "A coin is flipped $4$ times. What is the probability of exactly $2$ heads? Express as a decimal.",
    answer: "0.375",
    explanation: "Step 1: Use the binomial formula: $P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}$. Step 2: $\\binom{4}{2} = 6$, $p = 0.5$. Step 3: $P(X=2) = 6 \\times 0.5^2 \\times 0.5^2 = 6 \\times 0.0625 = 0.375$. Final answer: $0.375$." }),
  p({ id: "dist-normal-1", topicId: "continuous-distributions", section: "normal", type: "mcq", difficulty: "easy",
    prompt: "In a normal distribution, approximately what percentage of data falls within one standard deviation of the mean?",
    answer: "68%",
    choices: ["50%", "68%", "95%", "99.7%"],
    explanation: "Step 1: The empirical rule (68-95-99.7 rule) states that approximately $68\\%$ of data falls within $\\pm 1\\sigma$ of the mean. Final answer: $68\\%$." }),
  p({ id: "dist-zscore-1", topicId: "continuous-distributions", section: "normal", type: "numeric", difficulty: "easy",
    prompt: "A dataset has mean $\\mu = 50$ and standard deviation $\\sigma = 10$. What is the $z$-score of $x = 70$?",
    answer: "2",
    explanation: "Step 1: The $z$-score formula is $z = \\frac{x - \\mu}{\\sigma}$. Step 2: $z = \\frac{70 - 50}{10} = \\frac{20}{10} = 2$. Final answer: $2$." }),
  p({ id: "dist-expected-1", topicId: "discrete-distributions", section: "binomial", type: "numeric", difficulty: "easy",
    prompt: "A fair die is rolled $60$ times. What is the expected number of sixes?",
    answer: "10",
    explanation: "Step 1: $P(\\text{six}) = 1/6$. Step 2: Expected value $E(X) = n \\cdot p = 60 \\times 1/6 = 10$. Final answer: $10$." }),
  p({ id: "dist-poisson-1", topicId: "discrete-distributions", section: "poisson", type: "numeric", difficulty: "medium",
    prompt: "A call center receives an average of $3$ calls per minute. Using the Poisson distribution, what is $P(X = 0)$? Round to three decimals.",
    answer: "0.050",
    explanation: "Step 1: Poisson formula: $P(X=k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}$. Step 2: $P(X=0) = \\frac{e^{-3} \\cdot 3^0}{0!} = e^{-3} \\approx 0.0498$. Step 3: Rounded to three decimals: $0.050$. Final answer: $0.050$." }),
];
