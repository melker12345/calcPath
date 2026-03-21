import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const continuousDistributionProblems: Problem[] = [
  p({ id: "cont-zscore-1", topicId: "continuous-distributions", section: "normal", type: "numeric", difficulty: "easy",
    prompt: "A dataset has mean $\\mu = 50$ and standard deviation $\\sigma = 10$. What is the $z$-score for $x = 65$?",
    answer: "1.5",
    explanation: "Step 1: $z = \\frac{x - \\mu}{\\sigma}$. Step 2: $z = \\frac{65 - 50}{10} = \\frac{15}{10} = 1.5$. Final answer: $1.5$." }),
  p({ id: "cont-empirical-1", topicId: "continuous-distributions", section: "normal", type: "mcq", difficulty: "easy",
    prompt: "According to the empirical rule, approximately what percentage of data falls within $\\pm 2$ standard deviations of the mean in a normal distribution?",
    answer: "95%",
    choices: ["68%", "95%", "99.7%", "50%"],
    explanation: "Step 1: The empirical (68-95-99.7) rule states: $\\approx 68\\%$ within $\\pm 1\\sigma$, $\\approx 95\\%$ within $\\pm 2\\sigma$, $\\approx 99.7\\%$ within $\\pm 3\\sigma$. Step 2: For $\\pm 2\\sigma$, the answer is $95\\%$. Final answer: $95\\%$." }),
  p({ id: "cont-exp-1", topicId: "continuous-distributions", section: "exponential", type: "numeric", difficulty: "medium",
    prompt: "An exponential distribution has rate parameter $\\lambda = 2$. What is the mean of this distribution?",
    answer: "0.5",
    explanation: "Step 1: For an exponential distribution with rate $\\lambda$, the mean is $E(X) = \\frac{1}{\\lambda}$. Step 2: $E(X) = \\frac{1}{2} = 0.5$. Final answer: $0.5$." }),
  p({ id: "cont-normal-std-1", topicId: "continuous-distributions", section: "normal", type: "mcq", difficulty: "easy",
    prompt: "The standard normal distribution has mean $\\mu$ and standard deviation $\\sigma$ equal to:",
    answer: "$\\mu = 0$, $\\sigma = 1$",
    choices: ["$\\mu = 0$, $\\sigma = 1$", "$\\mu = 1$, $\\sigma = 0$", "$\\mu = 0$, $\\sigma = 0$", "$\\mu = 1$, $\\sigma = 1$"],
    explanation: "Step 1: By definition, the standard normal distribution $Z \\sim N(0,1)$ has mean $0$ and standard deviation $1$. Step 2: Any $X \\sim N(\\mu,\\sigma^2)$ can be standardized via $Z = (X-\\mu)/\\sigma$. Final answer: $\\mu = 0$, $\\sigma = 1$." }),
];
