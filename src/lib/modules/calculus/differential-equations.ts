import type { ModuleContent } from "../types";

/**
 * Differential Equations (Calculus Level)
 * Extracted from the original monolithic modules.ts
 */

export const differentialEquationsModule: ModuleContent = {
  topicId: "differential-equations",
  title: "Differential Equations",
    intro: [
      "A differential equation (DE) is any equation that involves a function and its derivatives. Solving a DE means finding the function itself. This is the reverse of what you've been doing: instead of 'given $f$, find $f'$', now it's 'given a relationship involving $f'$ (and maybe $f''$), find $f$'.",
      "Differential equations model nearly everything that changes: population growth, radioactive decay, temperature cooling, spring motion, electrical circuits, and fluid flow. If something evolves over time, there's a DE behind it.",
      "We'll start with the simplest types (separable, linear first-order) and build up to second-order equations. The key is recognizing which type you're dealing with, then applying the appropriate solution technique.",
    ],
    sections: [
      {
        title: "What is a differential equation?",
        section: "intro",
        body: [
          "A differential equation (DE) is any equation that relates a function $y(x)$ to one or more of its derivatives. The unknown is the function itself — you're solving for $y$, not a number.",
          "The order of a DE is the highest derivative that appears. First-order: $y' = 2xy$ (involves $y'$ but not $y''$). Second-order: $y'' + 4y = 0$ (involves $y''$). Higher-order DEs exist but are less common in a first course.",
          "A solution is a function $y(x)$ that, when substituted into the equation, makes it true for all $x$ in some interval. To verify a solution, plug it in and check: does both sides of the equation agree?",
          "The general solution contains arbitrary constants: one constant for a first-order DE, two for second-order, etc. These constants represent the 'degrees of freedom' — infinitely many functions satisfy the DE, differing only in these constants. An initial value problem (IVP) pins down these constants by specifying conditions like $y(0) = 3$.",
          "Linear vs. nonlinear: a DE is linear if $y$ and its derivatives appear to the first power with no products like $y \\cdot y'$. Linear DEs have well-developed solution theory; nonlinear DEs are harder and may not have closed-form solutions.",
        ],
        eli5: [
          "In algebra, you solve for a number ($x = 5$). In differential equations, you solve for an entire function ($y = e^{2x}$). The equation doesn't tell you what $y$ is directly — it tells you a relationship between $y$ and its rate of change. From that relationship, you figure out what function $y$ must be.",
          "It's like being told: 'The speed of this car is always twice its position.' From that rule, you figure out the car must follow $y = Ce^{2t}$ — that's the function that satisfies the rule.",
        ],
      },
      {
        title: "Direction fields (slope fields)",
        section: "slopefields",
        body: [
          "A direction field visualizes a first-order DE $y' = f(x,y)$ by drawing short line segments with slope $f(x,y)$ at many points $(x,y)$.",
          "The solution curves must be tangent to these segments at every point. So by drawing segments, you can see the shape of solutions without solving the equation.",
          "Direction fields build intuition: you can spot equilibrium solutions (horizontal segments), identify whether solutions grow or decay, and see the qualitative behavior before doing any algebra.",
          "Example: for $y' = -y$, the slopes are negative when $y > 0$ and positive when $y < 0$. Solutions decay toward $y = 0$, which matches $y = Ce^{-x}$.",
        ],
        eli5: [
          "Imagine a field of grass with wind blowing in different directions at different spots. At each point, you draw a tiny arrow showing which way the wind blows there.",
          "A direction field is exactly that for a differential equation. At every point $(x,y)$, the equation tells you the slope (direction) a solution would travel through that point. Draw that slope as a tiny line segment.",
          "Now if you drop a leaf (a solution) anywhere in the field, it will follow the arrows. The path it traces is the solution curve. You can see the overall behavior — where things flow, where they settle — without ever solving the equation algebraically.",
        ],
      },
      {
        title: "Separable equations",
        section: "separable",
        body: [
          "A first-order DE is separable if it can be written as $\\frac{dy}{dx} = g(x) \\cdot h(y)$, where one factor depends only on $x$ and the other only on $y$.",
          "To solve: separate the variables: $\\frac{1}{h(y)}\\,dy = g(x)\\,dx$. Then integrate both sides.",
          "Don't forget the constant of integration! Usually written as $+C$ on one side.",
          "Example: $\\frac{dy}{dx} = xy$. Separate: $\\frac{1}{y}\\,dy = x\\,dx$. Integrate: $\\ln|y| = \\frac{x^2}{2} + C$. Solve: $y = Ae^{x^2/2}$ where $A = \\pm e^C$.",
          "Watch for lost solutions: when dividing by $h(y)$, any value where $h(y) = 0$ might be a constant solution (equilibrium) that you lose in the algebra.",
        ],
        examples: [
          {
            title: "Solving a separable equation with an IVP",
            steps: [
              "Solve $\\frac{dy}{dx} = \\frac{x}{y}$ with $y(0) = 2$.",
              "Step 1 — separate: move all $y$ terms to the left, $x$ terms to the right. Multiply both sides by $y$: $y\\,dy = x\\,dx$.",
              "Step 2 — integrate both sides: $\\int y\\,dy = \\int x\\,dx$, giving $\\frac{y^2}{2} = \\frac{x^2}{2} + C$.",
              "Step 3 — apply the initial condition $y(0) = 2$: $\\frac{4}{2} = 0 + C$, so $C = 2$.",
              "Step 4 — solve for $y$: $y^2 = x^2 + 4$, so $y = \\sqrt{x^2 + 4}$ (positive root since $y(0) = 2 > 0$).",
              "This is a family of hyperbolas. The initial condition picked out the specific upper branch passing through $(0, 2)$.",
            ],
          },
        ],
      },
      {
        title: "Exponential growth and decay",
        section: "expgrowth",
        body: [
          "The DE $\\frac{dy}{dt} = ky$ says: the rate of change of $y$ is proportional to $y$ itself. It's separable: $\\frac{dy}{y} = k\\,dt$, integrating gives $\\ln|y| = kt + C$, so $y(t) = y_0 e^{kt}$ where $y_0 = y(0)$.",
          "If $k > 0$: exponential growth. The larger $y$ gets, the faster it grows. Applications: population growth (early phase), compound interest, viral spread, chain reactions.",
          "If $k < 0$: exponential decay. The quantity shrinks at a rate proportional to its current size. Applications: radioactive decay, drug elimination from the body, cooling (simplified), depreciation.",
          "Half-life: the time for the quantity to halve. Set $y_0 e^{kt_{1/2}} = y_0/2$, giving $t_{1/2} = \\frac{\\ln 2}{|k|}$. This is constant — it doesn't depend on the current amount. Carbon-14 has a half-life of ~5730 years regardless of how much you start with.",
          "Doubling time: for growth ($k > 0$), the time for the quantity to double is $t_d = \\frac{\\ln 2}{k}$. The 'Rule of 70': at $r\\%$ growth per year, the doubling time is approximately $70/r$ years.",
        ],
        eli5: [
          "Exponential growth is like a snowball rolling downhill: the bigger it gets, the faster it grows. Exponential decay is the opposite: like ice melting — the less there is, the slower it melts. In both cases, the rate of change is proportional to the current amount, and the solution is always $Ce^{kt}$.",
        ],
      },
      {
        title: "Newton's Law of Cooling",
        section: "cooling",
        body: [
          "Newton's Law of Cooling states that an object's temperature changes at a rate proportional to the difference between its temperature and the surrounding (ambient) temperature: $\\frac{dT}{dt} = -k(T - T_{\\text{env}})$, where $k > 0$.",
          "This is separable. Let $u = T - T_{\\text{env}}$, then $du/dt = -ku$, giving $u = u_0 e^{-kt}$. Substituting back: $T(t) = T_{\\text{env}} + (T_0 - T_{\\text{env}})e^{-kt}$.",
          "Behavior: as $t \\to \\infty$, $T(t) \\to T_{\\text{env}}$. The object approaches room temperature exponentially — quickly at first (when the temperature gap is large), then slower as it gets closer.",
          "The constant $k$ depends on the object's material, surface area, and the surrounding medium (air vs. water, for instance). A larger $k$ means faster cooling. Determining $k$ usually requires two temperature readings at known times.",
          "Applications: forensic science (estimating time of death from body temperature), cooking (how long until food cools to eating temperature), engineering (heat dissipation in electronics).",
        ],
        eli5: [
          "A hot coffee cools down fast at first, then slower and slower as it gets closer to room temperature. Newton's Law of Cooling explains why: the bigger the gap between the coffee's temperature and the room, the faster it cools. As the gap shrinks, cooling slows down. The coffee never quite reaches room temperature — it just gets infinitely close.",
        ],
        examples: [
          {
            title: "Newton's Law of Cooling applied",
            steps: [
              "A cup of coffee at $90°$C is placed in a $20°$C room. After 5 minutes, it's $70°$C. Find the temperature after 10 minutes.",
              "Model: $T(t) = 20 + (90-20)e^{-kt} = 20 + 70e^{-kt}$.",
              "Use the data point $T(5) = 70$: $70 = 20 + 70e^{-5k}$, so $50 = 70e^{-5k}$, giving $e^{-5k} = 5/7$.",
              "Solve for $k$: $k = -\\frac{1}{5}\\ln(5/7) = \\frac{1}{5}\\ln(7/5) \\approx 0.0673$.",
              "Now find $T(10)$: $T(10) = 20 + 70e^{-10k} = 20 + 70(e^{-5k})^2 = 20 + 70(5/7)^2 = 20 + 70 \\cdot 25/49 \\approx 55.7°$C.",
            ],
          },
        ],
      },
      {
        title: "Linear first-order equations",
        section: "linear",
        body: [
          "Standard form: $\\frac{dy}{dx} + P(x)y = Q(x)$. The key: this is always solvable using an integrating factor.",
          "Integrating factor: $\\mu(x) = e^{\\int P(x)\\,dx}$.",
          "Multiply the entire equation by $\\mu$: the left side becomes $\\frac{d}{dx}[\\mu(x) \\cdot y]$.",
          "Integrate both sides: $\\mu(x) \\cdot y = \\int \\mu(x) Q(x)\\,dx + C$.",
          "Solve for $y$: $y = \\frac{1}{\\mu(x)}\\left[\\int \\mu(x) Q(x)\\,dx + C\\right]$.",
          "Why it works: multiplying by $\\mu$ turns the left side into a perfect derivative, which can be integrated directly.",
        ],
        examples: [
          {
            title: "Solving with an integrating factor",
            steps: [
              "Solve $\\frac{dy}{dx} + 2y = 4e^{-x}$.",
              "Step 1 — identify: $P(x) = 2$ and $Q(x) = 4e^{-x}$. Already in standard form.",
              "Step 2 — compute the integrating factor: $\\mu(x) = e^{\\int 2\\,dx} = e^{2x}$.",
              "Step 3 — multiply the entire equation by $\\mu$: $e^{2x}\\frac{dy}{dx} + 2e^{2x}y = 4e^{-x} \\cdot e^{2x}$.",
              "The left side is now $\\frac{d}{dx}[e^{2x} y]$ (that's the whole point of the integrating factor). The right side simplifies to $4e^{x}$.",
              "Step 4 — integrate both sides: $e^{2x} y = \\int 4e^{x}\\,dx = 4e^{x} + C$.",
              "Step 5 — solve for $y$: $y = \\frac{4e^{x} + C}{e^{2x}} = 4e^{-x} + Ce^{-2x}$.",
              "The term $Ce^{-2x}$ is the transient part (dies off), while $4e^{-x}$ is the 'steady-state' particular solution.",
            ],
          },
        ],
      },
      {
        title: "Logistic growth",
        section: "logistic",
        body: [
          "The logistic equation models growth with a carrying capacity $K$: $\\frac{dP}{dt} = rP\\left(1 - \\frac{P}{K}\\right)$.",
          "When $P$ is small compared to $K$, growth is approximately exponential ($\\approx rP$). As $P$ approaches $K$, growth slows and stops.",
          "Solution: $P(t) = \\frac{K}{1 + Ae^{-rt}}$ where $A = \\frac{K - P_0}{P_0}$.",
          "The graph is an S-shaped (sigmoidal) curve. The population grows fastest at $P = K/2$ (the inflection point).",
          "Applications: population biology, spread of diseases, adoption of technology, logistic regression in machine learning.",
        ],
        eli5: [
          "Imagine rabbits on an island. At first there are few rabbits and lots of food, so the population explodes (exponential growth). But as the island fills up, food gets scarce, rabbits compete, and growth slows down. Eventually, the population levels off at the maximum the island can support (the carrying capacity).",
          "The logistic equation captures this perfectly. The $(1 - P/K)$ part acts like a brake. When $P$ is tiny, the brake is barely on and growth is fast. When $P$ is close to $K$, the brake is almost fully on and growth nearly stops.",
          "This S-shaped curve shows up everywhere: the spread of a new app, a virus through a population, a rumor through a school. Fast start, rapid middle, gradual leveling off.",
        ],
      },
      {
        title: "Bernoulli equations",
        section: "bernoulli",
        body: [
          "A Bernoulli equation has the form $\\frac{dy}{dx} + P(x)y = Q(x)y^n$ where $n \\neq 0, 1$. When $n = 0$ or $n = 1$, the equation is already linear. For other values of $n$, the $y^n$ term makes it nonlinear.",
          "The clever trick: substitute $v = y^{1-n}$. Then $\\frac{dv}{dx} = (1-n)y^{-n}\\frac{dy}{dx}$. Divide the original Bernoulli equation by $y^n$, and the substitution transforms it into a linear first-order equation in $v$: $\\frac{dv}{dx} + (1-n)P(x)v = (1-n)Q(x)$.",
          "Solve this linear equation using the integrating factor method from the earlier section. Once you have $v(x)$, convert back: $y = v^{1/(1-n)}$.",
          "Example: $y' + y = y^2$ is Bernoulli with $n = 2$. Let $v = y^{1-2} = y^{-1} = 1/y$. Then $v' = -y^{-2}y'$. Dividing by $y^2$: $y^{-2}y' + y^{-1} = 1$, which becomes $-v' + v = 1$, or $v' - v = -1$. This is linear and solvable with an integrating factor.",
          "Bernoulli equations appear in population models with harvesting, certain fluid dynamics problems, and logistics applications.",
        ],
        eli5: [
          "A Bernoulli equation looks like a linear equation but with a pesky $y^n$ spoiling things. The substitution $v = y^{1-n}$ is a change of variable that magically absorbs the nonlinearity, converting the equation to a standard linear one that you already know how to solve. Solve for $v$, convert back to $y$, done.",
        ],
      },
      {
        title: "Second-order linear homogeneous equations",
        section: "secondorder",
        body: [
          "Standard form: $ay'' + by' + cy = 0$ with constant coefficients.",
          "Guess $y = e^{rx}$, substitute, and get the characteristic equation: $ar^2 + br + c = 0$.",
          "Case 1 - Two distinct real roots $r_1, r_2$: general solution is $y = C_1 e^{r_1 x} + C_2 e^{r_2 x}$.",
          "Case 2 - Repeated root $r$: general solution is $y = (C_1 + C_2 x)e^{rx}$. The extra $x$ factor accounts for the repeated root.",
          "Case 3 - Complex roots $r = \\alpha \\pm \\beta i$: general solution is $y = e^{\\alpha x}(C_1 \\cos(\\beta x) + C_2 \\sin(\\beta x))$. This produces oscillatory behavior (springs, circuits).",
        ],
        examples: [
          {
            title: "Complex roots: oscillation",
            steps: [
              "Solve $y'' + 4y = 0$.",
              "Guess $y = e^{rx}$ and substitute: $r^2 e^{rx} + 4e^{rx} = 0$, so $r^2 + 4 = 0$.",
              "Solve: $r^2 = -4$, giving $r = \\pm 2i$. These are complex roots with $\\alpha = 0$ and $\\beta = 2$.",
              "Apply the complex root formula: $y = e^{0 \\cdot x}(C_1 \\cos(2x) + C_2 \\sin(2x))$.",
              "Simplify: $y = C_1 \\cos(2x) + C_2 \\sin(2x)$.",
              "This is pure oscillation with no decay (because $\\alpha = 0$). The angular frequency is $\\omega = 2$, giving a period of $T = \\frac{2\\pi}{2} = \\pi$.",
              "Physical meaning: this models an ideal spring with no friction — it bounces forever.",
            ],
          },
          {
            title: "Distinct real roots with initial conditions",
            steps: [
              "Solve $y'' - 5y' + 6y = 0$ with $y(0) = 1$ and $y'(0) = 0$.",
              "Characteristic equation: $r^2 - 5r + 6 = (r-2)(r-3) = 0$. Roots: $r = 2$ and $r = 3$.",
              "General solution: $y = C_1 e^{2x} + C_2 e^{3x}$.",
              "Apply $y(0) = 1$: $C_1 + C_2 = 1$.",
              "For $y'(0) = 0$: first find $y' = 2C_1 e^{2x} + 3C_2 e^{3x}$, then $y'(0) = 2C_1 + 3C_2 = 0$.",
              "Solve the system: from $2C_1 + 3C_2 = 0$ we get $C_1 = -\\frac{3}{2}C_2$. Substituting into $C_1 + C_2 = 1$: $-\\frac{3}{2}C_2 + C_2 = 1$, so $C_2 = -2$ and $C_1 = 3$.",
              "Final answer: $y = 3e^{2x} - 2e^{3x}$.",
            ],
          },
        ],
      },
      {
        title: "Non-homogeneous equations and particular solutions",
        section: "nonhomog",
        body: [
          "Form: $ay'' + by' + cy = g(x)$ where $g(x) \\neq 0$. The right-hand side $g(x)$ represents an external 'forcing' — a driving input that pushes the system.",
          "The general solution has two parts: $y = y_h + y_p$. Here $y_h$ is the general solution to the homogeneous equation ($g = 0$) — it captures the system's natural behavior. $y_p$ is any particular solution that accounts for the forcing. The combination gives every possible solution.",
          "Method of undetermined coefficients: guess the form of $y_p$ based on $g(x)$ and solve for the unknown coefficients. The guesses follow a pattern:",
          "If $g(x) = Ce^{kx}$: try $y_p = Ae^{kx}$. If $g(x) = C_n x^n + \\cdots + C_0$ (polynomial): try $y_p = A_n x^n + \\cdots + A_0$ (same degree). If $g(x)$ involves $\\sin(kx)$ or $\\cos(kx)$: try $y_p = A\\cos(kx) + B\\sin(kx)$ (always include both sin and cos). If $g$ is a combination, use superposition — try the sum of individual guesses.",
          "Duplication rule: if your guess for $y_p$ duplicates a term in $y_h$, multiply by $x$ (or $x^2$ if it duplicates a repeated-root term). This ensures $y_p$ is genuinely new and not absorbed into $y_h$.",
          "Variation of parameters: a more general method that works for any $g(x)$, not just the special forms above. It uses $y_p = u_1 y_1 + u_2 y_2$ where $y_1, y_2$ are the homogeneous solutions and $u_1, u_2$ are functions found via integrals. More work, but universally applicable.",
        ],
        eli5: [
          "The homogeneous solution is what the system does 'on its own' — like a spring bouncing with no external force. The particular solution is the system's response to being pushed ($g(x)$). The full solution is the natural behavior plus the forced response.",
          "Undetermined coefficients is educated guessing: if the push is exponential, the response is exponential. If the push is sinusoidal, the response is sinusoidal. Plug in your guess, match coefficients, and the 'undetermined' coefficients become determined.",
        ],
      },
      {
        title: "Applications: springs and oscillations",
        section: "springs",
        body: [
          "A mass-spring system obeys $my'' + cy' + ky = F(t)$ where $m$ is mass, $c$ is damping, $k$ is spring constant, and $F(t)$ is external force.",
          "Undamped free oscillation ($c=0$, $F=0$): $y'' + \\omega^2 y = 0$ with $\\omega = \\sqrt{k/m}$. Solution: $y = A\\cos(\\omega t) + B\\sin(\\omega t)$. Pure sinusoidal motion.",
          "Damped oscillation ($c > 0$, $F=0$): the solution includes $e^{\\alpha t}$ with $\\alpha < 0$, causing the amplitude to decay over time.",
          "Overdamped ($c^2 > 4mk$): no oscillation, just slow return to equilibrium.",
          "Critically damped ($c^2 = 4mk$): fastest return to equilibrium without oscillating.",
          "Underdamped ($c^2 < 4mk$): oscillation with decaying amplitude.",
        ],
        eli5: [
          "Think of a kid on a swing. If nobody pushes and there's no friction, the swing goes back and forth forever at the same height — that's undamped oscillation.",
          "Now add friction (air resistance, rusty chains). The swing still goes back and forth, but each swing is a little smaller until it stops — that's underdamped (oscillation with decay).",
          "If you put the swing in thick honey, it wouldn't even swing — it would just slowly drift back to the bottom. That's overdamped. Critically damped is the sweet spot: the fastest return to rest without any overshooting. Engineers design car suspensions and door closers to be critically damped.",
        ],
      },
      {
        title: "Initial value problems (IVPs)",
        section: "ivp",
        body: [
          "An IVP provides the DE plus enough initial conditions to pin down a unique solution from the infinite family of general solutions.",
          "First-order DE: one initial condition, typically $y(x_0) = y_0$. This determines the one arbitrary constant $C$ in the general solution.",
          "Second-order DE: two initial conditions, typically $y(x_0) = y_0$ (starting position) and $y'(x_0) = v_0$ (starting velocity). These determine the two constants $C_1$ and $C_2$.",
          "Procedure: (1) find the general solution (with arbitrary constants), (2) apply the initial conditions to get a system of equations for the constants, (3) solve the system, (4) write the particular solution with specific constants.",
          "The Existence and Uniqueness Theorem (Picard-Lindelöf): if $f(x,y)$ is continuous and satisfies a Lipschitz condition in $y$ near $(x_0, y_0)$, then the IVP $y' = f(x,y)$, $y(x_0) = y_0$ has exactly one solution in some interval around $x_0$. This guarantees that solutions don't 'branch' or 'disappear' — there's always exactly one curve through each initial point.",
          "Physical interpretation: knowing the DE gives you the rules of the system (how things change). The initial conditions specify the starting state. Together, they completely determine the future (and past) behavior. This is why differential equations are the language of deterministic physics.",
        ],
        eli5: [
          "The general solution of a DE is like a family photo — it shows all possible solutions. The initial conditions pick out one specific person from the photo. For a first-order DE, one piece of information (a starting value) is enough to identify the unique solution. For second-order, you need two pieces (starting position and starting velocity).",
          "The Existence and Uniqueness Theorem is nature's promise: given the rules of change and a starting point, there is exactly one future. No ambiguity, no branching. This is what makes differential equations predictive.",
        ],
        examples: [
          {
            title: "Solving a second-order IVP",
            steps: [
              "Solve $y'' - y = 0$ with $y(0) = 2$ and $y'(0) = -1$.",
              "Characteristic equation: $r^2 - 1 = 0$, giving $r = \\pm 1$.",
              "General solution: $y = C_1 e^x + C_2 e^{-x}$.",
              "Apply $y(0) = 2$: $C_1 + C_2 = 2$.",
              "Compute $y' = C_1 e^x - C_2 e^{-x}$. Apply $y'(0) = -1$: $C_1 - C_2 = -1$.",
              "Solve the system: adding the equations gives $2C_1 = 1$, so $C_1 = 1/2$. Then $C_2 = 3/2$.",
              "Particular solution: $y = \\frac{1}{2}e^x + \\frac{3}{2}e^{-x}$.",
            ],
          },
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting the constant of integration after separating and integrating. Every integration step produces a $+C$.",
      "Not separating variables completely before integrating. All $y$-terms must be on one side, all $x$-terms on the other.",
      "Plugging in initial conditions before finding the general solution. Get the general solution with constants first, then determine the constants.",
      "Forgetting to multiply the entire equation (both sides) by the integrating factor in linear first-order DEs.",
      "For second-order equations, forgetting the repeated root case. If the characteristic equation has a double root $r$, the second solution is $xe^{rx}$, not just $e^{rx}$.",
      "In undetermined coefficients, using a guess that duplicates a homogeneous solution. You must multiply by $x$ to fix this.",
      "Confusing the general solution with a particular solution. The general solution always contains arbitrary constants; a particular solution has specific values determined by initial conditions.",
      "Dividing by $y$ in a separable equation and losing the equilibrium solution $y = 0$.",
    ],
  },
};
