import { Topic } from "@/lib/content";

export type ModuleSection = {
  title: string;
  body: string[];
};

export type ModuleContent = {
  topicId: Topic["id"];
  title: string;
  intro: string[];
  sections: ModuleSection[];
  examples: {
    title: string;
    steps: string[];
  }[];
  commonMistakes: string[];
};

export const modules: ModuleContent[] = [
  {
    topicId: "limits",
    title: "Limits & Continuity",
    intro: [
      "Limits are the language of calculus. They describe the value a function approaches as $x$ gets close to a point, even if $f(a)$ is undefined.",
      "Continuity captures when a function behaves smoothly without jumps, holes, or infinite spikes. We test continuity by comparing the limit to the actual function value.",
      "In practice, limits answer: what does the function do near a point, and what does that imply about its behavior?",
    ],
    sections: [
      {
        title: "Approaching a point",
        body: [
          "A limit asks what happens as $x$ gets close to a value, not necessarily at that value. The notation $\\lim_{x\\to a} f(x)$ means we track the outputs of $f(x)$ as $x$ approaches $a$.",
          "We compare the left-hand limit $\\lim_{x\\to a^-} f(x)$ and right-hand limit $\\lim_{x\\to a^+} f(x)$. If they match, the limit exists.",
          "If the values blow up to infinity or oscillate without settling, the limit does not exist.",
        ],
      },
      {
        title: "Indeterminate forms",
        body: [
          "When direct substitution produces $0/0$ or $\\infty/\\infty$, the expression is indeterminate. This signals we must simplify.",
          "Common tools: factor and cancel, rationalize with conjugates, or use identities like $1-\\cos x = 2\\sin^2(x/2)$.",
          "After simplifying, substitute the limit value to evaluate the expression.",
        ],
      },
      {
        title: "Continuity and piecewise functions",
        body: [
          "A function is continuous at $x=a$ when three things hold: $f(a)$ is defined, $\\lim_{x\\to a} f(x)$ exists, and the limit equals $f(a)$.",
          "For piecewise functions, you must evaluate the left and right limits separately.",
          "Polynomials, exponentials, and trig functions are continuous everywhere in their domains, so you can evaluate limits by direct substitution there.",
        ],
      },
      {
        title: "Limits at infinity",
        body: [
          "Limits as $x\\to \\infty$ describe long-run behavior. Compare dominant terms: for rational functions, divide by the highest power of $x$.",
          "If the highest powers cancel, you may get a horizontal asymptote. If they don't, the function may grow without bound.",
        ],
      },
    ],
    examples: [
      {
        title: "Factoring out a removable discontinuity",
        steps: [
          "Compute $\\lim_{x\\to 3} (x^2-9)/(x-3)$.",
          "Factor the numerator: $(x-3)(x+3)$.",
          "Cancel $(x-3)$, then substitute: $3+3=6$.",
        ],
      },
      {
        title: "Rationalizing a radical",
        steps: [
          "Compute $\\lim_{x\\to 0} (\\sqrt{1+x}-1)/x$.",
          "Multiply by the conjugate: $(\\sqrt{1+x}+1)/(\\sqrt{1+x}+1)$.",
          "Simplify to $1/(\\sqrt{1+x}+1)$, then substitute $x=0$ to get $1/2$.",
        ],
      },
      {
        title: "Limits at infinity",
        steps: [
          "Compute $\\lim_{x\\to \\infty} (2x^2+3x+1)/(x^2-4)$.",
          "Divide by $x^2$: $\\frac{2+3/x+1/x^2}{1-4/x^2}$.",
          "As $x\\to \\infty$, the limit is $2$.",
        ],
      },
    ],
    commonMistakes: [
      "Plugging in too early before simplifying indeterminate forms.",
      "Ignoring one-sided behavior when a function is piecewise or has a cusp.",
      "Confusing continuity with differentiability. A function can be continuous but not differentiable.",
      "Forgetting to check domain restrictions when canceling factors.",
    ],
  },
  {
    topicId: "derivatives",
    title: "Derivatives",
    intro: [
      "Derivatives measure instantaneous rate of change and the slope of the tangent line to a curve.",
      "They power velocity, optimization, sensitivity analysis, and any question about how fast something changes.",
      "Think of the derivative as the best linear approximation to a function near a point.",
    ],
    sections: [
      {
        title: "Core rules",
        body: [
          "Power rule: if $f(x)=x^n$, then $f'(x)=nx^{n-1}$. Constants factor out.",
          "Core derivatives: $\\frac{d}{dx}\\sin x = \\cos x$, $\\frac{d}{dx}\\cos x = -\\sin x$, $\\frac{d}{dx}e^x = e^x$, and $\\frac{d}{dx}\\ln x = 1/x$.",
          "Combine rules to handle sums, differences, and scalar multiples efficiently.",
        ],
      },
      {
        title: "Chain, product, and quotient rules",
        body: [
          "Chain rule: if $f(x)=g(h(x))$, then $f'(x)=g'(h(x))\\cdot h'(x)$.",
          "Product rule: $(uv)' = u'v + uv'$. Use it when two functions multiply.",
          "Quotient rule: $(u/v)' = (u'v - uv')/v^2$.",
        ],
      },
      {
        title: "Interpreting derivatives",
        body: [
          "A positive derivative means the function is increasing; a negative derivative means decreasing.",
          "Critical points occur where $f'(x)=0$ or is undefined. They are candidates for maxima or minima.",
          "Second derivative tests concavity and helps confirm extrema.",
        ],
      },
      {
        title: "Tangent line and linearization",
        body: [
          "The tangent line at $x=a$ is $y=f(a)+f'(a)(x-a)$.",
          "Linearization gives a fast approximation: $f(a+\\Delta x) \\approx f(a)+f'(a)\\Delta x$.",
        ],
      },
    ],
    examples: [
      {
        title: "Power rule",
        steps: [
          "Differentiate $f(x)=3x^4$.",
          "Apply the power rule: $4\\cdot 3x^3$.",
          "Result: $12x^3$.",
        ],
      },
      {
        title: "Chain rule",
        steps: [
          "Differentiate $f(x)=\\sin(2x)$.",
          "Derivative of $\\sin(u)$ is $\\cos(u)$ times $u'$.",
          "Result: $2\\cos(2x)$.",
        ],
      },
      {
        title: "Quotient rule",
        steps: [
          "Differentiate $f(x)=\\frac{x^2+1}{x}$.",
          "Use $(u/v)' = (u'v-uv')/v^2$ with $u=x^2+1$, $v=x$.",
          "Result: $\\frac{2x\\cdot x-(x^2+1)\\cdot 1}{x^2} = \\frac{x^2-1}{x^2}$.",
        ],
      },
    ],
    commonMistakes: [
      "Forgetting the inner derivative in the chain rule.",
      "Applying the power rule to non-power functions like $\\sin x$ or $e^x$.",
      "Dropping constants that should stay attached to the derivative.",
      "Using the product rule when you can simplify first.",
    ],
  },
  {
    topicId: "integrals",
    title: "Integrals",
    intro: [
      "Integrals measure accumulation: area, total change, and net value.",
      "Before the $\\int$ symbol, imagine adding up infinitely many tiny rectangles under a curve. That sum is a Riemann Sum, and the integral is its limit.",
      "Learning integrals means mastering antiderivatives and interpreting what the accumulated quantity represents.",
    ],
    sections: [
      {
        title: "The big idea: summing the small (Riemann sum)",
        body: [
          "Break an interval into tiny widths $\\Delta x$ and build rectangles with height $f(x_i)$.",
          "The total area is approximately $\\sum f(x_i)\\Delta x$; as $\\Delta x\\to 0$, this approaches the integral $\\int_a^b f(x)dx$.",
          "This is why integrals represent accumulation: we are adding up infinitely many small pieces.",
        ],
      },
      {
        title: "The connection to derivatives",
        body: [
          "Derivative: if I give you position, you tell me speed (instant change).",
          "Integral: if I give you speed, you tell me position (total accumulated change).",
          "Example: if $v(t)$ is velocity, then total distance traveled from $0$ to $T$ is $\\int_0^T v(t)dt$.",
        ],
      },
      {
        title: "Definite integrals and the FTC",
        body: [
          "Definite integrals compute net area over an interval.",
          "The Fundamental Theorem of Calculus says $\\int_a^b f(x)dx = F(b)-F(a)$ where $F'(x)=f(x)$.",
          "Negative area occurs when the function is below the x-axis; interpret it as net change.",
        ],
      },
      {
        title: "Net area vs. total area",
        body: [
          "Think of net area as net change: positive area adds, negative area subtracts.",
          "Analogy: water flows into a tank above the axis and flows out below it. The integral tells you the final water level.",
        ],
      },
      {
        title: "Antiderivatives (indefinite integrals)",
        body: [
          "Indefinite integrals represent families of functions that share the same derivative.",
          "Always include $+C$ for the constant of integration because derivatives eliminate constants.",
          "If $f'(x)$ is known, then $\\int f'(x)dx = f(x)+C$.",
        ],
      },
      {
        title: "Common integrals (core toolbox)",
        body: [
          "- $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ for $n\\neq -1$.",
          "- $\\int \\frac{1}{x} dx = \\ln|x| + C$.",
          "- $\\int e^x dx = e^x + C$ and $\\int a^x dx = \\frac{a^x}{\\ln a} + C$.",
          "- $\\int \\sin x dx = -\\cos x + C$ and $\\int \\cos x dx = \\sin x + C$.",
          "- $\\int \\sec^2 x dx = \\tan x + C$ and $\\int \\csc^2 x dx = -\\cot x + C$.",
          "- $\\int \\sec x\\tan x dx = \\sec x + C$ and $\\int \\csc x\\cot x dx = -\\csc x + C$.",
        ],
      },
      {
        title: "Substitution (reverse chain rule)",
        body: [
          "If an integrand looks like $g(h(x))h'(x)$, let $u=h(x)$ to simplify.",
          "Example pattern: $\\int 2x\\cos(x^2) dx$ becomes $\\int \\cos u\\, du$ with $u=x^2$.",
        ],
      },
      {
        title: "Integration by parts (reverse product rule)",
        body: [
          "When you see a product of functions, try integration by parts: $\\int u\\,dv = uv - \\int v\\,du$.",
          "Pick $u$ to get simpler when differentiated (often use the LIATE heuristic).",
        ],
      },
      {
        title: "Partial fractions",
        body: [
          "Rational functions can be split into simpler fractions that are easier to integrate.",
          "Example idea: $\\frac{1}{x^2-1} = \\frac{A}{x-1} + \\frac{B}{x+1}$, then integrate each piece.",
        ],
      },
      {
        title: "Which rule do I use?",
        body: [
          "Simplify first: can algebra reduce it to a basic rule?",
          "Basic formulas: is it a trig or exponential form you already know?",
          "Substitution: is there an inside function whose derivative is also present?",
          "Product of functions: consider integration by parts.",
          "Rational function: try partial fractions.",
        ],
      },
      {
        title: "Interpretations",
        body: [
          "Integrals appear in distance, work, total revenue, and probability.",
          "They help predict real-world quantities like total energy used or the position of a satellite given its velocity.",
        ],
      },
    ],
    examples: [
      {
        title: "Power rule for integrals",
        steps: [
          "Compute $\\int x^3 dx$.",
          "Increase the exponent by 1 and divide: $x^4/4$.",
          "Add the constant: $x^4/4 + C$.",
        ],
      },
      {
        title: "Natural log integral",
        steps: [
          "Compute $\\int \\frac{1}{x} dx$.",
          "This is a special case where the power rule fails.",
          "Result: $\\ln|x|+C$.",
        ],
      },
      {
        title: "Substitution",
        steps: [
          "Compute $\\int 2x\\cos(x^2) dx$.",
          "Let $u=x^2$, then $du=2x\\,dx$.",
          "Integral becomes $\\int \\cos u\\, du = \\sin u + C = \\sin(x^2)+C$.",
        ],
      },
      {
        title: "Definite integral",
        steps: [
          "Compute $\\int_0^2 3x^2 dx$.",
          "Antiderivative is $x^3$.",
          "Evaluate from 0 to 2: $8 - 0 = 8$.",
        ],
      },
    ],
    commonMistakes: [
      "Forgetting $+C$ on indefinite integrals.",
      "Using the power rule for $\\int 1/x dx$ (it does not apply).",
      "Missing the inner derivative when doing substitution.",
      "Mixing up the bounds when evaluating a definite integral.",
    ],
  },
  {
    topicId: "applications",
    title: "Applications of Derivatives",
    intro: [
      "Derivatives unlock real-world questions like maximizing profit or minimizing time.",
      "Applications translate word problems into functions, then interpret critical points and rates.",
      "The key skill is translating words into equations and choosing the right variable.",
    ],
    sections: [
      {
        title: "Optimization",
        body: [
          "Translate the word problem into an objective function and a constraint.",
          "Use the constraint to rewrite the objective in one variable.",
          "Find critical points and compare values to determine the best outcome.",
        ],
      },
      {
        title: "Related rates",
        body: [
          "Relate multiple changing quantities with an equation.",
          "Differentiate with respect to time and plug in known values.",
          "Keep units consistent and interpret the sign of the result.",
        ],
      },
      {
        title: "Motion",
        body: [
          "Velocity is the derivative of position; acceleration is the derivative of velocity.",
          "Use derivatives to find peaks, stops, and direction changes.",
          "A change in sign of velocity indicates a change in direction.",
        ],
      },
      {
        title: "Mean value and marginal change",
        body: [
          "Average rate of change over $[a,b]$ is $\\frac{f(b)-f(a)}{b-a}$.",
          "The Mean Value Theorem guarantees a point where the instantaneous rate equals the average rate.",
          "Marginal change in economics is a derivative: $\\frac{d}{dq}C(q)$ gives marginal cost.",
        ],
      },
    ],
    examples: [
      {
        title: "Optimization",
        steps: [
          "A rectangle has perimeter 20. Maximize area.",
          "Let width be $w$. Then height is $10 - w$.",
          "Area $A = w(10 - w)$, maximize at $w=5$.",
        ],
      },
      {
        title: "Related rates",
        steps: [
          "A balloon radius grows at $2$ cm/s. Find $dV/dt$ when $r=3$.",
          "Volume $V = \\frac{4}{3}\\pi r^3$, so $\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}$.",
          "Plug in $r=3$: $dV/dt = 72\\pi$ cm$^3$/s.",
        ],
      },
      {
        title: "Motion",
        steps: [
          "Position $s(t)=t^3-6t^2+9t$.",
          "Velocity $v(t)=3t^2-12t+9$, set to zero to find stops.",
          "Critical times are $t=1$ and $t=3$.",
        ],
      },
    ],
    commonMistakes: [
      "Skipping the step of defining variables clearly.",
      "Differentiating with respect to $x$ instead of time in related rates.",
      "Forgetting to test endpoints in optimization problems.",
      "Solving for a critical point but not checking whether it is a max or min.",
    ],
  },
  {
    topicId: "series",
    title: "Series & Sequences",
    intro: [
      "Sequences are ordered lists of numbers; series are sums of sequences.",
      "The big question: does the sum converge to a finite value or diverge?",
      "Series are essential for approximations and understanding infinite processes.",
    ],
    sections: [
      {
        title: "Sequences and limits",
        body: [
          "A sequence $a_n$ converges if $\\lim_{n\\to\\infty} a_n$ exists and is finite.",
          "If $a_n$ does not settle to a finite value, the sequence diverges.",
        ],
      },
      {
        title: "Geometric series",
        body: [
          "A geometric series has the form $\\sum_{n=0}^{\\infty} ar^n$.",
          "It converges when $|r|<1$ and sums to $\\frac{a}{1-r}$.",
        ],
      },
      {
        title: "Common tests",
        body: [
          "Divergence test: if $\\lim_{n\\to\\infty} a_n \\neq 0$, the series diverges.",
          "Comparison test: compare to a known convergent or divergent series.",
          "Ratio test: if $\\lim |a_{n+1}/a_n| < 1$, the series converges.",
        ],
      },
      {
        title: "Power series",
        body: [
          "Power series look like $\\sum c_n (x-a)^n$ and converge within a radius $R$.",
          "Inside the radius of convergence, power series behave like polynomials.",
        ],
      },
    ],
    examples: [
      {
        title: "Geometric series sum",
        steps: [
          "Compute $\\sum_{n=0}^{\\infty} (1/3)^n$.",
          "Here $a=1$ and $r=1/3$.",
          "Sum is $\\frac{1}{1-1/3} = 3/2$.",
        ],
      },
      {
        title: "Ratio test",
        steps: [
          "Test $\\sum \\frac{n!}{3^n}$.",
          "Compute $\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{n+1}{3}$.",
          "Limit diverges to $\\infty$, so the series diverges.",
        ],
      },
    ],
    commonMistakes: [
      "Forgetting that a necessary condition for convergence is $a_n\\to 0$.",
      "Applying the ratio test to series where a simpler comparison would work.",
      "Ignoring endpoint checks for power series.",
    ],
  },
  {
    topicId: "differential-equations",
    title: "Differential Equations",
    intro: [
      "Differential equations connect a function to its derivatives.",
      "They model growth, decay, motion, and systems that evolve over time.",
      "The simplest class you will master first is separable equations.",
    ],
    sections: [
      {
        title: "Separable equations",
        body: [
          "If $\\frac{dy}{dx} = g(x)h(y)$, you can separate variables: $\\frac{1}{h(y)}dy = g(x)dx$.",
          "Integrate both sides to solve for $y$.",
        ],
      },
      {
        title: "Exponential growth and decay",
        body: [
          "Model: $\\frac{dy}{dx} = ky$ has solution $y=Ce^{kx}$.",
          "If $k>0$, growth; if $k<0$, decay.",
        ],
      },
      {
        title: "Initial value problems",
        body: [
          "An initial value like $y(0)=y_0$ determines the constant $C$.",
          "Plug in the initial condition to solve for $C$.",
        ],
      },
    ],
    examples: [
      {
        title: "Basic separable equation",
        steps: [
          "Solve $\\frac{dy}{dx} = 3x$.",
          "Integrate both sides: $y = \\frac{3}{2}x^2 + C$.",
          "This is the general solution.",
        ],
      },
      {
        title: "Exponential growth",
        steps: [
          "Solve $\\frac{dy}{dx} = 2y$ with $y(0)=5$.",
          "Solution form: $y=Ce^{2x}$.",
          "Plug in: $5=C$, so $y=5e^{2x}$.",
        ],
      },
    ],
    commonMistakes: [
      "Forgetting the constant of integration.",
      "Not separating variables completely before integrating.",
      "Solving for $C$ incorrectly when an initial value is given.",
    ],
  },
];
