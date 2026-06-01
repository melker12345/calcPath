import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const bayesianInferenceProblems: Problem[] = [
  p({ id: "bayes-bayes-1", topicId: "bayesian-inference", section: "bayes", type: "mcq", difficulty: "easy",
    prompt: "In Bayes' theorem, P(H|D) is called the:",
    answer: "Posterior probability",
    choices: ["Prior probability", "Likelihood", "Posterior probability", "Marginal likelihood"],
    explanation: "Step 1: Bayes' theorem: Posterior = (Likelihood × Prior) / Evidence. P(H|D) is the posterior. Final answer: Posterior probability." }),

  p({ id: "bayes-prior-1", topicId: "bayesian-inference", section: "prior", type: "mcq", difficulty: "easy",
    prompt: "A conjugate prior for the binomial likelihood is the:",
    answer: "Beta distribution",
    choices: ["Normal distribution", "Beta distribution", "Uniform distribution", "Gamma distribution"],
    explanation: "Step 1: Beta prior + Binomial likelihood → Beta posterior (conjugate). Final answer: Beta distribution." }),

  p({ id: "bayes-est-1", topicId: "bayesian-inference", section: "estimation", type: "numeric", difficulty: "medium",
    prompt: "With a Beta(1,1) prior and 7 heads in 10 flips, what is the posterior mean for p?",
    answer: "0.667",
    explanation: "Step 1: Posterior = Beta(1+7, 1+3) = Beta(8,4). Mean = 8/(8+4) = 8/12 ≈ 0.667. Final answer: 0.667." }),

  p({ id: "bayes-test-1", topicId: "bayesian-inference", section: "testing", type: "mcq", difficulty: "medium",
    prompt: "A Bayes factor BF_{12} > 1 means:",
    answer: "The data support Model 1 more than Model 2",
    choices: [
      "Model 1 is true",
      "The data support Model 1 more than Model 2",
      "Model 2 has higher prior probability",
      "The p-value is significant",
    ],
    explanation: "Step 1: BF_{12} = P(data|M1)/P(data|M2). >1 favors M1. Final answer: The data support Model 1 more than Model 2." }),

  p({ id: "bayes-comp-1", topicId: "bayesian-inference", section: "computation", type: "mcq", difficulty: "easy",
    prompt: "The main purpose of MCMC methods in Bayesian inference is to:",
    answer: "Generate samples from the posterior distribution",
    choices: [
      "Maximize the likelihood",
      "Generate samples from the posterior distribution",
      "Compute the prior",
      "Find the mode of the data",
    ],
    explanation: "Step 1: MCMC algorithms (Metropolis, Gibbs, HMC) produce samples approximately distributed according to the posterior. Final answer: Generate samples from the posterior distribution." }),

  // Additional Bayesian questions
  p({ id: "bayes-prior-2", topicId: "bayesian-inference", section: "prior", type: "mcq", difficulty: "medium",
    prompt: "A non-informative prior for a location parameter is often:",
    answer: "A flat (improper uniform) prior",
    choices: [
      "A Beta(1,1) prior",
      "A flat (improper uniform) prior",
      "A very strong informative prior",
      "A Jeffreys prior for the mean",
    ],
    explanation: "Step 1: For location parameters, a flat prior is commonly used as 'non-informative'. Final answer: A flat (improper uniform) prior." }),

  p({ id: "bayes-est-2", topicId: "bayesian-inference", section: "estimation", type: "numeric", difficulty: "medium",
    prompt: "With a Normal(0,1) prior and data giving a likelihood that is Normal(2, 0.5²) for the mean, the posterior mean is pulled toward:",
    answer: "0 (the prior mean)",
    choices: [
      "The data mean only",
      "0 (the prior mean)",
      "The midpoint between prior and data",
      "The mode of the likelihood",
    ],
    explanation: "Step 1: In conjugate Normal-Normal, the posterior mean is a precision-weighted average, shrunk toward the prior. Final answer: 0 (the prior mean)." }),

  p({ id: "bayes-test-2", topicId: "bayesian-inference", section: "testing", type: "mcq", difficulty: "medium",
    prompt: "A Bayes factor of 1/10 in favor of the null is interpreted as:",
    answer: "Strong evidence against the null (in favor of the alternative)",
    choices: [
      "Strong evidence for the null",
      "Strong evidence against the null (in favor of the alternative)",
      "Weak evidence either way",
      "Decisive evidence for the null",
    ],
    explanation: "Step 1: BF < 1/10 is usually considered strong evidence against the model in the numerator. Final answer: Strong evidence against the null (in favor of the alternative)." }),

  p({ id: "bayes-comp-2", topicId: "bayesian-inference", section: "computation", type: "mcq", difficulty: "easy",
    prompt: "Variational inference is often preferred over MCMC when:",
    answer: "The dataset is very large and approximate inference is acceptable",
    choices: [
      "Exact inference is required",
      "The dataset is very large and approximate inference is acceptable",
      "The model is extremely simple",
      "We have unlimited computing time",
    ],
    explanation: "Step 1: Variational methods scale better to big data but only give an approximation to the posterior. Final answer: The dataset is very large and approximate inference is acceptable." }),
];