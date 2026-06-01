import type { ModuleContent } from "../types";

export const probabilityModule: ModuleContent = {
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
        section: "basic",
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
        section: "conditional",
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
        section: "bayes",
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
        section: "counting",
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
        section: "total",
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
  };
