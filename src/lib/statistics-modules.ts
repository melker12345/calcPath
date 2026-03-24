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
          "The mean (arithmetic average) is $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$. It uses every data point, which makes it sensitive to extreme values (outliers). One unusually large value can pull the mean far from the typical observation.",
          "The median is the middle value when data is sorted in order. For an even number of observations, it is the average of the two middle values. The median is resistant to outliers: adding one extreme value does not change it much. This makes it the preferred measure of center for skewed data such as income, house prices, or reaction times.",
          "The mode is the most frequently occurring value. A dataset can be unimodal (one mode), bimodal (two modes), or multimodal. The mode is the only measure of center applicable to categorical data — you can find the most common hair colour, but a 'mean hair colour' is meaningless.",
          "Relationship to skewness: for a right-skewed (positively skewed) distribution, the mean is greater than the median, which is greater than the mode. For a left-skewed distribution the order reverses. For a perfectly symmetric distribution, all three coincide.",
          "The weighted mean: $\\bar{x}_w = \\frac{\\sum w_i x_i}{\\sum w_i}$. Used when different observations have different importances — for example, computing a course grade where assignments, midterm, and final carry different percentage weights.",
        ],
        eli5: [
          "You and four friends have different amounts of candy: $2, 3, 7, 7, 9$. The mean ($5.6$) is how much each would get if you pooled and shared equally. The median ($7$) is what the middle person has when you line up from least to most. The mode ($7$) is what the most people have.",
          "The mean is like a balance point: put weights at each value and the mean is where the seesaw balances. One very heavy weight (an outlier) yanks the balance point toward it. The median ignores extreme values and just asks 'who is in the exact middle?'",
        ],
        examples: [
          {
            title: "Mean, median, mode",
            steps: [
              "Data: $\\{3, 7, 7, 2, 9\\}$.",
              "Mean: $(3+7+7+2+9)/5 = 28/5 = 5.6$.",
              "Sorted: $\\{2,3,7,7,9\\}$. Median: middle value $= 7$.",
              "Mode: $7$ (appears twice, all others once).",
              "The mean ($5.6$) and median ($7$) differ — the value $2$ pulls the mean down slightly.",
            ],
          },
        ],
      },
      {
        title: "Measures of spread",
        body: [
          "The range $= \\max - \\min$ is the simplest measure of spread. It only uses two data points and is badly distorted by a single outlier. If the maximum salary in a sample is a CEO at \\$5,000,000, the range tells you almost nothing about the typical spread.",
          "Variance measures the average squared deviation from the mean. Population variance: $\\sigma^2 = \\frac{1}{N}\\sum_{i=1}^N (x_i-\\mu)^2$. Sample variance uses $n-1$ in the denominator: $s^2 = \\frac{1}{n-1}\\sum_{i=1}^n(x_i-\\bar{x})^2$. The $n-1$ correction (Bessel's correction) makes $s^2$ an unbiased estimator of $\\sigma^2$.",
          "Standard deviation $s = \\sqrt{s^2}$ restores the original units. A standard deviation of $10$ kg means the typical observation is about $10$ kg away from the mean. Unlike variance, you can directly compare the standard deviation to the data values.",
          "The interquartile range $\\text{IQR} = Q_3 - Q_1$ captures the spread of the middle $50\\%$ of the data. It is unaffected by the most extreme values and is the natural measure of spread to pair with the median.",
          "The coefficient of variation $\\text{CV} = s/\\bar{x}$ expresses the standard deviation as a fraction of the mean. It allows comparing spread between datasets measured on different scales — e.g., heights of adults vs. heights of buildings.",
        ],
        eli5: [
          "Standard deviation tells you how scattered the data is around the mean. Small $\\sigma$ means everyone is close to the average (a tight cluster). Large $\\sigma$ means values are all over the place. Think of the mean as the centre of a target and $\\sigma$ as the average distance from the bullseye.",
          "Why divide by $n-1$ for sample variance? When you estimate the mean from the same data, the deviations from $\\bar{x}$ are systematically a tiny bit smaller than deviations from the true $\\mu$. Dividing by $n-1$ instead of $n$ corrects for that bias.",
        ],
        examples: [
          {
            title: "Sample variance and standard deviation",
            steps: [
              "Data: $\\{2, 4, 4, 4, 5, 5, 7, 9\\}$, $n=8$, $\\bar{x}=5$.",
              "Squared deviations: $(2-5)^2=9$, $(4-5)^2=1\\times 3=3$, $(5-5)^2=0\\times 2=0$, $(7-5)^2=4$, $(9-5)^2=16$.",
              "Sum of squared deviations $= 9+3+0+4+16 = 32$.",
              "Sample variance: $s^2 = 32/(8-1) = 32/7 \\approx 4.57$.",
              "Sample standard deviation: $s = \\sqrt{4.57} \\approx 2.14$.",
            ],
          },
        ],
      },
      {
        title: "Data visualization",
        body: [
          "Histograms group continuous data into bins (intervals) and plot the frequency or density of each bin. They reveal the shape of a distribution: symmetric, right-skewed, left-skewed, bimodal, or uniform. The shape guides which summary statistics are appropriate.",
          "Box plots (box-and-whisker plots) display five numbers: minimum, $Q_1$, median, $Q_3$, maximum, and mark outliers as individual points. They make it easy to compare distributions across multiple groups, and they immediately reveal skewness and outliers.",
          "Dot plots and stem-and-leaf plots show every individual value and are useful for small datasets (fewer than ~30 observations). They preserve more information than histograms.",
          "Scatter plots show the joint distribution of two quantitative variables. The pattern — linear, curved, no pattern, tight, loose — guides the choice of model and whether correlation is appropriate.",
          "Skewness and the mean-median relationship: in a right-skewed distribution the mean exceeds the median (the long tail of high values pulls the mean right). In a left-skewed distribution the mean is below the median. For symmetric distributions mean $\\approx$ median.",
        ],
        eli5: [
          "A histogram is like sorting coloured marbles into trays by size: you instantly see which sizes are most common and how the sizes spread out. A box plot is like a quick summary card showing: here is the lowest score, here is the bottom quarter, here is the middle, here is the top quarter, and here is the top. Outliers get their own dots.",
        ],
      },
      {
        title: "Percentiles and the five-number summary",
        body: [
          "The $p$-th percentile is the value below which approximately $p\\%$ of observations fall. The median is the $50$th percentile; $Q_1$ is the $25$th, $Q_3$ is the $75$th.",
          "The five-number summary $\\{\\min, Q_1, \\text{median}, Q_3, \\max\\}$ concisely describes the center and spread of a distribution and is the foundation of the box plot.",
          "$\\text{IQR} = Q_3 - Q_1$ measures the spread of the central half of the data. The standard outlier rule: a value is a (mild) outlier if it lies below $Q_1 - 1.5\\,\\text{IQR}$ or above $Q_3 + 1.5\\,\\text{IQR}$, and an extreme outlier if it exceeds $Q_1 - 3\\,\\text{IQR}$ or $Q_3 + 3\\,\\text{IQR}$.",
          "Percentiles are used in standardised testing (your score falls in the $85$th percentile), growth charts (a child's height is in the $60$th percentile), and risk management (the $99$th percentile of losses).",
        ],
        eli5: [
          "If you score in the $90$th percentile on a test, $90\\%$ of test-takers scored below you. You didn't necessarily get $90\\%$ of the questions right — percentile rank is about where you stand relative to other people, not your raw score.",
        ],
      },
      {
        title: "Choosing the right summary",
        body: [
          "Symmetric distributions with no outliers: use mean and standard deviation. They use all the data and have convenient mathematical properties.",
          "Skewed distributions or data with outliers: use median and IQR. These are resistant to the extreme values that distort the mean and standard deviation.",
          "Always visualise your data before computing summaries. Summary statistics can be deceptive: Anscombe's quartet shows four datasets with identical means, variances, and correlations but completely different shapes.",
          "For categorical or ordinal data, the mode is the only sensible measure of center. Report counts and proportions rather than means.",
        ],
        eli5: [
          "Mean and standard deviation work beautifully for nice, symmetric data. But if your data has extreme outliers (like salaries including a billionaire), they are misleading. In that case, use median and IQR — they just describe the typical middle without being dragged off by extremes.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing population variance ($\\div N$) with sample variance ($\\div (n-1)$). In virtually all real applications you have a sample, so use $n-1$.",
      "Reporting the mean for heavily skewed data. For income, house prices, or any right-skewed data, the median better represents the typical value.",
      "Forgetting to sort data before computing the median or quartiles.",
      "Interpreting standard deviation as a percentage. It has the same units as the raw data. A standard deviation of $5$ kg means typical values deviate by $5$ kg from the mean, not $5\\%$.",
      "Using the range as the primary measure of spread. One outlier distorts it completely. Prefer IQR or standard deviation.",
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
          "The sample space $S$ is the set of all possible outcomes. An event $A$ is any subset of $S$. The probability of $A$ must satisfy $0 \\leq P(A) \\leq 1$, $P(S) = 1$, and for mutually exclusive events $P(A_1 \\cup A_2 \\cup \\cdots) = P(A_1)+P(A_2)+\\cdots$.",
          "For equally likely outcomes: $P(A) = |A|/|S|$ — the number of outcomes in $A$ divided by the total number of outcomes. This classical definition only applies when all outcomes are equally probable.",
          "The complement rule: $P(A^c) = 1 - P(A)$. Often it is easier to compute the probability of the complement and subtract. For example, the probability of at least one success is $1 - P(\\text{zero successes})$.",
          "The addition rule: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. The intersection is subtracted because it is counted twice. For mutually exclusive events $A \\cap B = \\emptyset$, so $P(A \\cup B) = P(A) + P(B)$.",
          "The multiplication rule for independent events: $P(A \\cap B) = P(A) \\cdot P(B)$. For dependent events the correct rule is $P(A \\cap B) = P(A) \\cdot P(B|A)$.",
        ],
        eli5: [
          "Probability is like assigning percentages to outcomes that must all add up to $100\\%$. The complement rule says: if there is a $30\\%$ chance of rain, there is a $70\\%$ chance of no rain — they must sum to $100\\%$.",
          "The addition rule corrects for double-counting. If $40\\%$ of people like cats and $30\\%$ like dogs and $10\\%$ like both, the fraction liking cats or dogs is $40+30-10 = 60\\%$.",
        ],
        examples: [
          {
            title: "Applying the addition rule",
            steps: [
              "A card is drawn from a standard deck. Find $P(\\text{heart or face card})$.",
              "$P(\\text{heart}) = 13/52$, $P(\\text{face card}) = 12/52$, $P(\\text{heart face card}) = 3/52$.",
              "$P(\\text{heart or face card}) = 13/52 + 12/52 - 3/52 = 22/52 = 11/26 \\approx 0.423$.",
            ],
          },
        ],
      },
      {
        title: "Conditional probability and independence",
        body: [
          "The conditional probability of $A$ given $B$ is $P(A|B) = P(A \\cap B)/P(B)$. It re-scales probability to the reduced sample space where $B$ is known to have occurred.",
          "Events $A$ and $B$ are independent if $P(A|B) = P(A)$ — knowing $B$ gives no information about $A$. Equivalently, $P(A \\cap B) = P(A)\\cdot P(B)$.",
          "Dependence arises when knowing the outcome of one event changes the probability of another. Drawing two cards without replacement: the second draw depends on the first because the deck has changed.",
          "Independence is a statement about probability, not causation. Two unrelated events (coin flip, stock price) can be modelled as independent even if there is no physical connection. Two related events might nevertheless be statistically independent.",
          "For multiple independent events: $P(A_1 \\cap A_2 \\cap \\cdots \\cap A_n) = P(A_1)\\cdot P(A_2)\\cdots P(A_n)$. This is the basis for computing probabilities of sequences of independent trials.",
        ],
        eli5: [
          "Conditional probability is 'narrowing the world.' $P(\\text{rain}|\\text{cloudy})$ means: among all days that are cloudy, what fraction also gets rain? You have narrowed your focus to cloudy days only.",
          "Independence means one event tells you nothing about the other. Coin flips are independent — the fifth flip is no more likely to be heads because the last four were tails. The coin has no memory.",
        ],
      },
      {
        title: "Bayes' theorem",
        body: [
          "Bayes' theorem reverses conditional probabilities: $P(B|A) = \\frac{P(A|B)\\cdot P(B)}{P(A)}$. The denominator $P(A)$ is computed via the law of total probability.",
          "In Bayesian terminology: $P(B)$ is the prior (your belief before seeing data), $P(A|B)$ is the likelihood (how probable the data is if $B$ is true), and $P(B|A)$ is the posterior (updated belief after seeing data).",
          "Medical testing: even a highly accurate test has a low positive predictive value when the disease is rare. If prevalence is $1\\%$ and the false positive rate is $5\\%$, only about $17\\%$ of positive tests are true positives. This counter-intuitive result follows directly from Bayes' theorem.",
          "Bayes' theorem is the foundation of spam filters, medical diagnosis systems, and Bayesian machine learning. Any time you want to update a probability based on new evidence, you are implicitly applying Bayes.",
        ],
        eli5: [
          "Bayes' theorem asks: 'Given that I've seen this evidence, how should I update my beliefs?' A test says you have a rare disease — but most people who test positive on a rare-disease test are actually healthy (because the disease is so rare). Bayes tells you exactly how to account for that.",
        ],
        examples: [
          {
            title: "Medical test — positive predictive value",
            steps: [
              "Disease prevalence: $P(D)=0.01$. Sensitivity (true positive rate): $P(+|D)=0.99$. False positive rate: $P(+|D^c)=0.05$.",
              "Total probability of a positive test: $P(+) = P(+|D)P(D)+P(+|D^c)P(D^c) = 0.99(0.01)+0.05(0.99) = 0.0099+0.0495 = 0.0594$.",
              "$P(D|+) = 0.0099/0.0594 \\approx 0.167$.",
              "Only $16.7\\%$ of positive tests are true positives — because the disease is so rare that false positives swamp true positives.",
            ],
          },
        ],
      },
      {
        title: "Counting principles",
        body: [
          "The multiplication principle: if a procedure consists of $k$ steps, step $i$ has $n_i$ choices, and the choices are independent, then the total number of outcomes is $n_1\\times n_2\\times\\cdots\\times n_k$.",
          "Permutations count ordered arrangements of $k$ objects chosen from $n$: $P(n,k) = n!/(n-k)!$. The order of selection matters — $ABC$ is different from $BAC$.",
          "Combinations count unordered selections: $\\binom{n}{k} = n!/(k!(n-k)!)$. The order does not matter — $\\{A,B,C\\}$ is the same as $\\{C,A,B\\}$.",
          "The key question: does order matter? Arranging people in seats $\\to$ permutations. Choosing a committee $\\to$ combinations.",
          "The binomial coefficient $\\binom{n}{k}$ appears in the binomial theorem: $(a+b)^n = \\sum_{k=0}^n \\binom{n}{k} a^k b^{n-k}$, and directly in the binomial probability formula $P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$.",
        ],
        eli5: [
          "Permutations: how many ways can $10$ runners finish first, second, and third? Order matters — Silver and Bronze are different. Combinations: how many ways can you pick $3$ friends from $10$ for a group photo? Order doesn't matter — $\\{A,B,C\\}$ is the same group regardless of who steps in front.",
        ],
      },
      {
        title: "Law of total probability",
        body: [
          "If events $B_1,B_2,\\ldots,B_n$ partition $S$ (mutually exclusive and exhaustive), then for any event $A$: $P(A) = \\sum_{i=1}^n P(A|B_i)P(B_i)$.",
          "This is the denominator in Bayes' theorem. Computing $P(A)$ by conditioning on an exhaustive set of cases makes many calculations tractable.",
          "Example: a factory has three machines producing $50\\%$, $30\\%$, and $20\\%$ of output, with defect rates $2\\%$, $3\\%$, and $5\\%$. The overall defect rate is $P(\\text{defect}) = 0.02(0.50)+0.03(0.30)+0.05(0.20) = 0.01+0.009+0.01 = 0.029 = 2.9\\%$.",
        ],
        eli5: [
          "The law of total probability says: to find the overall probability of $A$, break the world into exhaustive cases ($B_1, B_2, \\ldots$), find the probability of $A$ in each case, then weight them by how likely each case is. Like computing an average grade by weighting each section's score by its proportion of the class.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting to subtract the overlap in $P(A\\cup B)$ when events are not mutually exclusive.",
      "Confusing mutually exclusive with independent. Two mutually exclusive events with positive probability are never independent — if one occurs, the other cannot.",
      "Swapping $P(A|B)$ and $P(B|A)$. These are generally different. Bayes' theorem is precisely the tool to convert between them.",
      "Applying $P(A \\cap B)=P(A)P(B)$ without checking independence. For dependent events, use $P(A \\cap B)=P(A)P(B|A)$.",
      "Using permutations when combinations are needed. Always ask: does swapping the order of selection produce a different outcome?",
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
        title: "Sampling distributions and standard error",
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
