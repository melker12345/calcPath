import type { ModuleContent } from "../types";

export const hypothesis_testingModule: ModuleContent = {
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
  };
