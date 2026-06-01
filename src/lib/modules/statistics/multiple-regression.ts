import type { ModuleContent } from "../types";

export const multipleRegressionModule: ModuleContent = {
  topicId: "multiple-regression",
  title: "Multiple Linear Regression",
  intro: [
    "Multiple linear regression extends simple linear regression to multiple predictors: $\\hat{y} = b_0 + b_1 x_1 + b_2 x_2 + \\dots + b_k x_k$. Each coefficient $b_j$ represents the expected change in $y$ when $x_j$ increases by one unit, *holding all other predictors constant*.",
    "This is the foundation of modern statistical modeling and machine learning. It allows us to control for confounding variables, build predictive models, and understand complex relationships in data.",
    "Key challenges that appear only in the multiple-predictor setting include multicollinearity, variable selection, and interpreting partial effects. Mastering these concepts is essential for any serious data analysis work.",
  ],
  sections: [
    {
      title: "The multiple regression model",
      section: "model",
      body: [
        "The population model is $y = \\beta_0 + \\beta_1 x_1 + \\dots + \\beta_k x_k + \\varepsilon$, where $\\varepsilon \\sim N(0, \\sigma^2)$ independently.",
        "In matrix form: $\\mathbf{y} = X\\boldsymbol{\\beta} + \\boldsymbol{\\varepsilon}$, where $X$ is the $n \\times (k+1)$ design matrix (including a column of 1s for the intercept).",
        "The ordinary least squares estimator is $\\hat{\\boldsymbol{\\beta}} = (X^T X)^{-1} X^T \\mathbf{y}$, provided $X$ has full column rank (no perfect multicollinearity).",
        "Fitted values: $\\hat{\\mathbf{y}} = X\\hat{\\boldsymbol{\\beta}} = H\\mathbf{y}$, where $H = X(X^T X)^{-1}X^T$ is the hat matrix (projection onto the column space of $X$).",
        "Residuals: $\\mathbf{e} = \\mathbf{y} - \\hat{\\mathbf{y}} = (I - H)\\mathbf{y}$.",
      ],
      eli5: [
        "Think of multiple regression as fitting a flat 'sheet' (hyperplane) through points in many dimensions instead of a line through points in 2D. Each predictor gives the sheet another direction to tilt.",
      ],
      examples: [
        {
          title: "Interpreting a coefficient while holding others constant",
          steps: [
            "Model: $\\widehat{\\text{salary}} = 30000 + 2000 \\cdot \\text{years exp} + 1500 \\cdot \\text{education years} - 5000 \\cdot \\text{gap in resume}$.",
            "The coefficient on 'years of experience' ($2000$) means: for two people with the *same* education and resume gap, one extra year of experience is associated with $2000 more predicted salary.",
            "This is the *partial* effect — we have statistically controlled for the other variables in the model.",
          ],
        },
      ],
    },
    {
      title: "Goodness of fit and inference",
      section: "fit",
      body: [
        "$R^2 = 1 - \\frac{\\text{SSE}}{\\text{SST}}$ is still the proportion of variance explained, but now it always increases when you add more predictors (even useless ones).",
        "Adjusted $R^2 = 1 - \\frac{\\text{SSE}/(n-k-1)}{\\text{SST}/(n-1)}$ penalizes for the number of predictors $k$. It can decrease when a variable is added that does not improve the model enough.",
        "The overall F-test tests $H_0: \\beta_1 = \\beta_2 = \\dots = \\beta_k = 0$ (the model as a whole has no explanatory power). $F = \\frac{\\text{MSR}}{\\text{MSE}} \\sim F_{k, n-k-1}$.",
        "Individual t-tests on each $b_j$ test whether that predictor is useful *after controlling for the others already in the model*.",
        "Confidence intervals and prediction intervals are constructed similarly to simple regression but use the full variance-covariance matrix of $\\hat{\\boldsymbol{\\beta}}$.",
      ],
      eli5: [
        "Adjusted $R^2$ is like a 'fairness adjustment' in a video game. Adding a new predictor is like giving yourself extra tools — $R^2$ will always look better or the same, but adjusted $R^2$ only improves if the new tool was actually helpful.",
      ],
    },
    {
      title: "Multicollinearity",
      section: "multicollinearity",
      body: [
        "Multicollinearity occurs when two or more predictors are highly correlated with each other. It does not bias the coefficients, but it inflates their standard errors, making individual coefficients unstable and hard to interpret.",
        "Symptoms: large standard errors, coefficients with unexpected signs or magnitudes, sensitivity to small changes in the data or model specification.",
        "Variance Inflation Factor (VIF) for predictor $j$: $\\text{VIF}_j = \\frac{1}{1 - R^2_j}$, where $R^2_j$ is the $R^2$ from regressing $x_j$ on all the other predictors. Rule of thumb: VIF > 5 or 10 indicates problematic multicollinearity.",
        "Remedies: remove one of the correlated variables, combine them (e.g., via PCA), collect more data, or use regularization (ridge regression, lasso).",
      ],
      eli5: [
        "Imagine trying to figure out whether height or weight matters more for basketball performance when every tall player is also heavy. The two variables move together so much that the model can't reliably separate their individual effects — that's multicollinearity.",
      ],
      examples: [
        {
          title: "Detecting multicollinearity with VIF",
          steps: [
            "You have predictors: 'years of education' and 'highest degree level' (which are very correlated).",
            "Regress 'years of education' on all other predictors (including degree level) and obtain $R^2 = 0.92$.",
            "VIF = 1 / (1 - 0.92) = 12.5 — well above the common threshold of 5 or 10.",
            "Conclusion: these two variables are too redundant; consider dropping one or combining them.",
          ],
        },
      ],
    },
    {
      title: "Model selection and regularization",
      section: "selection",
      body: [
        "All-subsets regression tries every possible combination of predictors (computationally expensive for large $k$).",
        "Forward selection: start with no predictors, add the most useful one at each step until no more improve the model (by F-test, AIC, etc.).",
        "Backward elimination: start with all predictors, remove the least useful one iteratively.",
        "Stepwise regression combines forward and backward steps.",
        "Information criteria: AIC = $n \\log(\\text{SSE}/n) + 2(k+1)$, BIC = $n \\log(\\text{SSE}/n) + \\log(n)(k+1)$. Lower is better; BIC penalizes extra variables more heavily than AIC.",
        "Regularization methods (ridge, lasso, elastic net) add a penalty on the size of the coefficients. They can shrink coefficients toward zero and perform automatic variable selection (lasso).",
      ],
      eli5: [
        "Model selection is like packing for a trip: you want to bring the most useful items without overloading your suitcase. AIC and BIC are different ways of deciding whether the benefit of adding another 'item' (predictor) is worth the cost of extra complexity.",
      ],
    },
    {
      title: "Assumptions and diagnostics",
      section: "diagnostics",
      body: [
        "The LINE assumptions still apply, but now 'linearity' means the mean of $y$ is a linear function of the *multiple* predictors (the hyperplane).",
        "Partial regression plots (added-variable plots) help visualize the relationship between $y$ and one $x_j$ after removing the linear effects of the other predictors.",
        "Leverage, Cook's distance, and DFFITS identify influential observations in the multiple-predictor setting.",
        "Residual plots against each predictor or against fitted values are still essential. Look for nonlinearity, heteroscedasticity, and outliers.",
      ],
      eli5: [
        "With many predictors it becomes harder to 'see' problems by eye. Partial regression plots are like holding everything else in the model fixed so you can look at one relationship at a time — the statistical equivalent of a controlled experiment in your data.",
      ],
    },
  ],
  examples: [],
  commonMistakes: [
    "Interpreting a coefficient as 'the effect of $x_j$' without the crucial qualifier 'holding the other variables in the model constant'.",
    "Trusting $R^2$ alone in multiple regression. Always look at adjusted $R^2$, the F-test, and individual t-tests.",
    "Ignoring multicollinearity. High VIFs mean your coefficients are unstable even if the overall model predicts well.",
    "Using automated stepwise selection as the only tool and then reporting p-values as if the model were pre-specified (p-values are biased after selection).",
    "Failing to check residual diagnostics just because you have 'many variables'. The assumptions are still required for valid inference.",
  ],
};