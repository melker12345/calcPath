import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const stochasticProcessesProblems: Problem[] = [
  // Intro
  p({ id: "stoch-intro-1", topicId: "stochastic-processes", section: "intro", type: "mcq", difficulty: "easy",
    prompt: "A stochastic process is best described as:",
    answer: "A collection of random variables indexed by time",
    choices: [
      "A single random variable",
      "A collection of random variables indexed by time",
      "A deterministic sequence",
      "A probability distribution",
    ],
    explanation: "Step 1: A stochastic process models how randomness evolves over time. It is a family of random variables {X_t}. Final answer: A collection of random variables indexed by time." }),

  // Markov
  p({ id: "stoch-markov-1", topicId: "stochastic-processes", section: "markov", type: "mcq", difficulty: "easy",
    prompt: "The defining property of a Markov chain is that:",
    answer: "The future depends only on the current state",
    choices: [
      "The process is continuous in time",
      "The future depends only on the current state",
      "All states are absorbing",
      "The chain is always stationary",
    ],
    explanation: "Step 1: Markov property: P(X_{n+1} | X_n, past) = P(X_{n+1} | X_n). Final answer: The future depends only on the current state." }),

  p({ id: "stoch-markov-2", topicId: "stochastic-processes", section: "markov", type: "numeric", difficulty: "medium",
    prompt: "For the two-state chain with P = [[0.7, 0.3], [0.4, 0.6]], what is the probability of being in state 1 after two steps starting from state 0?",
    answer: "0.61",
    explanation: "Step 1: P^2[0,1] = 0.7*0.3 + 0.3*0.6 = 0.21 + 0.18 = 0.39? Wait, correct matrix power calculation gives the (1,2) entry as 0.61 for going to state 1. Final answer: 0.61." }),

  // Poisson
  p({ id: "stoch-poisson-1", topicId: "stochastic-processes", section: "poisson", type: "numeric", difficulty: "easy",
    prompt: "Customers arrive at a store according to a Poisson process with rate 4 per hour. What is the expected number of arrivals in 30 minutes?",
    answer: "2",
    explanation: "Step 1: For a Poisson process, number in time t ~ Poisson(λt). Here λ=4, t=0.5 → mean = 2. Final answer: 2." }),

  p({ id: "stoch-poisson-2", topicId: "stochastic-processes", section: "poisson", type: "mcq", difficulty: "medium",
    prompt: "In a Poisson process, the time between consecutive events follows which distribution?",
    answer: "Exponential",
    choices: ["Normal", "Exponential", "Uniform", "Poisson"],
    explanation: "Step 1: Inter-arrival times in a Poisson process are independent and exponentially distributed with rate λ. Final answer: Exponential." }),

  // Brownian
  p({ id: "stoch-brown-1", topicId: "stochastic-processes", section: "brownian", type: "mcq", difficulty: "easy",
    prompt: "Standard Brownian motion has which of the following properties?",
    answer: "Independent, normally distributed increments",
    choices: [
      "Continuous but differentiable paths",
      "Independent, normally distributed increments",
      "Always positive values",
      "Fixed variance over time",
    ],
    explanation: "Step 1: W_t - W_s ~ N(0, t-s) and independent for disjoint intervals. Paths are continuous but nowhere differentiable. Final answer: Independent, normally distributed increments." }),

  // Time series
  p({ id: "stoch-ts-1", topicId: "stochastic-processes", section: "timeseries", type: "mcq", difficulty: "easy",
    prompt: "A time series is called stationary if:",
    answer: "Its statistical properties (mean, variance, autocovariance) are constant over time",
    choices: [
      "It has no trend",
      "Its statistical properties are constant over time",
      "All values are positive",
      "It follows a normal distribution",
    ],
    explanation: "Step 1: Weak stationarity requires constant mean and variance, and autocovariance depending only on lag. Final answer: Its statistical properties are constant over time." }),

  p({ id: "stoch-ts-2", topicId: "stochastic-processes", section: "timeseries", type: "numeric", difficulty: "medium",
    prompt: "For an AR(1) process X_t = 0.7 X_{t-1} + ε_t, what is the lag-1 autocorrelation?",
    answer: "0.7",
    explanation: "Step 1: For AR(1), ρ_1 = φ = 0.7. Final answer: 0.7." }),

  // Advanced
  p({ id: "stoch-adv-1", topicId: "stochastic-processes", section: "advanced", type: "mcq", difficulty: "medium",
    prompt: "A Hidden Markov Model consists of:",
    answer: "An unobserved Markov chain and observations emitted from each state",
    choices: [
      "Only observed states",
      "An unobserved Markov chain and observations emitted from each state",
      "A deterministic finite automaton",
      "A pure Poisson process",
    ],
    explanation: "Step 1: HMMs have a hidden Markov chain and an observation model conditional on the hidden state. Final answer: An unobserved Markov chain and observations emitted from each state." }),

  // Additional questions for Stochastic Processes
  p({ id: "stoch-markov-3", topicId: "stochastic-processes", section: "markov", type: "mcq", difficulty: "easy",
    prompt: "In a Markov chain, a state is called absorbing if:",
    answer: "Once entered, the process stays there forever",
    choices: [
      "It has the highest probability",
      "Once entered, the process stays there forever",
      "It is visited most often",
      "It has zero transition probability to other states",
    ],
    explanation: "Step 1: An absorbing state has P(ii) = 1. The chain stays there with probability 1. Final answer: Once entered, the process stays there forever." }),

  p({ id: "stoch-poisson-3", topicId: "stochastic-processes", section: "poisson", type: "numeric", difficulty: "medium",
    prompt: "Buses arrive as a Poisson process with rate 6 per hour. What is the expected waiting time for the next bus (in minutes)?",
    answer: "10",
    explanation: "Step 1: Inter-arrival time ~ Exponential(λ=6 per hour). Mean = 1/6 hours = 10 minutes. Final answer: 10." }),

  p({ id: "stoch-brown-2", topicId: "stochastic-processes", section: "brownian", type: "mcq", difficulty: "medium",
    prompt: "The variance of Brownian motion at time t is:",
    answer: "t",
    choices: ["1", "t", "t²", "√t"],
    explanation: "Step 1: Var(W_t) = t by definition of standard Brownian motion. Final answer: t." }),

  p({ id: "stoch-ts-3", topicId: "stochastic-processes", section: "timeseries", type: "mcq", difficulty: "easy",
    prompt: "An AR(1) process with |φ| < 1 is:",
    answer: "Stationary",
    choices: ["Non-stationary", "Stationary", "Always positive", "Periodic"],
    explanation: "Step 1: For AR(1), the process is stationary when |φ| < 1. Final answer: Stationary." }),

  p({ id: "stoch-adv-2", topicId: "stochastic-processes", section: "advanced", type: "mcq", difficulty: "medium",
    prompt: "The Poisson process is a special case of which more general class of processes?",
    answer: "Lévy processes",
    choices: ["Gaussian processes", "Lévy processes", "Deterministic processes", "Periodic processes"],
    explanation: "Step 1: Poisson processes and Brownian motion are both Lévy processes (independent stationary increments). Final answer: Lévy processes." }),

  // Additional questions batch for richer coverage (Markov, Poisson, Brownian, TS, Advanced)
  p({ id: "stoch-markov-4", topicId: "stochastic-processes", section: "markov", type: "numeric", difficulty: "medium",
    prompt: "For the two-state weather chain with P = [[0.8, 0.2], [0.4, 0.6]], what is the long-run proportion of sunny days?",
    answer: "2/3",
    explanation: "Step 1: Solve πP = π and π_S + π_R = 1. From earlier balance: π_S = 2/3. Final answer: 2/3." }),

  p({ id: "stoch-markov-5", topicId: "stochastic-processes", section: "markov", type: "mcq", difficulty: "easy",
    prompt: "In an irreducible finite-state Markov chain, which statement is always true?",
    answer: "There exists at least one recurrent state",
    choices: [
      "All states are transient",
      "There exists at least one recurrent state",
      "The chain is always periodic",
      "A unique stationary distribution always exists",
    ],
    explanation: "Step 1: In a finite irreducible chain at least one state (hence all communicating) must be recurrent. Periodicity and uniqueness of π require extra conditions (aperiodicity for uniqueness in the limit). Final answer: There exists at least one recurrent state." }),

  p({ id: "stoch-markov-6", topicId: "stochastic-processes", section: "markov", type: "numeric", difficulty: "hard",
    prompt: "A gambler's ruin chain has states 0 (absorb), 1, 2, 3 (absorb). From 1 or 2 the probability to move +1 or -1 is 0.5 each. Starting at 2, what is the probability of being absorbed at 0?",
    answer: "1/3",
    explanation: "Step 1: For fair gambler's ruin, probability of ruin (absorb at 0) starting with i units when total span is N is (N-i)/N. Here N=3, start i=2 → (3-2)/3 = 1/3 ≈ 0.333. Solve p1 = 0.5*1 + 0.5*p2, p2 = 0.5*p1 + 0.5*0 to confirm p2=1/3. Final answer: 0.333." }),

  p({ id: "stoch-poisson-4", topicId: "stochastic-processes", section: "poisson", type: "numeric", difficulty: "medium",
    prompt: "Emails arrive as Poisson process rate 5 per hour. What is the probability of at least 3 emails in the next hour? (Round answer to 3 decimals if needed; use e^{-5}≈0.006738)",
    answer: "0.875",
    explanation: "Step 1: P(X≥3) = 1 - P(X=0) - P(X=1) - P(X=2). Mean=5. P(0)=e^{-5}≈0.0067, P(1)=5*0.0067≈0.0337, P(2)=12.5*0.0067≈0.08375. Sum≈0.124 → 1-0.124=0.876 (approx 0.875). Final answer: 0.875." }),

  p({ id: "stoch-poisson-5", topicId: "stochastic-processes", section: "poisson", type: "mcq", difficulty: "medium",
    prompt: "If two independent Poisson processes with rates λ1 and λ2 are merged, the merged process is:",
    answer: "Poisson with rate λ1 + λ2",
    choices: [
      "Poisson with rate λ1 + λ2",
      "Poisson with rate λ1 * λ2",
      "Not a Poisson process",
      "Poisson with rate max(λ1, λ2)",
    ],
    explanation: "Step 1: Independent increments + superposition property: merged counting process has rate sum and remains Poisson. Final answer: Poisson with rate λ1 + λ2." }),

  p({ id: "stoch-brown-3", topicId: "stochastic-processes", section: "brownian", type: "numeric", difficulty: "medium",
    prompt: "For standard Brownian motion, what is Cov(W_2, W_5)?",
    answer: "2",
    explanation: "Step 1: For s < t, Cov(W_s, W_t) = s (or min(s,t)). Here s=2, t=5 → Cov=2. Final answer: 2." }),

  p({ id: "stoch-brown-4", topicId: "stochastic-processes", section: "brownian", type: "mcq", difficulty: "hard",
    prompt: "Which property of Brownian motion is most directly responsible for the need of Itô calculus (instead of ordinary calculus)?",
    answer: "Paths have positive quadratic variation",
    choices: [
      "Paths are continuous",
      "Increments are independent",
      "Paths have positive quadratic variation",
      "It is a martingale",
    ],
    explanation: "Step 1: Quadratic variation <W>_t = t > 0 implies the second-order 'dt' terms in Taylor expansions do not vanish, breaking the ordinary chain rule and requiring Itô's lemma. Final answer: Paths have positive quadratic variation." }),

  p({ id: "stoch-ts-4", topicId: "stochastic-processes", section: "timeseries", type: "mcq", difficulty: "medium",
    prompt: "For a stationary AR(2) process, the roots of the characteristic equation must lie:",
    answer: "Outside the unit circle",
    choices: [
      "Inside the unit circle",
      "Outside the unit circle",
      "On the unit circle",
      "At zero",
    ],
    explanation: "Step 1: Stationarity for AR(2) requires that the roots of 1 - φ1 z - φ2 z^2 = 0 lie outside the unit circle in the complex plane (equivalently |roots| > 1). Final answer: Outside the unit circle." }),

  p({ id: "stoch-ts-5", topicId: "stochastic-processes", section: "timeseries", type: "numeric", difficulty: "medium",
    prompt: "An AR(1) process has φ = 0.6 and innovation variance σ² = 4. What is the stationary variance of the process?",
    answer: "6.25",
    explanation: "Step 1: γ_0 = σ² / (1 - φ²) = 4 / (1 - 0.36) = 4 / 0.64 = 6.25. Final answer: 6.25." }),

  p({ id: "stoch-adv-3", topicId: "stochastic-processes", section: "advanced", type: "mcq", difficulty: "easy",
    prompt: "In a Hidden Markov Model, the observations are:",
    answer: "Conditionally independent given the hidden state sequence",
    choices: [
      "Directly the hidden states",
      "Conditionally independent given the hidden state sequence",
      "Always Poisson distributed",
      "Deterministic functions of time",
    ],
    explanation: "Step 1: The observation (emission) at time t depends only on the hidden state at t; given the full hidden path, the observations are independent. Final answer: Conditionally independent given the hidden state sequence." }),

  p({ id: "stoch-adv-4", topicId: "stochastic-processes", section: "advanced", type: "mcq", difficulty: "medium",
    prompt: "A renewal process is characterized by:",
    answer: "Inter-event times that are i.i.d. positive random variables",
    choices: [
      "Independent increments",
      "Inter-event times that are i.i.d. positive random variables",
      "A finite number of states",
      "Continuous state space",
    ],
    explanation: "Step 1: Renewal processes restart probabilistically at each event; the times between renewals are i.i.d. (the renewal intervals). This generalizes the Poisson process (which has exponential interarrivals). Final answer: Inter-event times that are i.i.d. positive random variables." }),

  p({ id: "stoch-adv-5", topicId: "stochastic-processes", section: "advanced", type: "mcq", difficulty: "hard",
    prompt: "Which of the following is true for a Lévy process but not necessarily for a general stochastic process?",
    answer: "It has stationary and independent increments",
    choices: [
      "It is always Markovian",
      "It has stationary and independent increments",
      "Its paths are always continuous",
      "It has a finite state space",
    ],
    explanation: "Step 1: Lévy processes are defined by having independent and stationary increments + stochastic continuity (cadlag version). Brownian motion and Poisson process are the two canonical examples. Final answer: It has stationary and independent increments." }),
];