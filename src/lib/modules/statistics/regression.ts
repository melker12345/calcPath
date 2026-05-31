import type { ModuleContent } from "../types";

export const regressionModule: ModuleContent = {
    topicId: "regression",
    title: "Regression & Correlation",
    intro: [
      "Regression and correlation are tools for understanding relationships between variables. Correlation measures the strength and direction of a linear relationship; regression builds a predictive model.",
      "Simple linear regression fits a line $\\hat{y} = b_0 + b_1 x$ to data, minimizing the sum of squared residuals. It is the workhorse of statistical modeling.",
      "These tools are the starting point for more complex models (multiple regression, logistic regression) that power modern data science.",
    ],
    sections: [
      {
        title: "Correlation",
        section: "correlation",
        body: [
          "The Pearson correlation coefficient $r$ measures the strength and direction of the linear association between two quantitative variables: $r = \\frac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sqrt{\\sum(x_i-\\bar{x})^2\\sum(y_i-\\bar{y})^2}}$. It is dimensionless, always in $[-1,1]$.",
          "$r = +1$: perfect positive linear relationship; $r = -1$: perfect negative linear relationship; $r = 0$: no linear relationship (a nonlinear one may still exist). Guidelines: $|r| \\geq 0.8$ is typically considered strong; $0.5 \\leq |r| < 0.8$ moderate; $|r| < 0.5$ weak.",
          "The test of $H_0: \\rho = 0$ uses the test statistic $t = r\\sqrt{n-2}/\\sqrt{1-r^2}$ with $n-2$ degrees of freedom. A statistically significant correlation does not imply a practically important one.",
          "Correlation does not imply causation. A positive $r$ between ice cream sales and drownings does not mean ice cream causes drownings — both are driven by hot weather (a confounding variable).",
          "Spearman's rank correlation $r_s$ is the Pearson correlation of the ranks of $x$ and $y$. It is robust to outliers and appropriate for ordinal data or monotone (but not necessarily linear) relationships.",
        ],
        eli5: [
          "Correlation asks: when one variable goes up, does the other tend to go up too ($r > 0$), go down ($r < 0$), or do its own thing ($r \\approx 0$)? A value of $r = 0.9$ means the two variables move together almost perfectly in a straight-line pattern.",
        ],
      },
      {
        title: "Simple linear regression",
        section: "linear",
        body: [
          "Simple linear regression fits a line $\\hat{y} = b_0 + b_1 x$ to data by minimising the sum of squared residuals $\\text{SSE} = \\sum(y_i-\\hat{y}_i)^2$ — the ordinary least-squares (OLS) criterion.",
          "OLS estimators: slope $b_1 = r\\cdot(s_y/s_x) = \\sum(x_i-\\bar{x})(y_i-\\bar{y})/\\sum(x_i-\\bar{x})^2$; intercept $b_0 = \\bar{y} - b_1\\bar{x}$. The line always passes through $(\\bar{x}, \\bar{y})$.",
          "Interpretation: $b_1$ is the estimated change in $y$ for a one-unit increase in $x$, holding all else equal (in simple regression, 'all else' is trivially satisfied). $b_0$ is the predicted $y$ when $x = 0$ — it may lack practical meaning if $x = 0$ is outside the observed range.",
          "Inference on $b_1$: under the standard assumptions, $b_1 \\sim N(\\beta_1, \\sigma^2/\\text{SS}_x)$. The test statistic $t = (b_1-0)/SE_{b_1}$ follows $t_{n-2}$. The $95\\%$ CI for $\\beta_1$ is $b_1 \\pm t^*_{n-2}\\cdot SE_{b_1}$.",
          "Multiple linear regression extends the model to several predictors: $\\hat{y} = b_0 + b_1 x_1 + \\cdots + b_k x_k$. Each $b_j$ is the estimated effect of $x_j$ holding the other predictors constant. The OLS estimates are given in matrix form by $\\hat{\\boldsymbol{\\beta}} = (X^TX)^{-1}X^T\\mathbf{y}$.",
        ],
        eli5: [
          "Regression fits the 'best straight line' through a scatter plot. 'Best' means the line minimises the total squared vertical distance from the points to the line. The slope tells you the predicted change in $y$ per unit increase in $x$.",
        ],
        examples: [
          {
            title: "Computing and interpreting regression coefficients",
            steps: [
              "Data: $x = \\{1,2,3,4,5\\}$, $y = \\{2,4,5,4,5\\}$. $\\bar{x}=3$, $\\bar{y}=4$.",
              "$\\sum(x_i-\\bar{x})(y_i-\\bar{y}) = (-2)(-2)+(-1)(0)+(0)(1)+(1)(0)+(2)(1) = 4+0+0+0+2 = 6$.",
              "$\\sum(x_i-\\bar{x})^2 = 4+1+0+1+4 = 10$.",
              "$b_1 = 6/10 = 0.6$. $b_0 = 4 - 0.6(3) = 4-1.8 = 2.2$.",
              "Model: $\\hat{y} = 2.2 + 0.6x$. Interpretation: each unit increase in $x$ is associated with a $0.6$-unit increase in predicted $y$.",
            ],
          },
        ],
      },
      {
        title: "Residuals and model assessment",
        section: "residuals",
        body: [
          "The residual $e_i = y_i - \\hat{y}_i$ is the difference between observed and fitted value. By construction, $\\sum e_i = 0$ and $\\sum x_i e_i = 0$.",
          "$R^2 = 1 - \\text{SSE}/\\text{SST}$ is the proportion of total variance in $y$ explained by the model. For simple linear regression, $R^2 = r^2$. Adjusted $R^2$ penalises for the number of predictors and is used in multiple regression.",
          "A residual plot (residuals vs. $\\hat{y}$ or vs. $x$) should show a random scatter around $0$ with roughly constant spread. Systematic patterns indicate violations of linearity or homoscedasticity.",
          "A Q-Q plot of residuals checks for normality. The standard error of the regression $s = \\sqrt{\\text{SSE}/(n-2)}$ estimates the typical size of a residual.",
          "Influential observations: leverage measures how unusual an $x$-value is; Cook's distance combines leverage and residual size to measure overall influence on the fitted model.",
        ],
        eli5: [
          "Residuals are the errors your model makes — how far each prediction is from the true value. A good model has residuals that look like pure noise: no pattern, roughly the same size everywhere. If the residuals fan out (get bigger for larger $x$), or show a curve, the model needs revision.",
        ],
      },
      {
        title: "Conditions for regression (LINE)",
        section: "conditions",
        body: [
          "Linearity: the mean of $y$ is a linear function of $x$. Check with a scatter plot before fitting.",
          "Independence: observations are independent. Violated by time-series data with autocorrelated errors.",
          "Normality: residuals are approximately normally distributed. Required for exact $t$ and $F$ inference; less critical for large samples by the CLT.",
          "Equal variance (homoscedasticity): the variance of the residuals is constant across all values of $x$. Violated when residuals fan out — check with a residual plot.",
          "Transformations (log, square root) of $x$ or $y$ can often fix non-linearity or non-constant variance and restore the LINE conditions.",
        ],
        eli5: [
          "The LINE acronym is the checklist for valid regression: the relationship must be Linear, observations Independent, residuals Normally distributed, and the spread of residuals Equal across $x$-values. Violating any condition may invalidate $p$-values and confidence intervals.",
        ],
      },
      {
        title: "Extrapolation and limitations",
        section: "linear",
        body: [
          "Extrapolation is predicting $y$ for $x$ values outside the range of the training data. The linear relationship may break down, making extrapolated predictions unreliable.",
          "Correlation and regression describe association, not causation. Only randomised controlled experiments allow causal claims.",
          "Lurking variables (confounders) can create spurious correlations. Always consider whether a third variable might explain an apparent association.",
        ],
        eli5: [
          "Using a regression line to predict outside the range you measured is like extending a map you drew by hand: you know the territory you measured, but beyond the edge of your map, things might look completely different.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Claiming causation from a regression. Regression shows association, not causation, unless data comes from a randomised experiment.",
      "Extrapolating far beyond the range of the data. The model is reliable only near the observed $x$ range.",
      "Interpreting $R^2$ as the correlation. $R^2 = r^2$: if $R^2 = 0.81$ then $r = \\pm 0.9$, not $0.81$.",
      "Ignoring residual plots. A high $R^2$ does not guarantee LINE conditions are met — always check the residuals.",
      "Comparing $R^2$ across models with different numbers of predictors. Use adjusted $R^2$ or information criteria (AIC, BIC) instead.",
    ],
  };
