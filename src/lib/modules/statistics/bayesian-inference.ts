import type { ModuleContent } from "../types";

export const bayesianInferenceModule: ModuleContent = {
  topicId: "bayesian-inference",
  title: "Bayesian Inference",
  intro: [
    "Bayesian inference treats unknown parameters as random variables and updates beliefs using Bayes' theorem as new data arrives. It provides a coherent way to combine prior knowledge with observed data.",
    "The output is a full posterior distribution over possible parameter values rather than a single point estimate. This naturally gives uncertainty quantification and allows direct probability statements about parameters (e.g., 'the probability that the treatment effect is positive is 0.94').",
    "While computationally more demanding than classical methods, modern tools (MCMC, variational inference, Stan, PyMC) have made Bayesian modeling practical for a wide range of problems in science, medicine, and business.",
  ],
  sections: [
    {
      title: "Bayes' theorem revisited",
      section: "bayes",
      body: [
        "Bayes' theorem tells us how to update the probability of a hypothesis $H$ given data $D$: $P(H|D) = \\frac{P(D|H) P(H)}{P(D)}$.",
        "$P(H)$ is the prior probability — what we believed before seeing the data.",
        "$P(D|H)$ is the likelihood — how probable the observed data is under hypothesis $H$.",
        "$P(H|D)$ is the posterior probability — our updated belief after seeing the data.",
        "$P(D)$ is the marginal likelihood (evidence), which acts as a normalizing constant.",
      ],
      eli5: [
        "You have two coins: one fair, one double-headed. You pick one at random and flip it — heads. Bayes' theorem tells you the probability you picked the double-headed coin. Your prior was 50/50. The likelihood of heads is 1 for the double-headed coin and 0.5 for the fair coin. After seeing heads, your posterior belief shifts toward the double-headed coin.",
      ],
    },
    {
      title: "Prior, likelihood, posterior",
      section: "prior",
      body: [
        "The prior encodes knowledge or beliefs before seeing the data. It can be informative (based on previous studies) or non-informative (trying to let the data speak for itself).",
        "Conjugate priors are mathematically convenient because the posterior is in the same family as the prior (e.g., Beta prior for binomial likelihood gives Beta posterior).",
        "The choice of prior matters when data is scarce; with lots of data the posterior is dominated by the likelihood.",
        "Sensitivity analysis (trying different reasonable priors) is good practice in serious Bayesian work.",
      ],
    },
    {
      title: "Bayesian estimation and credible intervals",
      section: "estimation",
      body: [
        "Instead of a single point estimate, Bayesian inference gives the entire posterior distribution. Common summaries are the posterior mean, median, or mode (MAP).",
        "A 95% credible interval is an interval that contains 95% of the posterior probability mass. Unlike a frequentist confidence interval, you can say 'there is 95% probability that the true parameter lies in this interval' (given the model and data).",
        "Highest Posterior Density (HPD) intervals are the shortest intervals containing 95% probability.",
      ],
    },
    {
      title: "Bayesian hypothesis testing and model comparison",
      section: "testing",
      body: [
        "Bayes factors compare the evidence for two competing models: BF_{12} = P(data | M1) / P(data | M2).",
        "Unlike p-values, Bayes factors can provide evidence for the null hypothesis as well as against it.",
        "Bayesian model averaging accounts for model uncertainty by weighting predictions by the posterior probability of each model.",
        "Posterior probabilities of hypotheses can be computed directly when using proper priors.",
      ],
    },
    {
      title: "Computational methods",
      section: "computation",
      body: [
        "For all but the simplest models, the posterior cannot be computed in closed form. We use numerical methods.",
        "Markov Chain Monte Carlo (MCMC) methods (Metropolis-Hastings, Gibbs sampling, Hamiltonian Monte Carlo) generate samples from the posterior.",
        "Modern probabilistic programming languages (Stan, PyMC, Turing.jl) let you specify models in a high-level language and automatically run efficient sampling.",
        "Variational inference approximates the posterior with a simpler distribution that is easier to optimize — useful for very large datasets.",
      ],
    },
  ],
  examples: [
    {
      title: "Bayesian coin flip",
      steps: [
        "You flip a coin 10 times and get 8 heads. You want to estimate the probability $p$ of heads.",
        "Use a Beta(1,1) prior (uniform on [0,1]). The posterior is Beta(1+8, 1+2) = Beta(9,3).",
        "Posterior mean = 9/12 = 0.75. 95% credible interval is approximately (0.47, 0.93).",
        "The probability that $p > 0.5$ is the integral of the Beta(9,3) density from 0.5 to 1 ≈ 0.96.",
      ],
    },
  ],
  commonMistakes: [
    "Treating the prior as 'just a regularizer' without thinking about what information it actually encodes.",
    "Using an improper prior without checking that the posterior is proper.",
    "Interpreting a 95% credible interval as a frequentist confidence interval (or vice versa).",
    "Ignoring sensitivity to prior choice when sample size is small.",
    "Thinking Bayesian methods are always 'better' — they require more computational effort and careful prior specification.",
  ],
};