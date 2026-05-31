import type { ModuleContent } from "../types";

export const discrete_distributionsModule: ModuleContent = {
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
        section: "expected-value",
        body: [
          "A random variable $X$ is a function from the sample space to the real numbers. Discrete random variables take a countable set of values (integers, fractions). Continuous random variables take any value in an interval.",
          "The probability mass function (PMF) of a discrete $X$ gives $P(X=x_i)$ for each possible value. The PMF must satisfy $P(X=x_i)\\geq 0$ and $\\sum_i P(X=x_i) = 1$.",
          "The expected value (population mean) is $\\mu = E(X) = \\sum_i x_i P(X=x_i)$. It is the long-run average over infinitely many independent repetitions. It does not need to be a possible value of $X$ — a fair die has $E(X)=3.5$.",
          "The variance of $X$ is $\\sigma^2 = \\text{Var}(X) = E[(X-\\mu)^2] = E(X^2)-[E(X)]^2$. The standard deviation $\\sigma = \\sqrt{\\text{Var}(X)}$ is in the same units as $X$.",
          "Key properties: $E(aX+b)=aE(X)+b$, $\\text{Var}(aX+b) = a^2\\text{Var}(X)$. For independent variables: $E(X+Y)=E(X)+E(Y)$ always, and $\\text{Var}(X+Y)=\\text{Var}(X)+\\text{Var}(Y)$ only when $X$ and $Y$ are independent.",
        ],
        eli5: [
          "The expected value is what you would get on average if you played the game an enormous number of times. Roll a fair die a million times and the average will be very close to $3.5$, even though $3.5$ is never an actual outcome. It's the 'gravity center' of the distribution.",
          "Variance measures how unpredictable the outcomes are. Low variance means the outcomes cluster tightly around the mean. High variance means you get wildly different outcomes each time.",
        ],
        examples: [
          {
            title: "Expected value and variance of a PMF",
            steps: [
              "A game pays \\$10 with probability $0.1$, \\$5 with probability $0.3$, and $-$\\$2 with probability $0.6$.",
              "$E(X) = 10(0.1)+5(0.3)+(-2)(0.6) = 1+1.5-1.2 = 1.3$.",
              "$E(X^2) = 100(0.1)+25(0.3)+4(0.6) = 10+7.5+2.4 = 19.9$.",
              "$\\text{Var}(X) = 19.9 - 1.3^2 = 19.9-1.69 = 18.21$. $\\sigma = \\sqrt{18.21}\\approx 4.27$.",
            ],
          },
        ],
      },
      {
        title: "The binomial distribution",
        section: "binomial",
        body: [
          "The binomial distribution models the number of successes $X$ in exactly $n$ independent trials, each with the same success probability $p$. It arises in coin flips, quality control, clinical trials, and polling.",
          "Requirements (BINS): Binary outcomes only, Independent trials, Number of trials $n$ is fixed in advance, Same probability $p$ for each trial.",
          "PMF: $P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}$, for $k=0,1,\\ldots,n$. The $\\binom{n}{k}$ term counts the number of ways to arrange exactly $k$ successes among $n$ trials.",
          "Mean: $\\mu = np$. Standard deviation: $\\sigma = \\sqrt{np(1-p)}$. When $p=0.5$ the distribution is symmetric; when $p\\neq 0.5$ it is skewed toward $0$ (if $p<0.5$) or toward $n$ (if $p>0.5$).",
          "Cumulative probabilities $P(X\\leq k)$ are computed by summing the PMF or using tables/software. For $P(X\\geq k)$, use the complement: $1-P(X\\leq k-1)$.",
        ],
        eli5: [
          "The binomial distribution counts 'how many times did I succeed out of $n$ tries?' Each try is a coin flip — it either works or it doesn't, with the same probability each time. The binomial formula accounts for all the different orders in which those successes could have occurred.",
        ],
        examples: [
          {
            title: "Binomial probability — exactly $k$ successes",
            steps: [
              "A fair coin is flipped $5$ times. Find $P(X=3)$.",
              "$\\binom{5}{3} = 10$, $p = 0.5$, $1-p=0.5$.",
              "$P(X=3) = 10\\cdot(0.5)^3\\cdot(0.5)^2 = 10\\cdot 0.125\\cdot 0.25 = 0.3125$.",
              "Also: $\\mu=5(0.5)=2.5$, $\\sigma=\\sqrt{5(0.5)(0.5)}=\\sqrt{1.25}\\approx 1.12$.",
            ],
          },
        ],
      },
      {
        title: "The Poisson distribution",
        section: "poisson",
        body: [
          "The Poisson distribution models the count of independent events in a fixed interval of time, area, or volume, when events occur at a constant average rate $\\lambda > 0$.",
          "PMF: $P(X=k) = e^{-\\lambda}\\lambda^k/k!$, for $k=0,1,2,\\ldots$. The Poisson distribution has no upper bound — in principle any count is possible.",
          "Both the mean and variance equal $\\lambda$: $E(X)=\\text{Var}(X)=\\lambda$. A Poisson random variable is characterised entirely by $\\lambda$.",
          "Typical applications: calls arriving at a call centre per hour, photons hitting a detector per second, mutations in a DNA sequence per million base pairs, accidents at an intersection per month.",
          "Poisson as a limit of the binomial: when $n$ is large, $p$ is small, and $np=\\lambda$ is moderate, the binomial $B(n,p)$ is well-approximated by Poisson($\\lambda$). This is the rare-event approximation.",
        ],
        eli5: [
          "The Poisson distribution answers: 'how many times will a rare event happen in a fixed window?' If buses arrive randomly at a rate of $3$ per hour, the Poisson($3$) distribution gives you the probability of seeing $0, 1, 2, 3, \\ldots$ buses in the next hour.",
        ],
        examples: [
          {
            title: "Poisson probability",
            steps: [
              "Emails arrive at rate $\\lambda=4$ per hour. Find $P(X=2)$ — exactly $2$ emails in one hour.",
              "$P(X=2) = e^{-4}\\cdot 4^2/2! = e^{-4}\\cdot 16/2 = 8e^{-4} \\approx 8(0.01832) \\approx 0.147$.",
              "Also: $P(X=0) = e^{-4}\\approx 0.018$. There is only a $1.8\\%$ chance of zero emails.",
            ],
          },
        ],
      },
      {
        title: "The geometric and negative binomial distributions",
        section: "discrete-distributions",
        body: [
          "The geometric distribution models the number of trials until the first success. $P(X=k) = (1-p)^{k-1}p$. Mean $= 1/p$. The geometric distribution is memoryless: $P(X>m+n|X>m) = P(X>n)$.",
          "The negative binomial distribution generalises: it counts the number of trials needed to achieve exactly $r$ successes. Mean $= r/p$, variance $= r(1-p)/p^2$.",
          "The hypergeometric distribution models sampling without replacement from a finite population. Used when the population is small enough that each draw changes the probabilities — for example, selecting $5$ cards from a deck without replacing them.",
        ],
        eli5: [
          "The geometric distribution answers: 'how many times do I have to try until I succeed?' If each attempt has a $20\\%$ success rate, the geometric distribution tells you the probabilities of succeeding on the first try, second try, third try, and so on.",
        ],
      },
      {
        title: "Choosing the right distribution",
        section: "discrete-distributions",
        body: [
          "Binomial: fixed $n$ trials, each independent with probability $p$, counting the number of successes.",
          "Poisson: counting rare, independent events in a fixed window; no upper bound on the count; mean and variance are equal.",
          "Geometric: counting the number of trials until the first success; memoryless.",
          "Hypergeometric: like the binomial but sampling without replacement from a finite population; used when the population is small relative to the sample.",
          "Decision guide: if $n$ is large, $p$ is small, and $np$ is moderate, the Poisson approximation to the binomial is accurate and simpler to compute.",
        ],
        eli5: [
          "Binomial = 'I flip this coin exactly $n$ times, how many heads?' Poisson = 'Calls arrive randomly, how many in the next hour?' Geometric = 'I keep flipping until I get a head, how many flips?' Each distribution is the right tool for a specific type of counting question.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Applying the binomial formula when trials are not independent or the sample is drawn without replacement from a small population (use hypergeometric instead).",
      "Forgetting that Poisson requires events to be independent and the rate to be constant — a traffic jam violates both.",
      "Confusing $\\lambda$ (Poisson rate) with $p$ (binomial success probability). They measure different things even though both parameterise how often something happens.",
      "Computing $P(X \\geq k)$ directly when it is easier to use $1-P(X \\leq k-1)$.",
      "Using the binomial formula for continuous data. The binomial is for counts; for continuous data use normal or other continuous distributions.",
    ],
  };
