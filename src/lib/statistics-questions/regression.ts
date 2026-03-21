import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const regressionProblems: Problem[] = [
  p({ id: "reg-corr-1", topicId: "regression", section: "correlation", type: "mcq", difficulty: "easy",
    prompt: "A correlation coefficient of $r = -0.92$ indicates:",
    answer: "A strong negative linear relationship.",
    choices: [
      "A weak positive linear relationship.",
      "A strong positive linear relationship.",
      "A strong negative linear relationship.",
      "No linear relationship.",
    ],
    explanation: "Step 1: $|r| = 0.92$ is close to $1$, indicating a strong relationship. Step 2: The negative sign means as $x$ increases, $y$ tends to decrease. Final answer: A strong negative linear relationship." }),
  p({ id: "reg-slope-1", topicId: "regression", section: "linear", type: "numeric", difficulty: "medium",
    prompt: "A regression line is $\\hat{y} = 3 + 2x$. What is the predicted value when $x = 5$?",
    answer: "13",
    explanation: "Step 1: Substitute $x = 5$: $\\hat{y} = 3 + 2(5) = 3 + 10 = 13$. Final answer: $13$." }),
  p({ id: "reg-r2-1", topicId: "regression", section: "linear", type: "mcq", difficulty: "easy",
    prompt: "If $R^2 = 0.81$, what percentage of the variance in $y$ is explained by the model?",
    answer: "81%",
    choices: ["9%", "19%", "81%", "90%"],
    explanation: "Step 1: $R^2$ directly represents the proportion of variance explained. Step 2: $R^2 = 0.81$ means $81\\%$ of the variability in $y$ is explained by the regression model. Final answer: $81\\%$." }),
  p({ id: "reg-residual-1", topicId: "regression", section: "linear", type: "numeric", difficulty: "easy",
    prompt: "If the observed value is $y = 15$ and the predicted value is $\\hat{y} = 12$, what is the residual?",
    answer: "3",
    explanation: "Step 1: Residual $= y - \\hat{y}$. Step 2: $= 15 - 12 = 3$. Final answer: $3$." }),
  p({ id: "reg-interpret-1", topicId: "regression", section: "linear", type: "mcq", difficulty: "medium",
    prompt: "In the model $\\hat{y} = 10 + 3x$, the slope $3$ means:",
    answer: "For each unit increase in $x$, $y$ is predicted to increase by $3$.",
    choices: [
      "When $x = 0$, $y = 3$.",
      "For each unit increase in $x$, $y$ is predicted to increase by $3$.",
      "The correlation is $0.3$.",
      "The model explains $30\\%$ of the variance.",
    ],
    explanation: "Step 1: In a linear model $\\hat{y} = b_0 + b_1 x$, the slope $b_1$ represents the predicted change in $y$ for a one-unit increase in $x$. Step 2: Here $b_1 = 3$, so each unit increase in $x$ predicts a $3$-unit increase in $y$. Final answer: For each unit increase in $x$, $y$ is predicted to increase by $3$." }),
];
