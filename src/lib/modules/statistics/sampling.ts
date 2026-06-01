import type { ModuleContent } from "../types";

export const samplingModule: ModuleContent = {
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
        section: "pop-vs-sample",
        body: [
          "A population is the complete set of individuals or observations of interest. A parameter (e.g., $\\mu$, $\\sigma^2$, $p$) is a fixed numerical characteristic of the population — unknown and usually unknowable without a census.",
          "A sample is a subset of the population. A statistic (e.g., $\\bar{x}$, $s^2$, $\\hat{p}$) is computed from sample data. Statistics are observable but vary from sample to sample — they are random variables.",
          "A statistic $\\hat{\\theta}$ is an unbiased estimator of parameter $\\theta$ if $E(\\hat{\\theta}) = \\theta$. The sample mean $\\bar{X}$ is unbiased for $\\mu$. The sample variance $s^2 = \\frac{1}{n-1}\\sum(x_i-\\bar{x})^2$ is unbiased for $\\sigma^2$.",
          "Sampling design: simple random sampling (SRS) gives every sample of size $n$ equal probability. Stratified sampling divides the population into groups (strata) and draws SRSs from each, improving precision. Cluster sampling and systematic sampling are used when SRS is impractical.",
          "Bias in sampling: a convenience sample (whoever is available) or voluntary response sample systematically misrepresents the population. No amount of statistical analysis can fix a biased design — always randomise.",
        ],
        eli5: [
          "The population is the entire jar of marbles. The sample is the handful you grab. You want your handful to look like the full jar. Random sampling is the only way to make that likely — biased sampling is like always reaching to the top of the jar where red marbles float.",
        ],
      },
      {
        title: "The Law of Large Numbers",
        section: "lln",
        body: [
          "Weak Law of Large Numbers: for i.i.d. random variables $X_1, X_2, \\ldots$ with mean $\\mu$, the sample mean $\\bar{X}_n = \\frac{1}{n}\\sum_{i=1}^n X_i$ converges in probability to $\\mu$: for any $\\varepsilon > 0$, $P(|\\bar{X}_n - \\mu| > \\varepsilon) \\to 0$ as $n \\to \\infty$.",
          "The Strong Law of Large Numbers guarantees almost sure convergence: $P(\\bar{X}_n \\to \\mu) = 1$. Almost every sequence of i.i.d. observations has a time-average that converges to the true mean.",
          "The LLN justifies using observed frequencies as probability estimates, trusting large studies over small ones, and the general principle that more data gives better estimates.",
          "The LLN does not imply the 'gambler's fallacy.' After $10$ coin flips all landing heads, the next flip is still $50/50$. The LLN talks about the eventual average, not compensation of past outcomes.",
        ],
        eli5: [
          "Flip a fair coin $10$ times and you might get $7$ heads ($70\\%$). Flip $10{,}000$ times and you will get very close to $5{,}000$ heads ($50\\%$). The LLN says the average stabilises toward the truth as you collect more data. Past outcomes don't 'owe' you future results — each flip is still $50/50$.",
        ],
      },
      {
        title: "The Central Limit Theorem",
        section: "clt",
        body: [
          "Central Limit Theorem (CLT): if $X_1, \\ldots, X_n$ are i.i.d. with mean $\\mu$ and finite variance $\\sigma^2$, then the standardised mean $(\\bar{X}-\\mu)/(\\sigma/\\sqrt{n}) \\to N(0,1)$ in distribution as $n\\to\\infty$. Equivalently, $\\bar{X} \\approx N(\\mu, \\sigma^2/n)$ for large $n$.",
          "This is remarkable because the result holds regardless of the population's shape — whether it is skewed, bimodal, or uniform. The averaging process irons out all non-normality.",
          "The standard error of the mean is $SE = \\sigma/\\sqrt{n}$. Doubling $n$ reduces $SE$ by a factor of $\\sqrt{2}$, not $2$. To halve the standard error you need to quadruple the sample size.",
          "Rule of thumb: $n \\geq 30$ is often sufficient for the normal approximation to be good, but heavily skewed populations may require $n \\geq 100$ or more. Always check with a histogram of the data.",
          "The CLT also applies to sums: $S_n = \\sum X_i \\approx N(n\\mu, n\\sigma^2)$. And to proportions: $\\hat{p} = X/n \\approx N(p, p(1-p)/n)$ when $np \\geq 10$ and $n(1-p) \\geq 10$.",
        ],
        eli5: [
          "Here is the miracle: it doesn't matter what shape the population has. Pull samples of size $n$, compute the average each time, plot all those averages — they always form a bell curve for large enough $n$. The CLT is why normal distribution tools work across virtually every scientific field.",
        ],
        examples: [
          {
            title: "CLT probability for a sample mean",
            steps: [
              "Population: $\\mu=100$, $\\sigma=20$, $n=64$.",
              "By CLT: $\\bar{X}\\sim N(100, 20^2/64)=N(100, 6.25)$, so $SE=2.5$.",
              "$P(\\bar{X}>105) = P(Z > (105-100)/2.5) = P(Z > 2) \\approx 0.0228$.",
              "Interpretation: there is only a $2.3\\%$ chance that a sample of size $64$ has a mean exceeding $105$ when the true mean is $100$.",
            ],
          },
        ],
      },
      {
        title: "Sampling distribution of the proportion",
        section: "sampling-distribution",
        body: [
          "The sample proportion $\\hat{p} = X/n$ (where $X$ counts successes in $n$ Bernoulli trials) estimates the population proportion $p$.",
          "Mean: $E(\\hat{p}) = p$ (unbiased). Standard error: $SE(\\hat{p}) = \\sqrt{p(1-p)/n}$.",
          "By the CLT: $\\hat{p} \\approx N(p, p(1-p)/n)$ when $np \\geq 10$ and $n(1-p) \\geq 10$.",
          "The sampling distribution of the difference $\\hat{p}_1 - \\hat{p}_2$ (from two independent samples) is approximately $N(p_1-p_2, p_1(1-p_1)/n_1 + p_2(1-p_2)/n_2)$. This is used for two-proportion $z$-tests and $z$-intervals.",
        ],
        eli5: [
          "If you survey $n$ people and count how many say yes, the proportion who say yes ($\\hat{p}$) is your estimate of the true population proportion $p$. The sampling distribution tells you how much $\\hat{p}$ will bounce around from survey to survey — and for large $n$ it bounces around in a perfectly normal pattern.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing $\\sigma$ (population standard deviation) with $SE = \\sigma/\\sqrt{n}$ (standard error of the mean). The SE is the standard deviation of the sampling distribution, always smaller than $\\sigma$.",
      "Applying the CLT with a small $n$ from a heavily skewed population. Check the histogram before assuming normality.",
      "The gambler's fallacy: thinking past outcomes will 'balance out' future ones. The LLN applies to long-run averages, not short-run compensation.",
      "Forgetting the CLT applies to $\\bar{X}$, not to individual observations. Individual $X_i$ values remain non-normal if the population is non-normal.",
      "Applying the proportion CLT approximation when $np < 10$ or $n(1-p) < 10$. Use exact binomial methods instead.",
    ],
  };
