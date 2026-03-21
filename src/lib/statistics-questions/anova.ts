import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const anovaProblems: Problem[] = [
  p({ id: "anova-f-1", topicId: "anova", section: "f-test", type: "mcq", difficulty: "medium",
    prompt: "In one-way ANOVA, the $F$-statistic is the ratio of:",
    answer: "Between-group variance to within-group variance",
    choices: [
      "Between-group variance to within-group variance",
      "Within-group variance to between-group variance",
      "Sample mean to population mean",
      "Total variance to sample size",
    ],
    explanation: "Step 1: The $F$-statistic $= \\frac{\\text{MS}_{\\text{between}}}{\\text{MS}_{\\text{within}}}$. Step 2: A large $F$ means groups differ more than expected by chance, suggesting at least one group mean differs. Final answer: Between-group variance to within-group variance." }),
  p({ id: "anova-null-1", topicId: "anova", section: "f-test", type: "mcq", difficulty: "easy",
    prompt: "The null hypothesis in one-way ANOVA states that:",
    answer: "All group means are equal",
    choices: [
      "All group means are equal",
      "At least one group mean differs",
      "All group variances are equal",
      "The sample size is the same in all groups",
    ],
    explanation: "Step 1: $H_0: \\mu_1 = \\mu_2 = \\cdots = \\mu_k$ — all population means are equal. Step 2: Rejecting $H_0$ only tells us at least one mean differs; follow-up tests (e.g., Tukey's HSD) identify which ones. Final answer: All group means are equal." }),
  p({ id: "anova-assume-1", topicId: "anova", section: "assumptions", type: "mcq", difficulty: "medium",
    prompt: "One-way ANOVA assumes that the populations being compared have:",
    answer: "Equal variances and normal distributions",
    choices: [
      "Equal variances and normal distributions",
      "Equal means and normal distributions",
      "Equal sample sizes only",
      "No outliers and equal medians",
    ],
    explanation: "Step 1: ANOVA assumes (1) independence of observations, (2) normally distributed populations, and (3) equal variances (homoscedasticity). Step 2: Violations of these assumptions may require non-parametric alternatives. Final answer: Equal variances and normal distributions." }),
];
