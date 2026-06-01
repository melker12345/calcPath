import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const inferenceProblems: Problem[] = [
  p({ id: "inf-ci-1", topicId: "estimation", section: "confidence-intervals", type: "mcq", difficulty: "easy",
    prompt: "A $95\\%$ confidence interval means:",
    answer: "If we repeated the sampling many times, about 95% of the intervals would contain the true parameter.",
    choices: [
      "There is a 95% chance the true parameter is in this interval.",
      "If we repeated the sampling many times, about 95% of the intervals would contain the true parameter.",
      "95% of the data falls within this interval.",
      "The sample mean is within 5% of the true mean.",
    ],
    explanation: "Step 1: A confidence interval is a frequentist concept. Step 2: It means that if we repeated the experiment many times, $95\\%$ of the constructed intervals would capture the true population parameter. Final answer: If we repeated the sampling many times, about 95% of the intervals would contain the true parameter." }),
  p({ id: "inf-se-1", topicId: "estimation", section: "confidence-intervals", type: "numeric", difficulty: "medium",
    prompt: "A sample of $n = 100$ has standard deviation $s = 20$. What is the standard error of the mean?",
    answer: "2",
    explanation: "Step 1: The standard error is $SE = s / \\sqrt{n}$. Step 2: $SE = 20 / \\sqrt{100} = 20 / 10 = 2$. Final answer: $2$." }),
  p({ id: "inf-hyp-1", topicId: "hypothesis-testing", section: "p-value", type: "mcq", difficulty: "easy",
    prompt: "In hypothesis testing, a $p$-value of $0.03$ with significance level $\\alpha = 0.05$ means:",
    answer: "Reject the null hypothesis.",
    choices: [
      "Fail to reject the null hypothesis.",
      "Reject the null hypothesis.",
      "Accept the null hypothesis.",
      "The test is inconclusive.",
    ],
    explanation: "Step 1: Compare $p$-value to $\\alpha$. Step 2: Since $0.03 < 0.05$, we reject $H_0$. Final answer: Reject the null hypothesis." }),
  p({ id: "inf-tscore-1", topicId: "hypothesis-testing", section: "t-test", type: "numeric", difficulty: "medium",
    prompt: "A sample of $n = 25$ has mean $\\bar{x} = 52$, population mean $\\mu_0 = 50$, and $s = 5$. Calculate the $t$-statistic.",
    answer: "2",
    explanation: "Step 1: $t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}$. Step 2: $t = \\frac{52 - 50}{5 / \\sqrt{25}} = \\frac{2}{5/5} = \\frac{2}{1} = 2$. Final answer: $2$." }),
  p({ id: "inf-type-1", topicId: "hypothesis-testing", section: "errors", type: "mcq", difficulty: "easy",
    prompt: "A Type I error occurs when:",
    answer: "We reject a true null hypothesis.",
    choices: [
      "We fail to reject a false null hypothesis.",
      "We reject a true null hypothesis.",
      "We accept a false null hypothesis.",
      "The sample size is too small.",
    ],
    explanation: "Step 1: A Type I error (false positive) means rejecting $H_0$ when it is actually true. Step 2: The probability of a Type I error equals the significance level $\\alpha$. Final answer: We reject a true null hypothesis." }),
];
