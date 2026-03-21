import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const hypothesisTestingProblems: Problem[] = [
  p({ id: "hyp-pval-1", topicId: "hypothesis-testing", section: "p-value", type: "mcq", difficulty: "easy",
    prompt: "At a significance level of $\\alpha = 0.05$, a test yields a $p$-value of $0.03$. The correct decision is to:",
    answer: "Reject $H_0$",
    choices: ["Reject $H_0$", "Fail to reject $H_0$", "Accept $H_0$", "Accept $H_a$"],
    explanation: "Step 1: If $p \\leq \\alpha$, we reject $H_0$. Step 2: $0.03 < 0.05$, so we reject $H_0$. Note: we never 'accept' $H_0$ or $H_a$; we only reject or fail to reject. Final answer: Reject $H_0$." }),
  p({ id: "hyp-type1-1", topicId: "hypothesis-testing", section: "errors", type: "mcq", difficulty: "easy",
    prompt: "A Type I error occurs when we:",
    answer: "Reject $H_0$ when $H_0$ is true",
    choices: [
      "Reject $H_0$ when $H_0$ is true",
      "Fail to reject $H_0$ when $H_0$ is false",
      "Reject $H_a$ when $H_a$ is true",
      "Accept $H_0$ when $H_a$ is true",
    ],
    explanation: "Step 1: A Type I error is a false positive — rejecting the null hypothesis when it is actually true. Step 2: Its probability is controlled by the significance level $\\alpha$. Final answer: Reject $H_0$ when $H_0$ is true." }),
  p({ id: "hyp-tstat-1", topicId: "hypothesis-testing", section: "t-test", type: "numeric", difficulty: "medium",
    prompt: "A one-sample $t$-test has $\\bar{x} = 52$, $\\mu_0 = 50$, $s = 4$, $n = 16$. What is the $t$-statistic?",
    answer: "2",
    explanation: "Step 1: $t = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}}$. Step 2: $SE = 4/\\sqrt{16} = 4/4 = 1$. Step 3: $t = (52 - 50)/1 = 2$. Final answer: $2$." }),
];
