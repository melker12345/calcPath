import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const discreteDistributionProblems: Problem[] = [
  p({ id: "disc-ev-1", topicId: "discrete-distributions", section: "expected-value", type: "numeric", difficulty: "easy",
    prompt: "A fair die is rolled. What is the expected value $E(X)$?",
    answer: "3.5",
    explanation: "Step 1: $E(X) = \\sum x_i P(X=x_i) = 1(\\tfrac{1}{6})+2(\\tfrac{1}{6})+3(\\tfrac{1}{6})+4(\\tfrac{1}{6})+5(\\tfrac{1}{6})+6(\\tfrac{1}{6})$. Step 2: $= \\tfrac{21}{6} = 3.5$. Final answer: $3.5$." }),
  p({ id: "disc-binom-1", topicId: "discrete-distributions", section: "binomial", type: "numeric", difficulty: "medium",
    prompt: "A fair coin is flipped $4$ times. What is the probability of exactly $2$ heads? (Round to 4 decimal places)",
    answer: "0.375",
    explanation: "Step 1: Use $P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}$ with $n=4$, $k=2$, $p=0.5$. Step 2: $\\binom{4}{2}=6$. Step 3: $P(X=2)=6(0.5)^2(0.5)^2=6(0.0625)=0.375$. Final answer: $0.375$." }),
  p({ id: "disc-poisson-1", topicId: "discrete-distributions", section: "poisson", type: "numeric", difficulty: "medium",
    prompt: "A Poisson random variable has $\\lambda = 3$. What is its variance?",
    answer: "3",
    explanation: "Step 1: For a Poisson distribution with rate $\\lambda$, both the mean and variance equal $\\lambda$. Step 2: Variance $= \\lambda = 3$. Final answer: $3$." }),
  p({ id: "disc-binom-mean-1", topicId: "discrete-distributions", section: "binomial", type: "numeric", difficulty: "easy",
    prompt: "A binomial random variable has $n = 20$ trials and success probability $p = 0.4$. What is the mean?",
    answer: "8",
    explanation: "Step 1: The mean of a binomial distribution is $\\mu = np$. Step 2: $\\mu = 20 \\times 0.4 = 8$. Final answer: $8$." }),
];
