import type { Topic } from "./shared-types";

export type WorkedExample = {
  title: string;
  steps: string[];
};

export type ModuleSection = {
  title: string;
  body: string[];
  eli5?: string[];
  examples?: WorkedExample[];
};

export type ModuleContent = {
  topicId: Topic["id"];
  title: string;
  intro: string[];
  sections: ModuleSection[];
  examples: { title: string; steps: string[] }[];
  commonMistakes: string[];
};

export const modules: ModuleContent[] = [
  {
    topicId: "descriptive",
    title: "Descriptive Statistics",
    intro: [
      "Descriptive statistics is the art of summarizing raw data into meaningful numbers and visuals. Before you can make predictions or test theories, you need to know what your data looks like.",
      "The two big questions are always the same: where is the center of the data, and how spread out is it? Answering these two questions well tells you most of what you need to know.",
      "We will cover measures of central tendency (mean, median, mode), measures of spread (range, variance, standard deviation), and how to visualize distributions.",
    ],
    sections: [
      {
        title: "Measures of central tendency",
        body: [
          "The mean (average) is the sum of all values divided by the count: $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$. It uses every data point but is sensitive to outliers.",
          "The median is the middle value when data is sorted. For an even count, average the two middle values. The median is robust to outliers, making it better for skewed data like income.",
          "The mode is the most frequently occurring value. It is the only measure that works for categorical data (e.g., the most popular color).",
        ],
        eli5: [
          "Imagine you and four friends have different numbers of candies. The mean is what everyone would have if you shared equally. The median is the amount the person in the middle has when you line up from fewest to most. The mode is the amount that the most people share.",
        ],
        examples: [
          {
            title: "Computing mean, median, and mode",
            steps: [
              "Data: $\\{3, 7, 7, 2, 9\\}$.",
              "Mean: $(3+7+7+2+9)/5 = 28/5 = 5.6$.",
              "Sorted: $2, 3, 7, 7, 9$. Median (middle value): $7$.",
              "Mode: $7$ appears twice — the most frequent value.",
            ],
          },
        ],
      },
      {
        title: "Measures of spread",
        body: [
          "The range is the simplest: $\\text{range} = \\max - \\min$. It only uses two values, so it's easily distorted by a single outlier.",
          "Variance measures how far each data point is from the mean, on average. Population variance: $\\sigma^2 = \\frac{1}{N}\\sum(x_i - \\mu)^2$. Sample variance uses $n-1$ in the denominator (Bessel's correction) to produce an unbiased estimate.",
          "Standard deviation is the square root of variance: $\\sigma = \\sqrt{\\sigma^2}$. It has the same units as the data, which makes it more interpretable than variance.",
          "The interquartile range (IQR) is $Q_3 - Q_1$, the range of the middle $50\\%$ of data. It is robust to outliers and is the basis for box plots.",
        ],
        eli5: [
          "If the mean tells you where the bullseye is on a dartboard, the standard deviation tells you how scattered the darts are. A small standard deviation means tight grouping; a large one means darts are all over the place.",
        ],
        examples: [
          {
            title: "Computing variance and standard deviation",
            steps: [
              "Data: $\\{2, 4, 4, 4, 5, 5, 7, 9\\}$, mean $\\mu = 5$.",
              "Squared deviations: $(2-5)^2=9$, $(4-5)^2=1$ (×3), $(5-5)^2=0$ (×2), $(7-5)^2=4$, $(9-5)^2=16$.",
              "Sum $= 9+1+1+1+0+0+4+16 = 32$.",
              "Population variance: $\\sigma^2 = 32/8 = 4$.",
              "Standard deviation: $\\sigma = \\sqrt{4} = 2$.",
            ],
          },
        ],
      },
      {
        title: "Data visualization",
        body: [
          "Histograms group continuous data into bins and show frequencies. They reveal shape: symmetric, left-skewed, or right-skewed.",
          "Box plots display the five-number summary (min, $Q_1$, median, $Q_3$, max) and flag outliers. They are ideal for comparing distributions side by side.",
          "Scatter plots show the relationship between two quantitative variables. Patterns (linear, curved, clustered) guide the choice of model.",
          "When data is right-skewed (like income), the mean is pulled right of the median. When left-skewed, the mean is pulled left. For symmetric data, mean $\\approx$ median.",
        ],
        eli5: [
          "A histogram is like sorting marbles into cups by size — you can instantly see which sizes are most common. A box plot is like a quick summary card: it shows the middle 50% as a box, with whiskers reaching out to the extremes.",
        ],
      },
      {
        title: "Percentiles and the five-number summary",
        body: [
          "The $p$-th percentile is the value below which $p\\%$ of the data falls. The median is the $50$th percentile.",
          "$Q_1$ (25th percentile) and $Q_3$ (75th percentile) split the data into quarters. The IQR $= Q_3 - Q_1$.",
          "The five-number summary is: minimum, $Q_1$, median, $Q_3$, maximum. It provides a complete picture of the distribution's spread and center.",
          "Outliers are typically defined as values below $Q_1 - 1.5 \\cdot \\text{IQR}$ or above $Q_3 + 1.5 \\cdot \\text{IQR}$.",
        ],
      },
      {
        title: "Choosing the right summary",
        body: [
          "For symmetric distributions with no outliers, the mean and standard deviation are the best summaries.",
          "For skewed distributions or data with outliers, use the median and IQR instead.",
          "Always visualize your data before choosing summary statistics. A histogram or box plot can reveal skewness, bimodality, or outliers that pure numbers cannot.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing population variance ($\\div N$) with sample variance ($\\div (n-1)$). In most real applications, you have a sample, so use $n-1$.",
      "Reporting the mean for heavily skewed data (like income). The median is a better measure of the typical value when outliers pull the mean.",
      "Forgetting to sort data before finding the median or quartiles.",
      "Interpreting standard deviation as a percentage. It has the same units as the data — always include units.",
    ],
  },
  {
    topicId: "probability",
    title: "Probability",
    intro: [
      "Probability quantifies uncertainty. It assigns a number between $0$ and $1$ to each possible outcome, where $0$ means impossible and $1$ means certain.",
      "Probability theory gives us the language to reason about randomness, and it is the foundation that all of statistical inference is built upon.",
      "We start with basic rules, then build up to conditional probability, independence, and Bayes' theorem — tools used in everything from medical testing to spam filtering.",
    ],
    sections: [
      {
        title: "Basic probability rules",
        body: [
          "The sample space $S$ is the set of all possible outcomes. An event $A$ is a subset of $S$.",
          "For equally likely outcomes: $P(A) = \\frac{|A|}{|S|}$ — the number of favorable outcomes divided by the total.",
          "The complement rule: $P(A^c) = 1 - P(A)$. The probability something does not happen equals one minus the probability it does.",
          "The addition rule: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. We subtract the overlap to avoid double-counting.",
        ],
        eli5: [
          "Think of probability like weather forecasts. If there is a $70\\%$ chance of rain, there is a $30\\%$ chance of no rain. That is the complement rule — the two always add up to $100\\%$.",
        ],
        examples: [
          {
            title: "Card probability",
            steps: [
              "What is the probability of drawing a heart from a standard deck?",
              "There are $13$ hearts out of $52$ cards total.",
              "$P(\\text{heart}) = 13/52 = 1/4 = 0.25$.",
            ],
          },
        ],
      },
      {
        title: "Conditional probability and independence",
        body: [
          "Conditional probability is the probability of $A$ given that $B$ has occurred: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$.",
          "Two events are independent if knowing one gives no information about the other: $P(A|B) = P(A)$, which is equivalent to $P(A \\cap B) = P(A) \\cdot P(B)$.",
          "If events are not independent, they are dependent. Drawing cards without replacement creates dependence because the deck composition changes.",
        ],
        eli5: [
          "Conditional probability is like asking: given that it is cloudy, what is the chance of rain? The condition (cloudy) narrows the possibilities and usually changes the answer.",
        ],
      },
      {
        title: "Bayes' theorem",
        body: [
          "Bayes' theorem lets you reverse conditional probabilities: $P(B|A) = \\frac{P(A|B) \\cdot P(B)}{P(A)}$.",
          "It is essential when you know how likely evidence is given a hypothesis ($P(\\text{evidence}|\\text{hypothesis})$), but you want to know how likely the hypothesis is given the evidence ($P(\\text{hypothesis}|\\text{evidence})$).",
          "Classic application: medical testing. If a test is $99\\%$ accurate and the disease affects $1\\%$ of the population, a positive result is still more likely to be a false positive than a true positive.",
        ],
        examples: [
          {
            title: "Bayes' theorem in medical testing",
            steps: [
              "Disease prevalence: $P(D) = 0.01$. Test sensitivity: $P(+|D) = 0.99$. False positive rate: $P(+|D^c) = 0.05$.",
              "$P(+) = P(+|D)P(D) + P(+|D^c)P(D^c) = 0.99(0.01) + 0.05(0.99) = 0.0099 + 0.0495 = 0.0594$.",
              "$P(D|+) = \\frac{0.0099}{0.0594} \\approx 0.167$.",
              "Only about $16.7\\%$ chance of actually having the disease, despite a positive test.",
            ],
          },
        ],
      },
      {
        title: "Counting principles",
        body: [
          "The multiplication principle: if task $A$ has $m$ outcomes and task $B$ has $n$ outcomes, together they have $m \\times n$ outcomes.",
          "Permutations count ordered arrangements: $P(n,k) = \\frac{n!}{(n-k)!}$. Order matters.",
          "Combinations count unordered selections: $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$. Order does not matter.",
          "Key question to ask: does the order of selection matter? If yes, use permutations. If no, use combinations.",
        ],
      },
      {
        title: "Law of total probability",
        body: [
          "If events $B_1, B_2, \\ldots, B_n$ partition the sample space, then $P(A) = \\sum_{i=1}^{n} P(A|B_i) P(B_i)$.",
          "This is the denominator in Bayes' theorem and is used to compute the overall probability of an event by considering all possible scenarios.",
          "It is especially useful when the probability of $A$ differs across different groups or conditions.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting to subtract the overlap in $P(A \\cup B)$ when events are not mutually exclusive.",
      "Confusing independent events with mutually exclusive events. Mutually exclusive events are never independent (unless one has zero probability).",
      "Confusing $P(A|B)$ with $P(B|A)$ — these are generally not equal. This is exactly what Bayes' theorem corrects.",
      "Using permutations when combinations are needed (or vice versa). Ask: does order matter?",
    ],
  },
  {
    topicId: "discrete-distributions",
    title: "Discrete Probability Distributions",
    intro: [
      "A discrete probability distribution assigns probabilities to a countable set of outcomes. The binomial and Poisson distributions model the most common real-world counting processes.",
      "The foundation is the random variable: a function that assigns a number to each outcome. Expected value and variance summarize its center and spread.",
      "Mastering discrete distributions is the first step toward understanding statistical inference — all confidence intervals and hypothesis tests are built on distributional assumptions.",
    ],
    sections: [
      {
        title: "Random variables and expected value",
        body: [
          "A random variable $X$ assigns a numerical value to each outcome in a sample space. Discrete random variables have countable outcomes; continuous ones can take any value in an interval.",
          "The expected value (mean) of a discrete random variable: $E(X) = \\sum x_i \\cdot P(X = x_i)$. It is the long-run average if the experiment is repeated many times.",
          "Variance of a random variable: $\\text{Var}(X) = E[(X - \\mu)^2] = E(X^2) - [E(X)]^2$.",
        ],
        eli5: [
          "If you roll a fair die millions of times and average all the results, you would get $3.5$ — that is the expected value. It does not have to be a possible outcome; it is the long-run average.",
        ],
      },
      {
        title: "The binomial distribution",
        body: [
          "The binomial distribution models the number of successes in $n$ independent trials, each with success probability $p$.",
          "Formula: $P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$. The mean is $\\mu = np$ and the standard deviation is $\\sigma = \\sqrt{np(1-p)}$.",
          "Requirements: fixed number of trials, each trial is independent, same probability of success for each trial, only two outcomes per trial.",
        ],
        examples: [
          {
            title: "Binomial probability",
            steps: [
              "A fair coin is flipped $5$ times. Find $P(X = 3)$ — exactly $3$ heads.",
              "$\\binom{5}{3} = 10$, $p = 0.5$.",
              "$P(X=3) = 10 \\times 0.5^3 \\times 0.5^2 = 10 \\times 0.03125 = 0.3125$.",
            ],
          },
        ],
      },
      {
        title: "The normal distribution",
        body: [
          "The normal (Gaussian) distribution is the bell curve: $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$. It is symmetric about the mean $\\mu$.",
          "The empirical rule: approximately $68\\%$ of data falls within $\\pm 1\\sigma$, $95\\%$ within $\\pm 2\\sigma$, and $99.7\\%$ within $\\pm 3\\sigma$.",
          "The standard normal distribution has $\\mu = 0$ and $\\sigma = 1$. Any normal distribution can be standardized: $z = \\frac{x - \\mu}{\\sigma}$.",
          "The Central Limit Theorem states that the sampling distribution of the mean approaches a normal distribution as $n$ increases, regardless of the population shape.",
        ],
        eli5: [
          "Heights of adults, measurement errors, and test scores all tend to cluster around an average with most values close to the center and fewer values far away — that is the bell curve. It shows up everywhere because it emerges whenever many small random effects add up.",
        ],
      },
      {
        title: "The Poisson distribution",
        body: [
          "The Poisson distribution models the number of events in a fixed interval of time or space, when events occur independently at a constant average rate $\\lambda$.",
          "Formula: $P(X = k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}$. Both the mean and variance equal $\\lambda$.",
          "Examples: number of emails per hour, number of typos per page, number of accidents at an intersection per month.",
        ],
      },
      {
        title: "Choosing the right distribution",
        body: [
          "Use binomial when you have a fixed number of independent yes/no trials.",
          "Use normal when data is continuous and roughly bell-shaped, or when applying the Central Limit Theorem to sample means.",
          "Use Poisson when counting events in a fixed interval where events are rare and independent.",
          "When $n$ is large and $p$ is not extreme, the binomial can be approximated by the normal: $X \\approx N(np, np(1-p))$.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Applying the binomial formula when trials are not independent (e.g., sampling without replacement from a small population).",
      "Using the normal distribution for heavily skewed data without checking for normality or invoking the CLT with a large enough $n$.",
      "Forgetting that the $z$-score table gives cumulative (left-tail) probabilities, not the probability of being exactly at that $z$.",
      "Confusing $\\lambda$ (the rate) with $p$ (the probability) when choosing between Poisson and binomial models.",
    ],
  },
  {
    topicId: "estimation",
    title: "Statistical Inference: Estimation",
    intro: [
      "Estimation is the process of using sample data to infer the value of an unknown population parameter. The two main tools are point estimates (a single best guess) and interval estimates (a range of plausible values).",
      "The sampling distribution tells us how a statistic varies from sample to sample. Understanding it is the key to constructing valid confidence intervals.",
      "Maximum Likelihood Estimation (MLE) provides a principled general-purpose method for finding the best-fitting parameter value given observed data.",
    ],
    sections: [
      {
        title: "Sampling distributions",
        body: [
          "A sampling distribution is the distribution of a statistic (like $\\bar{x}$) computed from all possible samples of size $n$ from a population.",
          "The standard error of the mean is $SE = \\sigma / \\sqrt{n}$ (or $s / \\sqrt{n}$ when $\\sigma$ is unknown). As $n$ increases, $SE$ decreases — larger samples give more precise estimates.",
          "By the Central Limit Theorem, $\\bar{x}$ is approximately normal for large $n$, even if the population is not normal.",
        ],
        eli5: [
          "Imagine you ask $10$ people their height and compute the average. Then you do it again with a different group of $10$. Each group gives a slightly different average. The spread of all those averages is the sampling distribution — and it is much narrower than the spread of individual heights.",
        ],
      },
      {
        title: "Confidence intervals",
        body: [
          "A confidence interval gives a range of plausible values for a population parameter: $\\bar{x} \\pm z^* \\cdot SE$.",
          "The confidence level (e.g., $95\\%$) describes the long-run success rate of the method. If we repeated the process many times, about $95\\%$ of intervals would contain the true parameter.",
          "To narrow the interval: increase $n$ (reduces $SE$) or lower the confidence level (reduces $z^*$). There is always a trade-off between precision and confidence.",
          "When $\\sigma$ is unknown and $n$ is small, use the $t$-distribution with $n-1$ degrees of freedom instead of $z$.",
        ],
        examples: [
          {
            title: "95% confidence interval for a mean",
            steps: [
              "$\\bar{x} = 100$, $s = 15$, $n = 36$.",
              "$SE = 15/\\sqrt{36} = 15/6 = 2.5$.",
              "For $95\\%$ confidence, $z^* = 1.96$.",
              "Interval: $100 \\pm 1.96(2.5) = 100 \\pm 4.9 = (95.1, 104.9)$.",
            ],
          },
        ],
      },
      {
        title: "Hypothesis testing",
        body: [
          "Hypothesis testing starts with a null hypothesis $H_0$ (usually a claim of no effect or no difference) and an alternative $H_a$.",
          "The test statistic measures how far the sample result is from what $H_0$ predicts: $z = \\frac{\\bar{x} - \\mu_0}{SE}$ (or a $t$-statistic when using $s$).",
          "The $p$-value is the probability of seeing a result as extreme as (or more extreme than) the observed data, assuming $H_0$ is true. Small $p$-values suggest $H_0$ is unlikely.",
          "Decision rule: if $p \\le \\alpha$, reject $H_0$. Common choices for $\\alpha$: $0.05$, $0.01$, $0.10$.",
        ],
      },
      {
        title: "Type I and Type II errors",
        body: [
          "A Type I error is rejecting $H_0$ when it is actually true (false positive). $P(\\text{Type I}) = \\alpha$.",
          "A Type II error is failing to reject $H_0$ when it is actually false (false negative). $P(\\text{Type II}) = \\beta$.",
          "Power $= 1 - \\beta$ is the probability of correctly detecting a real effect. Power increases with larger $n$, larger effect size, or larger $\\alpha$.",
          "There is a tension: lowering $\\alpha$ reduces Type I errors but increases Type II errors. Choosing $\\alpha$ depends on the consequences of each error type.",
        ],
      },
      {
        title: "Practical significance vs. statistical significance",
        body: [
          "A result can be statistically significant (small $p$-value) but practically unimportant — for example, a drug that lowers blood pressure by $0.1$ mmHg with $p < 0.001$.",
          "Always consider effect size alongside $p$-values. Confidence intervals help because they show the magnitude and uncertainty of the estimate, not just a yes/no decision.",
          "With a very large sample size, even trivially small effects become statistically significant. This does not mean they matter.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Interpreting a $95\\%$ CI as 'there is a $95\\%$ probability the true value is in this interval.' The parameter is fixed; the interval is random.",
      "Confusing 'fail to reject $H_0$' with 'accept $H_0$.' Failing to reject means the data is not strong enough to conclude against $H_0$ — it does not prove $H_0$ is true.",
      "Using a $z$-test when $\\sigma$ is unknown and $n$ is small. Use the $t$-distribution instead.",
      "Treating a large $p$-value as evidence that $H_0$ is true. It only means we lack evidence against $H_0$.",
    ],
  },
  {
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
        body: [
          "The Pearson correlation coefficient $r$ measures the strength and direction of the linear relationship between two variables: $r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i-\\bar{x})^2 \\sum(y_i-\\bar{y})^2}}$.",
          "$r$ ranges from $-1$ (perfect negative linear) to $+1$ (perfect positive linear). $r = 0$ means no linear relationship (but there could be a nonlinear one).",
          "Correlation does not imply causation. Two variables can be correlated because of a lurking (confounding) variable.",
        ],
        eli5: [
          "Correlation is like asking: when one variable goes up, does the other tend to go up too ($r > 0$), go down ($r < 0$), or do its own thing ($r \\approx 0$)?",
        ],
      },
      {
        title: "Simple linear regression",
        body: [
          "The least-squares regression line minimizes $\\sum(y_i - \\hat{y}_i)^2$. The slope is $b_1 = r \\cdot \\frac{s_y}{s_x}$ and the intercept is $b_0 = \\bar{y} - b_1 \\bar{x}$.",
          "The slope $b_1$ tells you: for each one-unit increase in $x$, the predicted value of $y$ changes by $b_1$ units.",
          "The intercept $b_0$ is the predicted value of $y$ when $x = 0$. It may or may not have a meaningful interpretation depending on the context.",
        ],
        examples: [
          {
            title: "Making predictions with regression",
            steps: [
              "A regression model gives $\\hat{y} = 5 + 2.3x$ where $x$ is hours studied and $y$ is exam score.",
              "Predict the score for a student who studies $4$ hours: $\\hat{y} = 5 + 2.3(4) = 5 + 9.2 = 14.2$.",
              "The slope $2.3$ means each additional hour of study is associated with a $2.3$-point increase in the predicted exam score.",
            ],
          },
        ],
      },
      {
        title: "Residuals and model assessment",
        body: [
          "A residual is $e_i = y_i - \\hat{y}_i$, the difference between observed and predicted. Positive residuals mean underprediction; negative mean overprediction.",
          "A residual plot (residuals vs. predicted values) should show no pattern. Patterns indicate the linear model is not appropriate.",
          "$R^2$ (coefficient of determination) is the proportion of variance in $y$ explained by the model. $R^2 = r^2$ for simple linear regression.",
        ],
      },
      {
        title: "Conditions for regression",
        body: [
          "Linearity: the relationship between $x$ and $y$ should be approximately linear. Check with a scatter plot.",
          "Independence: observations should be independent of each other.",
          "Normality: residuals should be approximately normally distributed (check with a histogram or Q-Q plot of residuals).",
          "Equal variance (homoscedasticity): the spread of residuals should be roughly constant across all values of $x$.",
        ],
      },
      {
        title: "Extrapolation and limitations",
        body: [
          "Extrapolation is using the model to predict $y$ for $x$ values outside the range of the original data. It is dangerous because the linear relationship may not hold beyond the observed range.",
          "Influential points (high leverage or large residual) can dramatically change the regression line. Always check for them.",
          "Correlation and regression describe association, not causation. Only a well-designed experiment (with randomization) can establish causation.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Claiming causation from a regression. Regression shows association, not causation, unless the data comes from a randomized experiment.",
      "Extrapolating far beyond the range of the data. The model is only reliable within (or near) the range of observed $x$ values.",
      "Interpreting $R^2$ as the correlation. $R^2 = r^2$, so $R^2 = 0.81$ means $r = \\pm 0.9$, not $0.81$.",
      "Ignoring residual plots. A high $R^2$ does not guarantee the model is appropriate — patterns in residuals reveal problems.",
    ],
  },
  {
    topicId: "continuous-distributions",
    title: "Continuous Probability Distributions",
    intro: [
      "Continuous random variables can take any value in an interval. Their distributions are described by probability density functions (PDFs): probabilities are areas under the curve, never the height at a point.",
      "The normal distribution is the cornerstone of statistics. Its bell-curve shape emerges naturally when many small independent effects are added, and it underpins virtually all classical inference methods.",
      "The exponential and uniform distributions complete the toolkit for modeling waiting times, lifetimes, and situations where all outcomes are equally likely.",
    ],
    sections: [
      {
        title: "PDFs and CDFs",
        body: [
          "A probability density function $f(x)$ satisfies $f(x) \\geq 0$ and $\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$. The probability of falling in an interval is the integral: $P(a \\leq X \\leq b) = \\int_a^b f(x)\\,dx$.",
          "The cumulative distribution function (CDF) is $F(x) = P(X \\leq x) = \\int_{-\\infty}^x f(t)\\,dt$. It is non-decreasing, starts at $0$, and ends at $1$.",
          "For a continuous distribution, $P(X = c) = 0$ for any single value $c$. Probabilities are inherently about intervals, not points.",
        ],
        eli5: [
          "A PDF is like a profile of a sand dune. The height at any point tells you how dense the probability is there, but the actual probability of a region is the amount of sand in that stretch — the area. A single grain of sand (a single point) has zero area and therefore zero probability.",
        ],
      },
      {
        title: "The normal distribution",
        body: [
          "The normal (Gaussian) distribution: $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$. It is symmetric about $\\mu$ with spread controlled by $\\sigma$.",
          "The empirical rule: $\\approx 68\\%$ of data within $\\pm 1\\sigma$, $\\approx 95\\%$ within $\\pm 2\\sigma$, $\\approx 99.7\\%$ within $\\pm 3\\sigma$.",
          "Standardize any $X \\sim N(\\mu, \\sigma^2)$ to $Z \\sim N(0,1)$ via $Z = (X-\\mu)/\\sigma$. Then use standard normal tables ($z$-table) to compute probabilities.",
        ],
        eli5: [
          "The bell curve shows up everywhere because it emerges whenever many small random effects add together. Heights, measurement errors, test scores — all cluster around their average with fewer and fewer values as you move further away. That universal shape is the normal distribution.",
        ],
        examples: [
          {
            title: "Finding a z-score and probability",
            steps: [
              "Scores are normally distributed with $\\mu = 70$, $\\sigma = 10$. Find the probability that a score exceeds $85$.",
              "Standardize: $z = (85-70)/10 = 1.5$.",
              "$P(X > 85) = P(Z > 1.5) = 1 - P(Z \\leq 1.5) \\approx 1 - 0.9332 = 0.0668$.",
              "About $6.7\\%$ of scores exceed $85$.",
            ],
          },
        ],
      },
      {
        title: "The exponential and uniform distributions",
        body: [
          "The exponential distribution with rate $\\lambda$: $f(x) = \\lambda e^{-\\lambda x}$ for $x \\geq 0$. Mean $= 1/\\lambda$, variance $= 1/\\lambda^2$. Models waiting times between Poisson events.",
          "The uniform distribution on $[a,b]$: $f(x) = \\frac{1}{b-a}$. Mean $= (a+b)/2$, variance $= (b-a)^2/12$. Every interval of equal length has equal probability.",
          "The memoryless property of the exponential: $P(X > s+t | X > s) = P(X > t)$. Having already waited $s$ units gives no information about future waiting time.",
        ],
      },
      {
        title: "Normal approximation to the binomial",
        body: [
          "When $n$ is large and $p$ is not too extreme, $X \\sim \\text{Binomial}(n,p)$ is approximately $N(np,\\, np(1-p))$.",
          "Rule of thumb: use the normal approximation when $np \\geq 10$ and $n(1-p) \\geq 10$.",
          "For improved accuracy, apply the continuity correction: $P(X \\leq k)$ is approximated by $P(Z \\leq (k + 0.5 - np)/\\sqrt{np(1-p)})$.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Computing $P(X = c)$ for a continuous random variable. For continuous distributions, all point probabilities are zero; you need an interval.",
      "Applying the normal approximation when $np < 10$ or $n(1-p) < 10$. Use the exact binomial formula instead.",
      "Forgetting that the $z$-table gives left-tail (cumulative) probabilities. For right-tail probabilities, subtract from $1$.",
      "Confusing the rate $\\lambda$ in the exponential with the mean. Mean $= 1/\\lambda$, not $\\lambda$.",
    ],
  },
  {
    topicId: "sampling",
    title: "Sampling and Data Distributions",
    intro: [
      "Statistics is fundamentally about inferring properties of a large population from a smaller sample. Understanding how sample statistics vary — their sampling distributions — is what makes that inference valid.",
      "The Law of Large Numbers explains why averages stabilize. The Central Limit Theorem explains why they stabilize to a normal distribution — one of the most remarkable facts in all of mathematics.",
      "These results are the engine behind confidence intervals and hypothesis tests: once you know the sampling distribution of a statistic, you can quantify exactly how confident you should be in your conclusions.",
    ],
    sections: [
      {
        title: "Population vs. sample",
        body: [
          "A population is the entire group of interest; a sample is a subset drawn from it. Population parameters (e.g., $\\mu$, $\\sigma^2$) are fixed but usually unknown. Sample statistics ($\\bar{x}$, $s^2$) are computable from data but vary from sample to sample.",
          "A statistic is unbiased if its expected value equals the parameter: $E(\\bar{x}) = \\mu$. Sample variance with the $n-1$ denominator is unbiased for $\\sigma^2$.",
          "Random sampling is critical: biased sampling (convenience samples, volunteer responses) can give systematically wrong statistics.",
        ],
        eli5: [
          "Think of the population as a giant jar of colored marbles. You grab a handful (the sample) and count the colors. Your handful's proportions are close to the jar's — but not exact. Statistics is the science of how close, and how confident you can be.",
        ],
      },
      {
        title: "The Law of Large Numbers",
        body: [
          "The (weak) Law of Large Numbers: for i.i.d. observations, $\\bar{x}_n \\xrightarrow{P} \\mu$ as $n \\to \\infty$. The sample mean converges in probability to the population mean.",
          "This justifies using long-run frequencies as probabilities, using large samples to estimate parameters, and trusting averages from large studies over small ones.",
          "The LLN does not say that individual trials become more predictable — each coin flip is still $50/50$. It says the average of many flips stabilizes.",
        ],
        eli5: [
          "Flip a coin $10$ times and you might get $7$ heads. Flip it $10,000$ times and you'll get almost exactly $5,000$ heads. The LLN is just saying: the more you do something, the closer the average gets to the true probability.",
        ],
      },
      {
        title: "The Central Limit Theorem",
        body: [
          "The CLT: if $X_1, \\ldots, X_n$ are i.i.d. with mean $\\mu$ and variance $\\sigma^2$, then $\\bar{X} \\approx N(\\mu,\\, \\sigma^2/n)$ for large $n$, regardless of the population distribution.",
          "The standard error of the mean is $SE = \\sigma/\\sqrt{n}$. As $n$ increases, the sampling distribution becomes narrower — larger samples give more precise estimates.",
          "Rule of thumb: $n \\geq 30$ is often sufficient for the CLT to apply, but skewed populations may require larger $n$.",
        ],
        eli5: [
          "Here's the miracle: no matter how weird-looking the original distribution is — skewed, bimodal, uniform — if you take many samples and compute the average each time, those averages will form a bell curve. That is the CLT, and it is why the normal distribution appears everywhere in statistics.",
        ],
        examples: [
          {
            title: "Applying the CLT to find a probability",
            steps: [
              "Population: $\\mu = 100$, $\\sigma = 20$. Draw samples of size $n = 64$.",
              "By CLT: $\\bar{X} \\sim N(100, 20^2/64) = N(100, 6.25)$. So $SE = \\sqrt{6.25} = 2.5$.",
              "$P(\\bar{X} > 105) = P\\left(Z > \\frac{105-100}{2.5}\\right) = P(Z > 2) \\approx 0.0228$.",
            ],
          },
        ],
      },
      {
        title: "Sampling distribution of the proportion",
        body: [
          "For a sample proportion $\\hat{p}$ from $n$ independent Bernoulli trials with success probability $p$: $E(\\hat{p}) = p$ and $SE(\\hat{p}) = \\sqrt{p(1-p)/n}$.",
          "By CLT, $\\hat{p} \\approx N(p, p(1-p)/n)$ when $np \\geq 10$ and $n(1-p) \\geq 10$.",
          "This is the foundation of confidence intervals and hypothesis tests for proportions.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing the standard deviation of the population ($\\sigma$) with the standard error of the mean ($\\sigma/\\sqrt{n}$). They measure different things.",
      "Applying the CLT with a small $n$ from a highly skewed population. Check the sample size and distribution shape before using normal-based inference.",
      "Thinking that the LLN means individual outcomes 'balance out.' Each new observation is independent; past results don't influence future ones (gambler's fallacy).",
      "Forgetting that the CLT applies to the sampling distribution of $\\bar{X}$, not to the distribution of individual observations.",
    ],
  },
  {
    topicId: "hypothesis-testing",
    title: "Statistical Inference: Hypothesis Testing",
    intro: [
      "Hypothesis testing is a formal framework for making decisions from data. You start with a default assumption (the null hypothesis $H_0$) and ask: is the evidence strong enough to reject it?",
      "The $p$-value quantifies the strength of evidence against $H_0$: the probability of seeing results as extreme as yours, assuming $H_0$ is true. Small $p$-values mean the data is surprising under $H_0$.",
      "Understanding the logic of hypothesis testing — including Type I and Type II errors — is essential for interpreting any scientific study that reports 'statistical significance.'",
    ],
    sections: [
      {
        title: "The logic of hypothesis testing",
        body: [
          "The null hypothesis $H_0$ is the status quo (no effect, no difference). The alternative $H_a$ is the claim you want to test. You never prove $H_0$; you either reject it or fail to reject it.",
          "The test statistic measures how far the sample result is from what $H_0$ predicts, in units of standard error: $z = (\\bar{x} - \\mu_0)/SE$ or $t = (\\bar{x} - \\mu_0)/(s/\\sqrt{n})$.",
          "The $p$-value is the probability of a test statistic as extreme or more extreme than observed, assuming $H_0$. Decision rule: reject $H_0$ if $p \\leq \\alpha$.",
        ],
        eli5: [
          "Hypothesis testing is like a trial. $H_0$ is the defendant ('innocent until proven guilty'). The $p$-value is like the strength of the evidence. If the evidence is strong enough (small $p$-value), you convict (reject $H_0$). If not, you acquit (fail to reject) — but that doesn't mean innocent, just not enough evidence.",
        ],
        examples: [
          {
            title: "One-sample z-test",
            steps: [
              "A machine fills bottles with mean $\\mu_0 = 500$ ml. A sample of $n=36$ gives $\\bar{x} = 496$, $\\sigma = 12$. Test $H_0: \\mu = 500$ vs $H_a: \\mu < 500$ at $\\alpha=0.05$.",
              "Test statistic: $z = (496-500)/(12/\\sqrt{36}) = -4/2 = -2$.",
              "$p$-value $= P(Z < -2) \\approx 0.0228$.",
              "Since $0.0228 < 0.05$, reject $H_0$. The machine is underfilling.",
            ],
          },
        ],
      },
      {
        title: "Type I and Type II errors",
        body: [
          "A Type I error is rejecting $H_0$ when it is true (false positive). $P(\\text{Type I}) = \\alpha$ (the significance level you chose).",
          "A Type II error is failing to reject $H_0$ when it is false (false negative). $P(\\text{Type II}) = \\beta$. Power $= 1 - \\beta$ is the probability of correctly detecting a real effect.",
          "Lowering $\\alpha$ reduces Type I errors but increases Type II errors. Increasing $n$ reduces both simultaneously by narrowing the sampling distribution.",
        ],
        eli5: [
          "Type I error: you alarm a fire drill when there's no fire (false alarm). Type II error: you don't alarm when there IS a fire (missed detection). Reducing false alarms makes you less likely to catch real fires, and vice versa. The only way to reduce both is to gather more information (larger $n$).",
        ],
      },
      {
        title: "t-tests",
        body: [
          "One-sample $t$-test: tests whether a population mean equals a specified value $\\mu_0$. Test statistic $t = (\\bar{x}-\\mu_0)/(s/\\sqrt{n})$ follows a $t$-distribution with $n-1$ degrees of freedom.",
          "Two-sample $t$-test: compares means of two independent groups. Paired $t$-test: compares means of two measurements on the same subjects (controls for subject-to-subject variation).",
          "Use the $t$-distribution (not $z$) whenever $\\sigma$ is unknown — which is almost always in practice. The $t$ distribution approaches $N(0,1)$ as $df \\to \\infty$.",
        ],
      },
      {
        title: "Practical vs. statistical significance",
        body: [
          "A result can be statistically significant ($p < \\alpha$) but practically unimportant. With large $n$, even tiny effects become significant.",
          "Effect size (e.g., Cohen's $d = (\\bar{x}-\\mu_0)/s$) measures the magnitude of the effect, independent of sample size. Always report effect size alongside $p$-values.",
          "Confidence intervals are more informative than $p$-values alone: they show both whether an effect is significant and how large it plausibly is.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Interpreting 'fail to reject $H_0$' as 'accept $H_0$.' Failing to reject only means the data is not strong enough to reject — it is not evidence that $H_0$ is true.",
      "Reporting only the $p$-value without the effect size or confidence interval. Statistical significance without practical significance is misleading.",
      "Using a $z$-test when $\\sigma$ is unknown. Always use the $t$-distribution when the population standard deviation is estimated from the data.",
      "Running many tests and only reporting significant ones (p-hacking). Each test has an $\\alpha$ chance of false positive; running many tests inflates the overall error rate.",
    ],
  },
  {
    topicId: "anova",
    title: "Analysis of Variance",
    intro: [
      "ANOVA extends the two-sample $t$-test to compare three or more group means simultaneously. Running multiple $t$-tests would inflate the Type I error rate; ANOVA controls it with a single $F$-test.",
      "The key insight is partitioning total variability: ANOVA asks whether the variability between groups is large relative to the variability within groups. If yes, at least one mean differs.",
      "One-way ANOVA handles one categorical factor; two-way ANOVA handles two factors and can detect interactions between them.",
    ],
    sections: [
      {
        title: "One-way ANOVA",
        body: [
          "One-way ANOVA tests $H_0: \\mu_1 = \\mu_2 = \\cdots = \\mu_k$ (all group means equal) against $H_a$: at least one mean differs.",
          "Total sum of squares: $SS_{\\text{total}} = SS_{\\text{between}} + SS_{\\text{within}}$. The $F$-statistic is $F = MS_{\\text{between}}/MS_{\\text{within}}$, where $MS = SS/df$.",
          "A large $F$ means the group means vary more than would be expected by chance. Compare to the $F$-distribution with $(k-1, N-k)$ degrees of freedom.",
        ],
        eli5: [
          "ANOVA asks: is the spread between group averages large compared to the spread within each group? If your groups' averages are far apart but individual scores within each group are tightly clustered, the $F$-statistic will be large and you'll reject the null hypothesis.",
        ],
      },
      {
        title: "Assumptions of ANOVA",
        body: [
          "Independence: observations within and across groups are independent.",
          "Normality: each group's data is approximately normally distributed. ANOVA is robust to mild violations when sample sizes are roughly equal.",
          "Homoscedasticity (equal variances): all groups have the same population variance $\\sigma^2$. Check with Levene's test or by examining residual plots.",
        ],
      },
      {
        title: "Multiple comparisons",
        body: [
          "Rejecting $H_0$ in ANOVA only says at least one mean differs — not which ones. Post-hoc tests identify specific differences while controlling the family-wise error rate.",
          "Tukey's Honest Significant Difference (HSD) is the most common: it tests all pairwise comparisons while maintaining $\\alpha$ across the family.",
          "The Bonferroni correction is simpler but more conservative: divide $\\alpha$ by the number of comparisons.",
        ],
      },
      {
        title: "Two-way ANOVA",
        body: [
          "Two-way ANOVA has two categorical factors ($A$ and $B$). It tests main effects of $A$, main effects of $B$, and the $A \\times B$ interaction.",
          "An interaction means the effect of factor $A$ depends on the level of factor $B$. Interactions take priority: if an interaction is significant, main effects must be interpreted with caution.",
          "Two-way ANOVA is more efficient than running separate one-way ANOVAs: it uses the same data to answer three questions simultaneously.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Running multiple $t$-tests instead of ANOVA. With $k$ groups and $\\binom{k}{2}$ pairwise tests at $\\alpha=0.05$, the chance of a false positive grows rapidly.",
      "Forgetting to run post-hoc tests after a significant $F$-test. ANOVA tells you that differences exist; post-hoc tests tell you where.",
      "Ignoring the homoscedasticity assumption. If group variances differ substantially, use Welch's ANOVA or a non-parametric alternative.",
      "Interpreting a non-significant interaction as 'no interaction.' Non-significance just means insufficient evidence; it does not prove independence of factors.",
    ],
  },
  {
    topicId: "nonparametric",
    title: "Non-Parametric Statistics",
    intro: [
      "Non-parametric tests make no assumption about the shape of the population distribution. They are the tool of choice when data is ordinal, heavily skewed, or when normality cannot be assumed.",
      "The chi-square tests handle categorical data: the goodness-of-fit test checks whether observed frequencies match a theoretical distribution; the test for independence checks whether two categorical variables are associated.",
      "Rank-based tests (Mann-Whitney U, Wilcoxon signed-rank) are non-parametric alternatives to $t$-tests. By converting data to ranks, they become robust to outliers and distributional assumptions.",
    ],
    sections: [
      {
        title: "Chi-square goodness-of-fit test",
        body: [
          "Tests $H_0$: the population follows a specified distribution. For each category $i$, compute $O_i$ (observed) and $E_i$ (expected under $H_0$). The test statistic is $\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}$.",
          "Under $H_0$, $\\chi^2$ follows a chi-square distribution with $k-1$ degrees of freedom ($k$ = number of categories; subtract additional estimated parameters).",
          "Condition: all expected counts $E_i \\geq 5$. Cells with very small expected counts should be merged.",
        ],
        eli5: [
          "Imagine rolling a die $600$ times. If it's fair, you expect $100$ of each face. The chi-square statistic adds up how far off each count is (squared and scaled). If the total is large, the die probably isn't fair.",
        ],
      },
      {
        title: "Chi-square test for independence",
        body: [
          "Uses a two-way contingency table to test $H_0$: two categorical variables are independent. Expected counts under independence: $E_{ij} = (\\text{row total}_i \\times \\text{col total}_j) / n$.",
          "Same test statistic: $\\chi^2 = \\sum \\frac{(O_{ij}-E_{ij})^2}{E_{ij}}$ with $(r-1)(c-1)$ degrees of freedom ($r$ rows, $c$ columns).",
          "Association does not imply causation. A significant result means the variables are dependent; it says nothing about which causes which.",
        ],
      },
      {
        title: "Mann-Whitney U and Wilcoxon tests",
        body: [
          "The Mann-Whitney U test compares two independent groups without assuming normality. It tests whether one group tends to have larger values than the other (effectively comparing medians or rank distributions).",
          "The Wilcoxon signed-rank test is the paired version: for matched pairs $(x_i, y_i)$, it tests whether the median difference is zero. It is the non-parametric equivalent of the paired $t$-test.",
          "Both tests are based on ranks, making them resistant to outliers and valid for ordinal data. They have slightly less power than the $t$-test when normality holds.",
        ],
        eli5: [
          "Instead of comparing the actual values, rank-based tests ask: 'if we line up everyone from smallest to largest, do Group A members tend to cluster higher in the ranking than Group B?' This ranking approach works regardless of whether the underlying values are normally distributed.",
        ],
      },
      {
        title: "When to use non-parametric tests",
        body: [
          "Use non-parametric tests when: the data is ordinal (e.g., Likert scales); the sample size is small and normality is suspect; or there are severe outliers that would distort parametric tests.",
          "With large samples and continuous data, parametric tests are usually robust enough (by CLT). Non-parametric tests are most valuable for small $n$.",
          "The trade-off: non-parametric tests lose some power (are less likely to detect real effects) compared to their parametric equivalents when the parametric assumptions are actually met.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Using chi-square when expected cell counts are below $5$. Merge categories or use Fisher's exact test instead.",
      "Confusing the chi-square test for independence with correlation. Chi-square detects association between categorical variables; correlation measures linear relationships between quantitative ones.",
      "Assuming non-parametric tests test the same null hypothesis as their parametric counterparts. The Mann-Whitney U tests the rank distribution, not necessarily the mean.",
      "Over-using non-parametric tests. When normality holds, parametric tests are more powerful. Reserve non-parametric tests for situations where parametric assumptions are clearly violated.",
    ],
  },
];
