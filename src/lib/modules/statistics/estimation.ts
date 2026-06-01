import type { ModuleContent } from "../types";

export const estimationModule: ModuleContent = {
    topicId: "estimation",
    title: "Statistical Inference: Estimation",
    intro: [
      "Estimation is the process of using sample data to infer the value of an unknown population parameter. The two main tools are point estimates (a single best guess) and interval estimates (a range of plausible values).",
      "The sampling distribution tells us how a statistic varies from sample to sample. Understanding it is the key to constructing valid confidence intervals.",
      "Maximum Likelihood Estimation (MLE) provides a principled general-purpose method for finding the best-fitting parameter value given observed data.",
    ],
    sections: [
      {
        title: "Sampling distributions and standard error",
        section: "sampling-distribution",
        body: [
          "A sampling distribution is the probability distribution of a statistic (such as $\\bar{X}$) computed from all possible random samples of size $n$ from a population. It describes how the statistic varies from sample to sample.",
          "The standard error of the mean is $SE_{\\bar{X}} = \\sigma/\\sqrt{n}$, or estimated as $s/\\sqrt{n}$ when $\\sigma$ is unknown. It quantifies the precision of $\\bar{X}$ as an estimator of $\\mu$ — larger $n$ gives smaller $SE$ and therefore more precise estimates.",
          "By the Central Limit Theorem, $\\bar{X}$ is approximately $N(\\mu, \\sigma^2/n)$ for large $n$. This holds regardless of the shape of the population distribution, making normal-based inference broadly applicable.",
          "A statistic is an unbiased estimator of a parameter $\\theta$ if $E(\\hat{\\theta}) = \\theta$. The sample mean $\\bar{X}$ is unbiased for $\\mu$. The sample variance $s^2$ (with $n-1$) is unbiased for $\\sigma^2$.",
          "Mean Squared Error: $\\text{MSE}(\\hat{\\theta}) = \\text{Var}(\\hat{\\theta}) + [\\text{Bias}(\\hat{\\theta})]^2$. A good estimator minimises MSE — there is a bias-variance trade-off.",
        ],
        eli5: [
          "Imagine repeatedly drawing samples of size $n$ and computing the mean each time. You would get a slightly different mean every time, but they would cluster around the true $\\mu$. The standard error measures how tightly they cluster. The bigger the sample, the tighter the cluster.",
        ],
      },
      {
        title: "Point estimation and MLE",
        section: "mle",
        body: [
          "A point estimate is a single numerical value used as a best guess for a population parameter. Common examples: $\\bar{x}$ estimates $\\mu$; $s^2$ estimates $\\sigma^2$; $\\hat{p} = x/n$ estimates $p$.",
          "Maximum Likelihood Estimation (MLE) finds the parameter value $\\hat{\\theta}$ that maximises the likelihood function $L(\\theta) = \\prod_{i=1}^n f(x_i;\\theta)$ — the probability of observing the actual data, viewed as a function of $\\theta$.",
          "In practice, we maximise $\\ell(\\theta) = \\ln L(\\theta)$ (log-likelihood) which is easier to differentiate. Set $d\\ell/d\\theta = 0$ and solve. For a normal population, MLE gives $\\hat{\\mu}=\\bar{x}$ and $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum(x_i-\\bar{x})^2$ (note: MLE uses $n$, not $n-1$).",
          "MLE has excellent asymptotic properties: it is consistent, asymptotically efficient (achieves the Cramér-Rao lower bound), and asymptotically normal. For large samples it is the go-to estimation method.",
        ],
        eli5: [
          "MLE asks: given the data I observed, which parameter value would have made this data most likely? It's like tuning a radio — you turn the dial until the signal is clearest. The dial setting that gives the clearest signal is your maximum likelihood estimate.",
        ],
      },
      {
        title: "Confidence intervals",
        section: "confidence-intervals",
        body: [
          "A $100(1-\\alpha)\\%$ confidence interval provides a range of plausible values for an unknown parameter: $\\bar{x} \\pm z_{\\alpha/2}\\cdot SE$ for a known $\\sigma$, or $\\bar{x} \\pm t_{\\alpha/2,n-1}\\cdot(s/\\sqrt{n})$ when $\\sigma$ is estimated.",
          "Correct interpretation: if we were to repeat the sampling procedure many times, approximately $100(1-\\alpha)\\%$ of the resulting intervals would contain the true parameter. The interval either contains $\\mu$ or it does not — after construction, there is no probability to speak of.",
          "The margin of error $E = z^*\\cdot SE$ determines the half-width of the interval. To achieve a desired margin of error $E$, use $n = (z^*\\sigma/E)^2$.",
          "The $t$-distribution has heavier tails than the normal and is appropriate when $\\sigma$ is estimated from data. As degrees of freedom $df = n-1$ increases, the $t$-distribution converges to the standard normal. For $n \\geq 30$ the difference is minimal in practice.",
          "For a proportion $p$: $\\hat{p} \\pm z^*\\sqrt{\\hat{p}(1-\\hat{p})/n}$. Valid when $n\\hat{p}\\geq 10$ and $n(1-\\hat{p})\\geq 10$.",
        ],
        eli5: [
          "A $95\\%$ confidence interval is like saying: 'I used a method that catches the true value $95\\%$ of the time.' It's like fishing with a net that lands fish $95\\%$ of the time. This particular net either caught the fish or didn't — the $95\\%$ refers to the reliability of the net, not this specific cast.",
        ],
        examples: [
          {
            title: "95% t-interval for a mean",
            steps: [
              "$\\bar{x}=52$, $s=8$, $n=16$. Construct a $95\\%$ CI.",
              "$SE = 8/\\sqrt{16} = 2$.",
              "$t^*_{0.025,15} = 2.131$ (from $t$-table with $df=15$).",
              "CI: $52 \\pm 2.131(2) = 52 \\pm 4.262 = (47.74,\\; 56.26)$.",
              "Interpretation: we are $95\\%$ confident the true population mean falls between $47.74$ and $56.26$.",
            ],
          },
        ],
      },
      {
        title: "Type I and Type II errors",
        section: "errors",
        body: [
          "A Type I error (false positive, size $\\alpha$) occurs when $H_0$ is true but we reject it. We control this by choosing $\\alpha$ before testing.",
          "A Type II error (false negative, probability $\\beta$) occurs when $H_0$ is false but we fail to reject it. Power $= 1-\\beta$ is the probability of correctly detecting a real effect.",
          "Factors that increase power: larger sample size $n$ (reduces $SE$, making it easier to detect real differences); larger true effect size (bigger signal); larger $\\alpha$ (less strict rejection criterion); smaller $\\sigma$ (less variability).",
          "Sample size planning: choose $n$ to achieve a desired power (typically $80\\%$ or $90\\%$) at a specified effect size and significance level $\\alpha$.",
        ],
        eli5: [
          "Type I error: you shout 'fire!' when there is no fire (false alarm). Type II error: there is a fire but you say nothing (miss). To reduce false alarms, raise the bar for shouting fire ($\\alpha$ gets smaller) — but then you will miss more real fires. Only collecting more information (larger $n$) reduces both simultaneously.",
        ],
      },
      {
        title: "Practical vs. statistical significance",
        section: "p-value",
        body: [
          "Statistical significance ($p \\leq \\alpha$) means the data is unlikely under $H_0$. Practical significance means the effect is large enough to matter in the real world. These are independent: large samples make tiny effects statistically significant; small samples may miss large effects.",
          "Effect size measures the magnitude of an effect independently of sample size. Cohen's $d = (\\bar{x}-\\mu_0)/s$ for means; $r$ or $r^2$ for correlations; odds ratio for proportions. Always report effect size alongside $p$-values.",
          "Confidence intervals are more informative than $p$-values alone: they show both the direction, magnitude, and uncertainty of an estimate — not merely a binary decision.",
        ],
        eli5: [
          "With a huge sample, even a change of $0.001$ degrees in temperature becomes 'statistically significant' — but nobody cares about $0.001$ degrees. Statistical significance just means 'the data is very unlikely under $H_0$.' Practical significance asks the more important question: 'Does this actually matter?'",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Interpreting a $95\\%$ CI as '$95\\%$ probability the parameter is inside.' The parameter is fixed. The randomness is in the interval.",
      "Confusing 'fail to reject $H_0$' with 'accept $H_0$.' Failing to reject only means evidence is insufficient — it is not proof of $H_0$.",
      "Using a $z$-interval when $\\sigma$ is unknown and $n$ is small. Use the $t$-interval with $n-1$ degrees of freedom.",
      "Ignoring effect size and reporting only the $p$-value. A small $p$-value with a trivially small effect size is not a scientifically important finding.",
      "Claiming $p = 0.049$ is strong evidence and $p = 0.051$ is no evidence at all. The $p$-value is a continuous measure of evidence, not a binary threshold.",
    ],
  };
