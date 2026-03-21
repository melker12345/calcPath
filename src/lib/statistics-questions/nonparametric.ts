import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const nonparametricProblems: Problem[] = [
  p({ id: "nonpar-chisq-1", topicId: "nonparametric", section: "chi-square", type: "mcq", difficulty: "easy",
    prompt: "A chi-square goodness-of-fit test is used to determine whether:",
    answer: "Observed frequencies match expected frequencies",
    choices: [
      "Observed frequencies match expected frequencies",
      "Two population means are equal",
      "Two variables have equal variances",
      "A sample is normally distributed",
    ],
    explanation: "Step 1: The chi-square goodness-of-fit test compares observed counts in categories to the expected counts under a null hypothesis distribution. Step 2: A large $\\chi^2$ statistic indicates a poor fit. Final answer: Observed frequencies match expected frequencies." }),
  p({ id: "nonpar-indep-1", topicId: "nonparametric", section: "chi-square", type: "mcq", difficulty: "medium",
    prompt: "A chi-square test for independence tests whether:",
    answer: "Two categorical variables are independent",
    choices: [
      "Two categorical variables are independent",
      "Two numerical variables are correlated",
      "A distribution is normal",
      "Two means are equal",
    ],
    explanation: "Step 1: The chi-square test for independence uses a contingency table to test $H_0$: the two categorical variables are independent. Step 2: If $p < \\alpha$, we conclude an association exists. Final answer: Two categorical variables are independent." }),
  p({ id: "nonpar-mw-1", topicId: "nonparametric", section: "rank-tests", type: "mcq", difficulty: "medium",
    prompt: "The Mann-Whitney U test is a non-parametric alternative to the:",
    answer: "Two-sample $t$-test",
    choices: [
      "Two-sample $t$-test",
      "One-sample $t$-test",
      "Paired $t$-test",
      "One-way ANOVA",
    ],
    explanation: "Step 1: The Mann-Whitney U test compares the distributions of two independent groups without assuming normality. Step 2: It is the non-parametric equivalent of the independent samples $t$-test. Final answer: Two-sample $t$-test." }),
];
