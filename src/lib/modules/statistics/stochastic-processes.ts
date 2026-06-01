import type { ModuleContent } from "../types";

export const stochasticProcessesModule: ModuleContent = {
  topicId: "stochastic-processes",
  title: "Stochastic Processes",
  intro: [
    "A stochastic process is a collection of random variables indexed by time (or space). While a single random variable describes one uncertain quantity, a stochastic process describes how uncertainty evolves over time.",
    "The two most important classes are Markov chains (memoryless discrete-state processes) and Poisson processes (counting processes with independent increments). These models power queueing theory, reliability engineering, finance, and machine learning (e.g., Hidden Markov Models).",
    "Brownian motion is the continuous-time analog that underlies modern financial modeling (Black-Scholes) and many physical diffusion processes. Time series analysis extends these ideas to real data with trends, seasonality, and autocorrelation.",
  ],
  sections: [
    {
      title: "What is a stochastic process?",
      section: "intro",
      body: [
        "A stochastic process is a family of random variables $\{X_t : t \in T\}$, where $T$ is an index set (usually time). Each $X_t$ is a random variable, and the collection describes how the system evolves.",
        "The key distinction from ordinary random variables is the dependence structure across time. We care about joint distributions, transition probabilities, and long-run behavior.",
        "Common types: discrete-time vs continuous-time, discrete-state vs continuous-state, Markovian (memoryless) vs non-Markovian.",
      ],
      eli5: [
        "Think of the weather as a stochastic process. Each day's weather is random, but today's weather affects tomorrow's. The whole sequence of daily weather over a year is one realization of the process.",
      ],
    },
    {
      title: "Markov chains",
      section: "markov",
      body: [
        "A Markov chain is a stochastic process with the Markov property: the future depends only on the present state, not on the past. $P(X_{n+1} | X_n, X_{n-1}, \dots) = P(X_{n+1} | X_n)$.",
        "The one-step transition matrix $P$ completely describes the dynamics. The $n$-step transition probabilities are given by matrix powers $P^n$.",
        "States can be transient, recurrent, or absorbing. In the long run, many chains converge to a unique stationary distribution $\pi$ satisfying $\pi P = \pi$ (and $\\sum \\pi_i = 1$). For irreducible, aperiodic, positive recurrent chains (ergodic), the stationary distribution is also the long-run proportion of time spent in each state, independent of the starting state.",
        "To find $\\pi$, solve the linear system $\\pi (P - I) = 0$ together with the normalization condition. This is the global balance equations: flow into each state equals flow out in the long run.",
        "Applications: page ranking (Google's original algorithm), board games like Monopoly, customer brand switching models, and reinforcement learning (MDPs).",
      ],
      eli5: [
        "A Markov chain is like a frog jumping between lily pads where the next jump only depends on which pad it's currently on — it has no memory of how it got there. The probability of going to each other pad is fixed.",
        "Over a very long time, the frog will settle into a steady pattern: it spends a fixed fraction of time on each pad, no matter where it started. That long-run fraction is the stationary distribution — you can calculate it from the jump probabilities alone.",
      ],
      examples: [
        {
          title: "Two-state weather Markov chain",
          steps: [
            "Suppose tomorrow's weather depends only on today: Sunny → Sunny with prob 0.8, Rainy with 0.2. Rainy → Sunny 0.4, Rainy 0.6.",
            "Transition matrix $P = [[0.8, 0.2], [0.4, 0.6]]$.",
            "If today is sunny, the probability of sunny two days from now is the (1,1) entry of $P^2 = 0.76$.",
          ],
        },
        {
          title: "Finding the stationary distribution (weather example)",
          steps: [
            "For the same two-state chain, let $\\pi = [\\pi_S, \\pi_R]$. Solve $\\pi P = \\pi$ and $\\pi_S + \\pi_R = 1$.",
            "This gives the equations: $\\pi_S = 0.8\\pi_S + 0.4\\pi_R$ and $\\pi_R = 0.2\\pi_S + 0.6\\pi_R$.",
            "Simplifying: $0.2\\pi_S = 0.4\\pi_R$ → $\\pi_S = 2\\pi_R$. Combined with $\\pi_S + \\pi_R = 1$ we get $\\pi_S = 2/3$, $\\pi_R = 1/3$.",
            "In the long run, no matter the starting weather, about 67% of days are sunny and 33% rainy.",
          ],
        },
      ],
    },
    {
      title: "Poisson processes",
      section: "poisson",
      body: [
        "A Poisson process with rate $\\lambda$ counts the number of events occurring in an interval. It has independent increments and the number of events in an interval of length $t$ is Poisson with mean $\\lambda t$. The probability of exactly $k$ events in time $t$ is $P(X(t)=k) = e^{-\\lambda t} (\\lambda t)^k / k!$.",
        "The inter-arrival times are independent exponential random variables with rate $\\lambda$. This memoryless property makes Poisson processes the natural model for arrivals in queues: the waiting time for the next event never 'ages' — it always has the same distribution.",
        "Key properties: the time until the $k$-th event is Gamma (Erlang-$k$) distributed with rate $\\lambda$. Superposition (merging) of independent Poisson processes with rates $\\lambda_i$ is Poisson with rate $\\sum \\lambda_i$. Thinning (each event kept independently with prob p) yields two independent Poissons.",
        "Applications: customer arrivals, radioactive decay, insurance claims, website hits, bus arrivals, and as a building block for more complex point processes (e.g., Hawkes processes for self-exciting events).",
      ],
      eli5: [
        "Imagine customers arriving at a coffee shop. The exact moment each person walks in is random, but on average 4 people arrive per hour. A Poisson process is the mathematical model for this 'random but steady rate' arrival pattern. The time between customers is like rolling an exponential die — sometimes short waits, sometimes long, but averaging 15 minutes.",
        "The memoryless part is wild: even if you've already waited 10 minutes for the next customer, the expected remaining wait is still exactly 15 minutes. The process has no memory of how long you've been standing there.",
      ],
      examples: [
        {
          title: "Calls to a call center",
          steps: [
            "A call center receives calls at an average rate of 12 per hour. What is the probability of exactly 5 calls in the next 30 minutes?",
            "For a Poisson process, number of events in time $t$ is Poisson($\\lambda t$). Here $\\lambda=12$, $t=0.5$ so mean = 6.",
            "P(X=5) = e^{-6} * 6^5 / 5! ≈ 0.1606.",
            "So about 16% chance of exactly 5 calls in 30 minutes.",
          ],
        },
        {
          title: "Superposition and thinning (two coffee shops)",
          steps: [
            "Two independent Poisson arrival streams merge at a combined counter: Shop A at $\\lambda_A=3$/hr, Shop B at $\\lambda_B=5$/hr. The merged process is Poisson($\\lambda=8$).",
            "If each arriving customer is 'takeout' with probability 0.25 independently (thinning), then takeout arrivals form Poisson($2$) and dine-in Poisson($6$).",
            "This is why Poisson processes are so convenient: merging and splitting preserve the Poisson property.",
          ],
        },
      ],
    },
    {
      title: "Brownian motion and diffusion",
      section: "brownian",
      body: [
        "Standard Brownian motion (Wiener process) $W_t$ is a continuous-time process with independent, normally distributed increments: $W_t - W_s \\sim N(0, t-s)$ for $t > s$. It is the scaling limit of simple symmetric random walks (Donsker's theorem) and has continuous paths almost surely.",
        "Brownian motion is nowhere differentiable (paths are too jagged) but has quadratic variation $\\langle W \\rangle_t = t$. This quadratic variation is what makes stochastic integrals (Itô integrals) different from ordinary calculus — the 'dt' terms don't vanish.",
        "Key properties: Markovian, martingale (fair game), strong Markov property, and the reflection principle for hitting times and maxima.",
        "Geometric Brownian motion $S_t = S_0 \\exp((\\mu - \\sigma^2/2)t + \\sigma W_t)$ is the model underlying Black-Scholes option pricing because it keeps prices positive and has log-normal returns.",
        "Applications: stock prices, physical Brownian motion of particles, noise in electrical circuits, particle diffusion, and many machine learning diffusion models (score-based generative models).",
      ],
      eli5: [
        "Picture a tiny pollen grain floating in a glass of water, constantly being bumped by invisible water molecules. Its path is completely erratic at small scales (Brownian motion). Over longer time, it slowly drifts. This same math describes how stock prices wiggle around a trend.",
        "A key surprise: Brownian motion wiggles so much that its 'speed' is infinite in a certain sense (infinite total variation), yet the accumulated squared changes grow exactly like ordinary time t. That quadratic variation is the secret sauce that powers stochastic calculus and option pricing.",
      ],
      examples: [
        {
          title: "Simulating a stock price path (GBM)",
          steps: [
            "Start with $S_0 = 100$, drift $\\mu=0.08$, volatility $\\sigma=0.2$, simulate over 1 year ($t=1$).",
            "A single realization: pick a normal draw $Z \\sim N(0,1)$ for the Brownian increment over the full period, then $S_1 = 100 \\exp((0.08 - 0.02) \\cdot 1 + 0.2 Z)$.",
            "Different $Z$ values give different ending prices; the distribution of $S_1$ is lognormal. The expected return is higher than the drift because of the Itô correction ($-\\sigma^2/2$).",
          ],
        },
      ],
    },
    {
      title: "Time series basics",
      section: "timeseries",
      body: [
        "A time series is a sequence of observations taken at successive points in time. Unlike pure stochastic processes, we usually have only one realization and must infer the underlying dynamics from data.",
        "Key concepts: stationarity (constant mean and autocovariance function), autocorrelation function (ACF), partial autocorrelation (PACF), trend, seasonality, and invertibility/stationarity conditions for ARMA models.",
        "Basic models: AR(p) — current value is linear combination of p past values plus noise; MA(q) — current value depends on q past shocks; ARMA(p,q) combines both. ARIMA adds differencing (integration) for non-stationary series with unit roots.",
        "The ACF decays exponentially for AR, cuts off after lag q for MA, and has a mixed pattern for ARMA. PACF helps identify the AR order. Diagnostics include checking residuals for whiteness (Ljung-Box test) and normality.",
        "Forecasting and diagnostics (residual analysis, Ljung-Box test) are central to practical time series work in economics, finance, and operations.",
      ],
      eli5: [
        "Daily temperature in a city is a time series. It has trends (warmer in summer), seasonality (daily and yearly cycles), and random noise (a cold snap or heat wave). Time series models try to separate the predictable patterns from the random noise so we can forecast tomorrow's temperature.",
        "The ACF is like a 'memory scan': it tells you how much today's temperature is correlated with yesterday's, two days ago, etc. If the correlation fades slowly, you probably have an AR process (momentum). If it drops to zero after a fixed lag, it's more like an MA (the shock from a heatwave only affects the next few days).",
      ],
      examples: [
        {
          title: "AR(1) autocorrelation structure",
          steps: [
            "For the AR(1) process $X_t = \\phi X_{t-1} + \\epsilon_t$ with $|\\phi|<1$ and white noise $\\epsilon_t$ of variance $\\sigma^2$, the lag-k autocorrelation is $\\rho_k = \\phi^k$.",
            "So ACF at lag 1 is $\\phi$, at lag 2 is $\\phi^2$, etc. — geometric decay.",
            "The variance of the process (long-run) is $\\gamma_0 = \\sigma^2 / (1 - \\phi^2)$. This is larger than the innovation variance when there is positive autocorrelation (persistence amplifies variability).",
            "To identify from data: plot the sample ACF; if it decays geometrically and PACF cuts off after lag 1, an AR(1) is a good candidate.",
          ],
        },
      ],
    },
    {
      title: "Connections and advanced directions",
      section: "advanced",
      body: [
        "Many real systems combine these ideas: a Poisson process can drive a Markov-modulated rate (Markov-modulated Poisson process), Brownian motion can be used to approximate queue lengths in heavy traffic (diffusion approximations), and time series models can be cast as state-space models with Kalman filtering for online estimation.",
        "Hidden Markov Models (HMMs) combine a hidden Markov chain (the 'state of the world') with an observation (emission) model conditional on the hidden state. The Viterbi algorithm finds the most likely state sequence; the forward-backward algorithm computes posterior probabilities. Foundational in speech recognition, bioinformatics (gene finding), and quantitative finance (regime-switching models).",
        "Lévy processes generalize Brownian motion and Poisson processes, allowing both diffusion and jumps. They are used in advanced financial modeling (jump-diffusion models for crashes and spikes) and insurance mathematics (ruin theory).",
        "Renewal theory studies the long-run behavior of processes that 'restart' at random times (inter-renewal times i.i.d.). The elementary renewal theorem and key renewal theorem give asymptotic rates and age/residual life distributions.",
      ],
      eli5: [
        "A call center where the arrival rate itself changes randomly between 'busy' and 'slow' periods is a Markov-modulated Poisson process — the underlying 'mood' of the system is a Markov chain, and the calls arrive as a Poisson process whose rate depends on the current mood.",
        "An HMM is like listening to someone speaking a secret language with noisy audio: the hidden states are the intended phonemes (following Markov grammar rules), and what you hear is a garbled emission from each phoneme. The model lets you guess the most likely sequence of intended sounds.",
      ],
    },
  ],
  examples: [],
  commonMistakes: [
    "Confusing a Markov chain's stationary distribution with its long-run proportion of time in each state (they are the same for ergodic chains, but the intuition matters).",
    "Assuming all stochastic processes are Markovian. Most real processes have memory.",
    "Treating Brownian motion paths as differentiable (they are not).",
    "Ignoring the difference between a Poisson process (counts) and its inter-arrival exponential times.",
    "Fitting ARMA models to non-stationary data without differencing first.",
  ],
};