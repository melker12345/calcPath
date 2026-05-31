import type { Topic } from "./shared-types";
import type { ModuleContent, ModuleSection, WorkedExample } from "./modules/types";

import {
  descriptiveModule,
  probabilityModule,
  discreteDistributionsModule,
  estimationModule,
  regressionModule
} from "./modules/statistics";

export type { ModuleContent, ModuleSection, WorkedExample };

export const modules: ModuleContent[] = [
  descriptiveModule,  // extracted
  probabilityModule,  // extracted
  discreteDistributionsModule,  // extracted
  estimationModule,  // extracted
  regressionModule,  // extracted
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
        section: "pdf",
        body: [
          "A probability density function (PDF) $f(x)$ satisfies $f(x) \\geq 0$ and $\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$. Probabilities are areas under the curve: $P(a \\leq X \\leq b) = \\int_a^b f(x)\\,dx$. The PDF height is not a probability — it is a density (probability per unit length).",
          "For a continuous distribution, $P(X = c) = \\int_c^c f(x)\\,dx = 0$ for any single point $c$. This is why $P(X \\leq b) = P(X < b)$ for continuous distributions: adding or removing a single endpoint changes nothing.",
          "The cumulative distribution function (CDF) is $F(x) = P(X \\leq x) = \\int_{-\\infty}^x f(t)\\,dt$. It is non-decreasing from $0$ to $1$, right-continuous, and gives the probability of being at or below $x$.",
          "The relationship between PDF and CDF: $f(x) = F'(x)$ (derivative of CDF is PDF) and $F(x) = \\int_{-\\infty}^x f(t)\\,dt$ (antiderivative of PDF is CDF).",
          "Quantiles and percentiles: the $p$-th quantile $x_p$ satisfies $F(x_p) = p$. For the standard normal, $x_{0.975} = 1.96$ — this is where $97.5\\%$ of the distribution lies below.",
        ],
        eli5: [
          "A PDF is like a topographic map of probability. The height at any point shows how densely packed the probability is there. But the actual probability of a region is the volume (area) under the curve over that region — not the height at a single point.",
          "The CDF is the running total: $F(x)$ tells you the total probability that has accumulated by the point $x$. It starts at $0$ (nothing accumulated yet) and ends at $1$ (all probability accounted for).",
        ],
      },
      {
        title: "The normal distribution",
        section: "normal",
        body: [
          "The normal (Gaussian) distribution $N(\\mu, \\sigma^2)$ has PDF $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)$. It is symmetric about $\\mu$; the inflection points are at $\\mu \\pm \\sigma$.",
          "The empirical (68-95-99.7) rule: $P(\\mu-\\sigma \\leq X \\leq \\mu+\\sigma) \\approx 0.6827$; $P(\\mu-2\\sigma \\leq X \\leq \\mu+2\\sigma) \\approx 0.9545$; $P(\\mu-3\\sigma \\leq X \\leq \\mu+3\\sigma) \\approx 0.9973$.",
          "Standardisation: any $X\\sim N(\\mu,\\sigma^2)$ is transformed to $Z = (X-\\mu)/\\sigma \\sim N(0,1)$. Standard normal probabilities are read from $z$-tables or computed with software.",
          "The normal distribution is additive: if $X\\sim N(\\mu_1,\\sigma_1^2)$ and $Y\\sim N(\\mu_2,\\sigma_2^2)$ are independent, then $X+Y\\sim N(\\mu_1+\\mu_2,\\sigma_1^2+\\sigma_2^2)$.",
          "Why normal? By the Central Limit Theorem, the sum (or average) of many independent, identically distributed random variables is approximately normal regardless of the underlying distribution. This explains the normal's ubiquity in nature and statistics.",
        ],
        eli5: [
          "The bell curve is the shape that emerges whenever many small, independent random factors add together. Heights, measurement errors, test scores — they all pile up near the average and thin out toward the extremes. That's the normal distribution, and it appears everywhere precisely because of this 'sum of many small effects' mechanism.",
        ],
        examples: [
          {
            title: "Normal probability using z-scores",
            steps: [
              "Exam scores: $X\\sim N(70, 10^2)$. Find $P(60 \\leq X \\leq 85)$.",
              "Standardise: $z_1 = (60-70)/10 = -1$, $z_2 = (85-70)/10 = 1.5$.",
              "$P(-1 \\leq Z \\leq 1.5) = \\Phi(1.5) - \\Phi(-1) = 0.9332 - 0.1587 = 0.7745$.",
              "About $77.5\\%$ of students score between $60$ and $85$.",
            ],
          },
        ],
      },
      {
        title: "The exponential and uniform distributions",
        section: "exponential",
        body: [
          "The exponential distribution $\\text{Exp}(\\lambda)$: $f(x) = \\lambda e^{-\\lambda x}$ for $x \\geq 0$. Mean $= 1/\\lambda$, variance $= 1/\\lambda^2$. It models the waiting time between events in a Poisson process at rate $\\lambda$.",
          "Memoryless property: $P(X > s+t \\mid X > s) = P(X > t)$. The past waiting time provides no information about the future wait. This is the continuous analogue of the geometric distribution's memorylessness.",
          "The uniform distribution $U(a,b)$: $f(x) = 1/(b-a)$ for $a \\leq x \\leq b$. Mean $= (a+b)/2$, variance $= (b-a)^2/12$. Every sub-interval of equal length is equally probable.",
          "The chi-squared distribution $\\chi^2_k$ is the sum of $k$ squared independent standard normals. Used in goodness-of-fit tests and inference about variances. Mean $= k$, variance $= 2k$.",
          "The $t$-distribution with $\\nu$ degrees of freedom is the ratio $Z/\\sqrt{V/\\nu}$ where $Z\\sim N(0,1)$ and $V\\sim\\chi^2_\\nu$ independently. It is bell-shaped but heavier-tailed than the normal, converging to $N(0,1)$ as $\\nu\\to\\infty$.",
        ],
        eli5: [
          "Exponential: you're waiting for a bus that comes randomly at an average rate of once every $10$ minutes. The exponential distribution models how long you wait. The memoryless property says: having already waited $5$ minutes tells you nothing — the next bus is still just as far away as when you started.",
          "Uniform: you pick a random number between $0$ and $1$. Every tiny interval of the same width has the same probability. Completely flat.",
        ],
        examples: [
          {
            title: "Exponential waiting time",
            steps: [
              "Calls arrive at rate $\\lambda = 2$ per minute. What is $P(\\text{wait} > 1\\text{ min})$?",
              "$P(X > 1) = 1 - F(1) = 1 - (1 - e^{-2}) = e^{-2} \\approx 0.135$.",
              "About $13.5\\%$ chance of waiting more than $1$ minute.",
              "Mean wait: $1/\\lambda = 0.5$ min.",
            ],
          },
        ],
      },
      {
        title: "Normal approximation to the binomial",
        section: "approximation",
        body: [
          "When $n$ is large and $p$ is not extreme, $X\\sim\\text{Binomial}(n,p)$ can be approximated by $N(np,\\, np(1-p))$.",
          "Validity condition: $np \\geq 10$ and $n(1-p) \\geq 10$. When $p$ is close to $0$ or $1$, use the Poisson approximation instead.",
          "Continuity correction: because the binomial is discrete, $P(X = k)$ is approximated by $P(k-0.5 \\leq X \\leq k+0.5)$ using the normal. For $P(X \\leq k)$, use $P(Z \\leq (k+0.5-np)/\\sqrt{np(1-p)})$.",
        ],
        eli5: [
          "For large $n$, a binomial histogram starts to look like a smooth bell curve. The normal approximation exploits this: instead of summing many binomial terms, you compute one area under the normal curve. The continuity correction patches up the gap between the 'staircase' (binomial) and the 'smooth curve' (normal).",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Computing $P(X = c)$ for a continuous random variable. Point probabilities are always zero. Always specify an interval.",
      "Reading the PDF height as a probability. $f(x)$ can exceed $1$; it is a density, not a probability.",
      "Applying the normal approximation when $np < 10$ or $n(1-p) < 10$. Use exact binomial or Poisson instead.",
      "Forgetting the $z$-table gives left-tail probabilities. For $P(X > x)$, use $1 - \\Phi(z)$. For $P(a < X < b)$, use $\\Phi(z_b) - \\Phi(z_a)$.",
      "Confusing the rate $\\lambda$ with the mean in the exponential distribution. Mean $= 1/\\lambda$, not $\\lambda$.",
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
        section: "basic",
        body: [
        "The null hypothesis $H_0$ is the default claim (no effect, no difference, status quo). The alternative $H_a$ is the claim the investigator wants to support. We begin by assuming $H_0$ is true and ask: how surprising is the observed data under this assumption?",
        "The test statistic measures how many standard errors the sample result is from the value specified by $H_0$. For a mean: $z = (\\bar{x}-\\mu_0)/(\\sigma/\\sqrt{n})$ (if $\\sigma$ known) or $t = (\\bar{x}-\\mu_0)/(s/\\sqrt{n})$ (if $\\sigma$ estimated).",
        "The $p$-value is $P(X \\geq x_\\text{obs} \\mid H_0)$ — the probability of observing data at least as extreme as yours, assuming $H_0$ is true. Small $p$-values ($p \\leq \\alpha$) lead to rejection of $H_0$; large $p$-values do not.",
        "One-sided vs. two-sided tests: $H_a: \\mu > \\mu_0$ is right-sided (one-tailed, $p = P(Z > z_\\text{obs})$); $H_a: \\mu < \\mu_0$ is left-sided; $H_a: \\mu \\neq \\mu_0$ is two-sided ($p = 2P(Z > |z_\\text{obs}|)$). Choose the direction of $H_a$ before collecting data.",
        "Equivalence of tests and intervals: reject $H_0: \\mu = \\mu_0$ at level $\\alpha$ (two-sided) if and only if the $(1-\\alpha)\\times 100\\%$ confidence interval for $\\mu$ does not contain $\\mu_0$. Confidence intervals and tests are dual procedures."
        ],
        eli5: [
          "Hypothesis testing is like a criminal trial. $H_0$ is 'innocent until proven guilty.' The $p$-value is the probability of seeing evidence this strong (or stronger) if the defendant really is innocent. If that probability is very small — below $\\alpha$ — you convict (reject $H_0$). If not, you acquit — but that doesn't mean the defendant is innocent, just that the evidence wasn't strong enough.",
        ],
        examples: [
          {
            title: "One-sample z-test (two-sided)",
            steps: [
              "A machine fills bottles. Claimed mean: $\\mu_0=500$ ml, known $\\sigma=12$ ml. Sample of $n=36$ gives $\\bar{x}=496$ ml. Test $H_0: \\mu=500$ vs $H_a: \\mu\\neq 500$ at $\\alpha=0.05$.",
              "$z = (496-500)/(12/\\sqrt{36}) = -4/2 = -2$.",
              "$p$-value $= 2P(Z < -2) = 2(0.0228) = 0.0456$.",
              "Since $0.0456 < 0.05$, reject $H_0$. Evidence suggests the machine is not filling to $500$ ml.",
              "CI check: $496 \\pm 1.96(2) = (492.1,\\, 499.9)$. Does not contain $500$ — consistent with rejection.",
            ],
          },
        ],
      },
      {
        title: "Type I and Type II errors",
        section: "errors",
        body: [
          "Type I error ($\\alpha$): rejecting $H_0$ when it is true (false positive). By choosing $\\alpha$ you directly control the probability of this error. Common choices are $\\alpha = 0.05$, $0.01$, or $0.10$ depending on the consequences of false rejection.",
          "Type II error ($\\beta$): failing to reject $H_0$ when it is false (false negative). $\\beta$ is not directly controlled by $\\alpha$ — it depends on $n$, the true effect size, and $\\sigma$.",
          "Power $= 1 - \\beta$: the probability of correctly detecting a real effect when it exists. Power increases with larger $n$, larger true effect size, larger $\\alpha$, and smaller $\\sigma$. The conventional target is $80\\%$ power.",
          "The $\\alpha$-$\\beta$ trade-off: for fixed $n$, lowering $\\alpha$ (stricter rejection) increases $\\beta$ (more missed effects). Increasing $n$ is the only way to improve power without inflating $\\alpha$.",
          "Sample size calculation: for a one-sample $z$-test at significance $\\alpha$ and power $1-\\beta$, $n = (z_{\\alpha/2}+z_\\beta)^2\\sigma^2/\\delta^2$, where $\\delta = \\mu_a - \\mu_0$ is the detectable difference.",
        ],
        eli5: [
          "Think of a smoke alarm. Type I error: it goes off when there is no fire (annoying false alarm). Type II error: there is a fire but it stays silent (catastrophic miss). You want both errors to be rare. Making the alarm more sensitive ($\\alpha$ larger) catches more fires but also triggers more false alarms. The only way to get both right is a better alarm with more sensors ($n$ larger).",
        ],
      },
      {
        title: "The t-test family",
        section: "t-test",
        body: [
          "One-sample $t$-test: $H_0: \\mu = \\mu_0$, test statistic $t = (\\bar{x}-\\mu_0)/(s/\\sqrt{n}) \\sim t_{n-1}$ under $H_0$. Used when $\\sigma$ is unknown — which is essentially always.",
          "Two-sample (independent) $t$-test: compares $\\mu_1$ and $\\mu_2$. Test statistic $t = (\\bar{x}_1-\\bar{x}_2)/\\sqrt{s_1^2/n_1+s_2^2/n_2}$ (Welch's version, does not assume equal variances). Degrees of freedom estimated by the Welch-Satterthwaite formula.",
          "Paired $t$-test: for matched pairs $(x_i, y_i)$, compute differences $d_i = x_i - y_i$ and apply a one-sample $t$-test on $d_i$. More powerful than two-sample when pairs are correlated — it removes between-subject variability.",
          "The $z$-test uses $\\sigma$ known; the $t$-test estimates $\\sigma$ with $s$. For $n \\geq 30$ the difference is negligible in practice. For small $n$, the heavier tails of the $t$-distribution properly account for the additional uncertainty in estimating $\\sigma$.",
        ],
        eli5: [
          "One-sample $t$: 'Is my sample's mean different from a specific value?' Two-sample $t$: 'Do these two groups have different means?' Paired $t$: 'Are before/after measurements different?' Use paired when you can link observations one-to-one — it gives more statistical power.",
        ],
        examples: [
          {
            title: "Paired t-test",
            steps: [
              "Blood pressure before and after treatment for $3$ patients. Differences $d_i$: $-3, -5, -4$.",
              "$\\bar{d} = -4$. $s_d = \\sqrt{(1+1+0)/2} = 1$.",
              "$t = -4/(1/\\sqrt{3}) \\approx -6.93$, $df=2$.",
              "$p < 0.05$. Strong evidence treatment lowers blood pressure.",
            ],
          },
        ],
      },
      {
        title: "Chi-square test for a proportion and goodness-of-fit",
        section: "chi-square",
        body: [
          "The chi-square goodness-of-fit test checks whether observed category counts match a hypothesised distribution. $\\chi^2 = \\sum (O_i - E_i)^2/E_i$ with $k-1$ degrees of freedom ($k$ = number of categories).",
          "The one-sample proportion $z$-test: $H_0: p = p_0$, test statistic $z = (\\hat{p}-p_0)/\\sqrt{p_0(1-p_0)/n}$. Valid when $np_0 \\geq 10$ and $n(1-p_0) \\geq 10$.",
          "Two-proportion $z$-test: $z = (\\hat{p}_1-\\hat{p}_2)/SE$, where $SE = \\sqrt{\\hat{p}(1-\\hat{p})(1/n_1+1/n_2)}$ using the pooled estimate $\\hat{p} = (x_1+x_2)/(n_1+n_2)$ under $H_0: p_1=p_2$.",
        ],
        eli5: [
          "The proportion $z$-test asks: 'Is the fraction of successes in my sample far enough from my hypothesised value $p_0$ to be surprising?' A $z$-score of $-2$ means the observed proportion is $2$ standard errors below $p_0$ — which, under a normal approximation, happens only $2.3\\%$ of the time by chance.",
        ],
      },
      {
        title: "Multiple testing and p-hacking",
        section: "p-value",
        body: [
          "If you run $m$ independent tests each at level $\\alpha$, the probability of at least one false positive is $1 - (1-\\alpha)^m$. For $m=20$ and $\\alpha=0.05$, this is $1 - 0.95^{20} \\approx 0.64$ — a $64\\%$ chance of at least one spurious significant result.",
          "The Bonferroni correction: to keep the family-wise error rate at $\\alpha$, use $\\alpha/m$ for each individual test. It is conservative (too strict when tests are positively correlated).",
          "The False Discovery Rate (FDR): the Benjamini-Hochberg procedure controls the expected fraction of false rejections among all rejections. Less conservative than Bonferroni, preferred for exploratory work.",
          "p-hacking: running many analyses and selectively reporting significant ones. It inflates the Type I error rate and is a major cause of the replication crisis in science.",
        ],
        eli5: [
          "If you test $20$ hypotheses at $\\alpha=0.05$, on average one will be 'significant' just by chance even if none of them are really true. Multiple testing correction is the fix — you demand stronger evidence for each test to keep the overall false-alarm rate at $5\\%$.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Interpreting 'fail to reject $H_0$' as evidence that $H_0$ is true. Absence of evidence is not evidence of absence.",
      "Reporting only the $p$-value without an effect size or confidence interval. A $p$-value of $0.001$ tells you the effect is real; a confidence interval tells you how large it is.",
      "Using a $z$-test when $\\sigma$ is unknown. Use the $t$-distribution whenever $\\sigma$ is estimated from the data.",
      "Choosing the direction of $H_a$ after seeing the data ('data snooping'). The alternative hypothesis must be specified before data collection.",
      "Running many tests without correction and cherry-picking significant results (p-hacking). Apply Bonferroni or FDR correction for multiple comparisons.",
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
        section: "f-test",
        body: [
          "One-way ANOVA tests $H_0: \\mu_1 = \\mu_2 = \\cdots = \\mu_k$ (all $k$ group means are equal) against $H_a$: at least one pair of means differs. It replaces the multiple $t$-test approach, which would inflate the Type I error rate.",
          "Partitioning variability: $SS_{\\text{total}} = SS_{\\text{between}} + SS_{\\text{within}}$. $SS_{\\text{between}} = \\sum_j n_j(\\bar{x}_j - \\bar{x})^2$ measures how much group means vary around the grand mean. $SS_{\\text{within}} = \\sum_j \\sum_i (x_{ij}-\\bar{x}_j)^2$ measures variability within each group.",
          "The $F$-statistic: $F = MS_{\\text{between}}/MS_{\\text{within}}$ where $MS = SS/df$. $df_{\\text{between}} = k-1$, $df_{\\text{within}} = N-k$ (total observations $N$, groups $k$). Under $H_0$, $F \\sim F_{k-1,\\,N-k}$.",
          "Interpretation: a large $F$ means the between-group variation is large relative to within-group noise — the group means differ more than chance would predict. Reject $H_0$ if $F > F_{\\alpha, k-1, N-k}$ (critical value from $F$-table).",
          "The ANOVA table summarises the decomposition: Source, SS, df, MS, $F$, $p$-value. Each row represents one source of variability.",
        ],
        eli5: [
          "ANOVA asks: is the spread between the group averages bigger than the typical spread within each group? If you have three fertiliser treatments and the plants' heights are very different across groups but quite consistent within each group, $F$ will be large and you'll conclude the fertiliser type matters.",
        ],
        examples: [
          {
            title: "One-way ANOVA computation",
            steps: [
              "Three groups ($k=3$, $n_j=4$ each, $N=12$). Group means: $\\bar{x}_1=5$, $\\bar{x}_2=8$, $\\bar{x}_3=6$. Grand mean $\\bar{x}=19/3\\approx 6.33$.",
              "$SS_{\\text{between}} = 4[(5-6.33)^2+(8-6.33)^2+(6-6.33)^2] = 4[1.77+2.79+0.11] = 4(4.67) = 18.67$. $df_{\\text{between}}=2$.",
              "Suppose $SS_{\\text{within}}=27$. $df_{\\text{within}}=9$.",
              "$MS_{\\text{between}}=18.67/2=9.33$. $MS_{\\text{within}}=27/9=3$.",
              "$F=9.33/3=3.11$. Compare to $F_{0.05,\\,2,\\,9}=4.26$. Since $3.11<4.26$, fail to reject $H_0$.",
            ],
          },
        ],
      },
      {
        title: "Assumptions of ANOVA",
        section: "assumptions",
        body: [
          "Independence: all observations are independent within and across groups. Violated by repeated measures on the same subjects (use repeated-measures ANOVA instead).",
          "Normality: each group's population is approximately normally distributed. ANOVA is robust to moderate violations when group sizes are equal and $n_j \\geq 5$. Check with Q-Q plots of residuals.",
          "Homoscedasticity (equal variances): all groups share the same variance $\\sigma^2$. Check with Levene's test or by comparing the largest to smallest sample standard deviation (ratio $\\leq 2$ is a common rule of thumb). Welch's one-way ANOVA does not require equal variances.",
          "If assumptions are seriously violated, consider transforming the data (e.g., log-transform for right-skewed data) or using the Kruskal-Wallis test (the non-parametric alternative to one-way ANOVA).",
        ],
        eli5: [
          "ANOVA needs the data to be independent (no repeated measures), roughly bell-shaped in each group (normality), and spread about the same in each group (equal variances). It is fairly forgiving of mild violations when group sizes are balanced and roughly similar.",
        ],
      },
      {
        title: "Post-hoc tests and multiple comparisons",
        section: "post-hoc",
        body: [
          "A significant $F$-test tells you at least one mean differs — not which pairs. Post-hoc tests identify specific differences while controlling the family-wise error rate (FWER).",
          "Tukey's HSD (Honest Significant Difference): tests all $\\binom{k}{2}$ pairwise comparisons and controls the FWER at $\\alpha$ exactly. It is the most commonly used post-hoc method for balanced designs.",
          "Bonferroni correction: for $m$ comparisons, use $\\alpha/m$ for each test. Simple and widely applicable, but more conservative (lower power) than Tukey's when $m$ is large.",
          "Scheffé's method: allows any contrast (not just pairwise) while controlling FWER. Most conservative but most flexible.",
          "Planned contrasts: if specific comparisons are hypothesised in advance (before seeing data), they can be tested at level $\\alpha$ without correction. Only pre-specified comparisons qualify.",
        ],
        eli5: [
          "A significant $F$-test is like knowing 'someone in this class got a very different grade than the others' — but you don't know who. Post-hoc tests then check each pair of groups to find which ones are actually different, while making sure the overall chance of a false alarm stays at $5\\%$.",
        ],
      },
      {
        title: "Two-way ANOVA",
        section: "two-way",
        body: [
          "Two-way ANOVA has two categorical factors $A$ (with $a$ levels) and $B$ (with $b$ levels). It tests three hypotheses: the main effect of $A$, the main effect of $B$, and the $A\\times B$ interaction.",
          "An interaction $A\\times B$ means the effect of $A$ on the response depends on the level of $B$ (and vice versa). When an interaction is significant, interpret main effects cautiously — they may be misleading averages of varying effects.",
          "The total SS is partitioned: $SS_{\\text{total}} = SS_A + SS_B + SS_{AB} + SS_{\\text{error}}$. Each has an associated $F$-ratio and $p$-value.",
          "Two-way ANOVA with replication (more than one observation per cell) is needed to estimate $SS_{\\text{error}}$ and test the interaction. Without replication, you must assume no interaction exists.",
          "Balanced designs (equal cell sizes) simplify computation and interpretation; unbalanced designs require more care with the order of entering terms (Type I vs. Type III sums of squares).",
        ],
        eli5: [
          "Two-way ANOVA asks three questions at once: Does factor $A$ matter? Does factor $B$ matter? Does the combination of $A$ and $B$ matter in a way that's more than just their individual effects? Interactions are the surprising case: factor $A$ helps women but hurts men, for example. Main effects alone would miss that.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Running multiple pairwise $t$-tests instead of ANOVA. With $k=5$ groups and $10$ tests at $\\alpha=0.05$, FWER $\\approx 40\\%$.",
      "Stopping at a significant $F$ without running post-hoc tests. You need post-hoc comparisons to identify which groups differ.",
      "Ignoring a significant interaction and interpreting only main effects. If $A\\times B$ is significant, main effects can be misleading.",
      "Violating the homoscedasticity assumption without correction. Use Welch's ANOVA or the Kruskal-Wallis test when variances differ substantially.",
      "Claiming a non-significant interaction proves the factors are independent. Non-significance only means insufficient evidence for an interaction.",
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
        section: "chi-square",
        body: [
          "The goodness-of-fit test checks whether observed category frequencies match a hypothesised distribution. For $k$ categories with observed counts $O_i$ and expected counts $E_i = n\\cdot p_i$ (where $p_i$ are the hypothesised probabilities), the test statistic is $\\chi^2 = \\sum_{i=1}^k \\frac{(O_i-E_i)^2}{E_i}$.",
          "Under $H_0$, $\\chi^2 \\sim \\chi^2_{k-1}$ (degrees of freedom $= k-1$; subtract one more for each parameter estimated from the data, e.g., if $\\mu$ and $\\sigma$ are estimated for a normal fit).",
          "The test is always right-tailed: a large $\\chi^2$ means the observed counts deviate substantially from expected. A small $\\chi^2$ (not significant) means the data is consistent with $H_0$.",
          "Validity condition: all expected counts $E_i \\geq 5$. If some are too small, merge adjacent categories or use the exact multinomial test.",
          "Applications: testing whether a die is fair, whether genetic ratios follow Mendelian predictions, or whether a sample comes from a specified distribution.",
        ],
        eli5: [
          "Roll a die $600$ times. If it's fair, you expect $100$ of each face. The $\\chi^2$ statistic sums up how far off each actual count is from $100$, scaled by $100$. A large sum means the die is probably loaded; a small sum means the counts are consistent with fairness.",
        ],
        examples: [
          {
            title: "Goodness-of-fit for a fair die",
            steps: [
              "Roll a die $120$ times. Observed counts: $\\{25, 17, 15, 23, 19, 21\\}$. $H_0$: fair die ($p_i=1/6$ for all $i$).",
              "Expected: $E_i = 120/6 = 20$ for each face.",
              "$\\chi^2 = \\frac{(25-20)^2}{20}+\\frac{(17-20)^2}{20}+\\frac{(15-20)^2}{20}+\\frac{(23-20)^2}{20}+\\frac{(19-20)^2}{20}+\\frac{(21-20)^2}{20}$",
              "$= \\frac{25+9+25+9+1+1}{20} = \\frac{70}{20} = 3.5$. $df=5$.",
              "$\\chi^2_{0.05,5}=11.07$. Since $3.5 < 11.07$, fail to reject $H_0$. The data is consistent with a fair die.",
            ],
          },
        ],
      },
      {
        title: "Chi-square test for independence",
        section: "chi-square",
        body: [
          "A two-way contingency table displays the joint frequencies of two categorical variables. The test of independence asks $H_0$: the two variables are independent (knowing one gives no information about the other).",
          "Under independence, the expected count in cell $(i,j)$ is $E_{ij} = (\\text{row}_i \\text{ total}) \\times (\\text{col}_j \\text{ total})/n$. The test statistic is $\\chi^2 = \\sum_{i,j} (O_{ij}-E_{ij})^2/E_{ij}$ with $(r-1)(c-1)$ degrees of freedom.",
          "The chi-square test detects association but not direction or causation. For a $2\\times 2$ table, the odds ratio or relative risk quantifies the strength of association beyond just significance.",
          "Fisher's exact test: for small samples where $\\chi^2$ is unreliable (expected counts $< 5$), compute the exact probability of the observed table and all more extreme ones. It is exact regardless of sample size.",
          "The $\\chi^2$ test for independence is equivalent to the $z$-test for comparing two proportions in a $2\\times 2$ table: $z^2 = \\chi^2$.",
        ],
        eli5: [
          "You survey men and women about their coffee preference (tea or coffee). A contingency table records the counts. The test asks: does gender have anything to do with the drink preference? If men and women prefer coffee at the same rate, the variables are independent and $\\chi^2$ will be small.",
        ],
        examples: [
          {
            title: "Chi-square test for independence",
            steps: [
              "Contingency table (Gender vs. Preference): Coffee: Men $30$, Women $20$; Tea: Men $10$, Women $40$. $n=100$.",
              "Row totals: Coffee $50$, Tea $50$. Column totals: Men $40$, Women $60$.",
              "Expected counts: $E_{\\text{Men,Coffee}} = 50(40)/100=20$; $E_{\\text{Women,Coffee}} = 50(60)/100=30$; $E_{\\text{Men,Tea}} = 20$; $E_{\\text{Women,Tea}} = 30$.",
              "$\\chi^2 = (30-20)^2/20 + (20-30)^2/30 + (10-20)^2/20 + (40-30)^2/30 = 5+3.33+5+3.33=16.67$.",
              "$df=(2-1)(2-1)=1$. $\\chi^2_{0.05,1}=3.84$. Since $16.67>3.84$, reject $H_0$. Gender and drink preference are associated.",
            ],
          },
        ],
      },
      {
        title: "Rank-based tests: Mann-Whitney and Wilcoxon",
        section: "rank-tests",
        body: [
          "The Mann-Whitney U test (Wilcoxon rank-sum test) is the non-parametric alternative to the two-sample $t$-test. It tests whether one group tends to produce larger values than the other — formally, whether $P(X_1 > X_2) = 0.5$.",
          "Procedure: combine both groups, rank all observations, sum the ranks for each group. The test statistic $U = R_1 - n_1(n_1+1)/2$ where $R_1$ is the rank sum for group $1$.",
          "The Wilcoxon signed-rank test is the paired version. Compute differences $d_i = x_i - y_i$, rank their absolute values, and compare the sum of positive ranks to the sum of negative ranks. It is the non-parametric alternative to the paired $t$-test.",
          "Rank-based tests are resistant to outliers because they use only the ordering of observations, not their actual values. A single extreme outlier changes only one rank.",
          "Efficiency: when the normal distribution holds, the Mann-Whitney U test has about $95.5\\%$ efficiency relative to the $t$-test (i.e., it needs about $5\\%$ more observations to achieve the same power). For non-normal data, it can be more powerful than the $t$-test.",
        ],
        eli5: [
          "Instead of comparing actual test scores between two teaching methods, rank all students from $1$ (lowest score) to $n$ (highest score). Then ask: do students from Method A tend to have higher ranks? By using ranks instead of raw values, you don't need to assume anything about the distribution of scores.",
        ],
      },
      {
        title: "Kruskal-Wallis and Spearman correlation",
        section: "spearman",
        body: [
          "The Kruskal-Wallis test is the non-parametric equivalent of one-way ANOVA. It tests whether $k$ independent groups have the same distribution (equivalently, the same median). It ranks all $N$ observations and compares rank sums across groups.",
          "Test statistic: $H = \\frac{12}{N(N+1)}\\sum_{j=1}^k \\frac{R_j^2}{n_j} - 3(N+1)$, where $R_j$ is the rank sum for group $j$. Under $H_0$, $H \\approx \\chi^2_{k-1}$.",
          "If Kruskal-Wallis is significant, use pairwise Mann-Whitney tests with Bonferroni correction for post-hoc comparisons.",
          "Spearman's rank correlation $r_s$: compute ranks of $x$ and $y$ separately, then apply the Pearson correlation formula to the ranks. It measures monotone (not just linear) relationships and is robust to outliers and non-normality.",
        ],
        eli5: [
          "Kruskal-Wallis is ANOVA with ranks: instead of comparing the actual group means, it compares the average rank positions of each group. Spearman correlation is Pearson correlation with ranks: instead of asking 'do $x$ and $y$ increase together linearly?', it asks 'do the rankings of $x$ and $y$ increase together?'",
        ],
      },
      {
        title: "When to use non-parametric tests",
        section: "nonparametric",
        body: [
          "Use non-parametric tests when: the data is ordinal (e.g., satisfaction ratings on a $1$–$5$ scale); the sample size is small and normality cannot be assumed; there are severe outliers that resist transformation; or the outcome is inherently rank-based.",
          "With large samples and continuous data, parametric tests are usually robust by the CLT. Non-parametric tests are most valuable for small $n$ with non-normal data.",
          "Power trade-off: when parametric assumptions hold, non-parametric tests have somewhat lower power (need larger $n$ to detect the same effect). When assumptions are violated, non-parametric tests are often more powerful.",
          "Parametric vs. non-parametric summary: $t$-test $\\leftrightarrow$ Mann-Whitney U; paired $t$-test $\\leftrightarrow$ Wilcoxon signed-rank; one-way ANOVA $\\leftrightarrow$ Kruskal-Wallis; Pearson $r$ $\\leftrightarrow$ Spearman $r_s$.",
        ],
        eli5: [
          "Non-parametric tests are your fall-back when you can't trust the bell-curve assumption. They're less picky — they work with ranks and counts rather than raw values — but they pay a small price in power when the normal assumption actually holds.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Using chi-square when expected cell counts are below $5$. Merge adjacent categories or use Fisher's exact test.",
      "Confusing the chi-square test for independence with the Pearson correlation. Chi-square tests association between categorical variables; correlation measures linear association between quantitative ones.",
      "Thinking the Mann-Whitney U test the same null hypothesis as the $t$-test. It tests stochastic dominance (which group tends to be larger), not equality of means.",
      "Over-using non-parametric tests. When normality holds and $n$ is large, parametric tests are more powerful. Reserve non-parametric tests for situations where parametric assumptions clearly fail.",
      "Applying the Kruskal-Wallis test without post-hoc comparisons after a significant result. Like ANOVA, a significant $H$ only says the groups differ — you need pairwise tests to say which ones.",
    ],
  },
];
