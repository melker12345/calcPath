import type { Topic } from "@/lib/shared-types";
import { limitsModule, derivativesModule, integralsModule } from "./modules/calculus";


export type WorkedExample = {
  title: string;
  steps: string[];
};

export type ModuleSection = {
  title: string;
  /**
   * Stable slug used for progress tracking and deep links.
   * MUST match the `section` field on the corresponding questions exactly
   * (e.g. "squeeze", "lhopital", "chain", "gauss", "confidence-intervals").
   * When present, the dashboard and practice pages can show accurate per-section progress.
   */
  section?: string;
  body: string[];
  /** Optional "Explain Like I'm 5" — simpler, intuition-based explanation */
  eli5?: string[];
  /** Inline worked examples for this section (1-2 detailed examples) */
  examples?: WorkedExample[];
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
  limitsModule,  // extracted
  derivativesModule,  // extracted
  integralsModule,  // extracted
  {
    topicId: "applications",
    title: "Applications of Derivatives",
    intro: [
      "This module is where derivatives become powerful tools for solving real problems. You'll learn to find the maximum and minimum values of functions, sketch curves, analyze motion, and solve problems where multiple quantities change simultaneously.",
      "The core idea: the derivative gives you information about how a function behaves. A positive derivative means the function is increasing. A zero derivative marks a potential extreme point. The second derivative tells you about curvature.",
      "Mastering applications requires translating real-world scenarios into mathematical functions, then using derivative tools to extract answers. Practice the translation step as much as the calculus.",
    ],
    sections: [
      {
        title: "Critical points and the first derivative test",
        section: "critical",
        body: [
          "A critical point of $f$ occurs at $x=c$ where $f'(c) = 0$ or $f'(c)$ is undefined (and $f(c)$ exists).",
          "The first derivative test: examine the sign of $f'(x)$ on either side of the critical point.",
          "If $f'$ changes from $+$ to $-$ at $c$, then $f(c)$ is a local maximum.",
          "If $f'$ changes from $-$ to $+$ at $c$, then $f(c)$ is a local minimum.",
          "If $f'$ does not change sign (e.g., $f(x) = x^3$ at $x=0$), the critical point is neither a max nor a min.",
          "To apply: find all critical points, then build a sign chart for $f'(x)$ using test values in each interval.",
        ],
        examples: [
          {
            title: "Finding and classifying critical points",
            steps: [
              "Find and classify the critical points of $f(x) = x^3 - 3x + 1$.",
              "Step 1 — find $f'(x)$: $f'(x) = 3x^2 - 3 = 3(x^2 - 1) = 3(x-1)(x+1)$.",
              "Step 2 — set $f'(x) = 0$: $x = -1$ and $x = 1$ are the critical points.",
              "Step 3 — build a sign chart. Test values in each interval:",
              "On $(-\\infty, -1)$, try $x = -2$: $f'(-2) = 3(4-1) = 9 > 0$. Increasing.",
              "On $(-1, 1)$, try $x = 0$: $f'(0) = 3(0-1) = -3 < 0$. Decreasing.",
              "On $(1, \\infty)$, try $x = 2$: $f'(2) = 3(4-1) = 9 > 0$. Increasing.",
              "At $x = -1$: $f'$ changes from $+$ to $-$, so this is a local maximum. $f(-1) = -1+3+1 = 3$.",
              "At $x = 1$: $f'$ changes from $-$ to $+$, so this is a local minimum. $f(1) = 1-3+1 = -1$.",
            ],
          },
        ],
      },
      {
        title: "The second derivative test",
        section: "secondderiv",
        body: [
          "An alternative to the first derivative test that avoids building a sign chart. At a critical point where $f'(c) = 0$:",
          "If $f''(c) > 0$: the curve is concave up (bowl-shaped) at $c$, so $f(c)$ is a local minimum. The function is curving upward — any nearby point is higher.",
          "If $f''(c) < 0$: the curve is concave down (arch-shaped) at $c$, so $f(c)$ is a local maximum. The function is curving downward — any nearby point is lower.",
          "If $f''(c) = 0$: the test is inconclusive. The critical point could be a min, max, or neither. Fall back to the first derivative test. Example: $f(x) = x^4$ at $x=0$ has $f''(0)=0$ but it's still a minimum. Meanwhile $f(x)=x^3$ at $x=0$ has $f''(0)=0$ and it's neither.",
          "When to use which: the second derivative test is faster when $f''$ is easy to compute. The first derivative test (sign chart) is more reliable — it never fails and also works when $f'$ is undefined.",
        ],
        eli5: [
          "At a critical point, the first derivative is zero — the function is flat for an instant. The second derivative decides what happens next: is the curve smiling (concave up → minimum) or frowning (concave down → maximum)?",
          "It's like standing at the bottom of a valley (minimum, curve smiles upward around you) vs. standing on top of a hill (maximum, curve frowns downward around you).",
        ],
        examples: [
          {
            title: "Classifying critical points with the second derivative test",
            steps: [
              "Classify the critical points of $f(x) = x^4 - 4x^3 + 6$.",
              "$f'(x) = 4x^3 - 12x^2 = 4x^2(x - 3)$. Critical points: $x = 0$ and $x = 3$.",
              "$f''(x) = 12x^2 - 24x = 12x(x-2)$.",
              "At $x = 3$: $f''(3) = 12(3)(1) = 36 > 0$. Concave up → local minimum. $f(3) = 81 - 108 + 6 = -21$.",
              "At $x = 0$: $f''(0) = 0$. Inconclusive! Must use the first derivative test.",
              "Sign chart for $f'$ near $x=0$: $f'(-1) = 4(1)(-4) = -16 < 0$ and $f'(1) = 4(1)(-2) = -8 < 0$. No sign change → $x=0$ is neither a max nor a min (it's a flat inflection-like point).",
            ],
          },
        ],
      },
      {
        title: "Concavity and inflection points",
        section: "concavity",
        body: [
          "Concavity describes how the curve bends. $f''(x) > 0$ means concave up (opening upward), $f''(x) < 0$ means concave down (opening downward).",
          "An inflection point is where the concavity changes: $f''$ switches sign. At an inflection point, the curve transitions from bending one way to bending the other.",
          "To find inflection points: set $f''(x) = 0$ (or find where $f''$ is undefined), then verify $f''$ changes sign across that point.",
          "Example: $f(x) = x^3$ has $f''(x) = 6x$. This equals $0$ at $x=0$, and changes from negative to positive. So $(0, 0)$ is an inflection point.",
          "Note: $f''(c) = 0$ alone is not enough. $f(x) = x^4$ has $f''(0) = 0$ but no inflection point (concavity doesn't change).",
        ],
        eli5: [
          "Concave up means the curve smiles (like a bowl that holds water). Concave down means the curve frowns (like an upside-down bowl that spills water).",
          "An inflection point is where the curve switches from smiling to frowning or vice versa. It's the moment the mood changes.",
          "The second derivative tells you which mood the curve is in. Positive = happy (smiling/concave up). Negative = sad (frowning/concave down). Zero = the transition point where it might be switching moods.",
        ],
      },
      {
        title: "Absolute extrema on closed intervals (Extreme Value Theorem)",
        section: "extrema",
        body: [
          "The Extreme Value Theorem (EVT): if $f$ is continuous on a closed interval $[a,b]$, then $f$ attains an absolute maximum and an absolute minimum somewhere on $[a,b]$. Both 'continuous' and 'closed interval' are required — remove either condition and the theorem can fail.",
          "The closed interval method to find them:",
          "Step 1: Find all critical points of $f$ in the open interval $(a,b)$ — where $f'(x)=0$ or $f'$ is undefined.",
          "Step 2: Evaluate $f$ at each critical point and at both endpoints $a$ and $b$. Build a table of $(x, f(x))$ values.",
          "Step 3: The largest $f$-value in the table is the absolute maximum, the smallest is the absolute minimum.",
          "This is the go-to method for any 'find the max/min on an interval' problem. The absolute extrema must occur at a critical point or an endpoint — there's nowhere else for them to hide. Never forget the endpoints!",
        ],
        eli5: [
          "If you hike a continuous trail from point A to point B, there must be a highest point and a lowest point somewhere along the way. The Extreme Value Theorem guarantees this — a continuous function on a closed interval always has a peak and a valley.",
          "The closed interval method is just checking all the 'suspicious spots' (critical points + endpoints) and seeing which has the highest and lowest value. It's foolproof because the extreme values can only occur at these spots.",
        ],
        examples: [
          {
            title: "Finding absolute extrema on a closed interval",
            steps: [
              "Find the absolute max and min of $f(x) = 2x^3 - 3x^2 - 12x + 5$ on $[-2, 3]$.",
              "$f'(x) = 6x^2 - 6x - 12 = 6(x^2 - x - 2) = 6(x-2)(x+1)$.",
              "Critical points in $(-2, 3)$: $x = -1$ and $x = 2$.",
              "Evaluate $f$ at all candidates: $f(-2) = -16-12+24+5 = 1$, $f(-1) = -2-3+12+5 = 12$, $f(2) = 16-12-24+5 = -15$, $f(3) = 54-27-36+5 = -4$.",
              "Absolute maximum: $f(-1) = 12$. Absolute minimum: $f(2) = -15$.",
              "Notice: the absolute minimum occurred at an interior critical point, not an endpoint. You must check all candidates.",
            ],
          },
        ],
      },
      {
        title: "Curve sketching (putting it all together)",
        section: "curvesketch",
        body: [
          "A complete curve sketch synthesizes everything you've learned about derivatives into a picture. Follow this checklist systematically:",
          "1. Domain and intercepts: where is $f$ defined? Set $f(x)=0$ for $x$-intercepts, evaluate $f(0)$ for the $y$-intercept.",
          "2. Symmetry: is $f$ even ($f(-x)=f(x)$, symmetric about $y$-axis), odd ($f(-x)=-f(x)$, symmetric about origin), or neither? This can halve your work.",
          "3. First derivative analysis: find critical points (where $f'=0$ or undefined). Build a sign chart to determine intervals of increase ($f'>0$) and decrease ($f'<0$). Classify each critical point as local max, local min, or neither.",
          "4. Second derivative analysis: find inflection point candidates (where $f''=0$ or undefined). Build a sign chart for $f''$ to determine concavity (up where $f''>0$, down where $f''<0$). Verify sign changes for actual inflection points.",
          "5. Asymptotes: vertical (denominator → 0 with nonzero numerator), horizontal ($\\lim_{x\\to\\pm\\infty}$), and oblique/slant (when degree of numerator = degree of denominator + 1).",
          "6. Plot key points (intercepts, critical points, inflection points) and connect the dots, respecting the increase/decrease direction and concavity at every point.",
        ],
        eli5: [
          "Curve sketching is like assembling a puzzle. Each piece of information (intercepts, increasing/decreasing, concavity, asymptotes) constrains what the picture can look like. By the time you've gathered all the pieces, there's essentially only one shape that fits.",
          "You don't need to plot hundreds of points. A handful of strategic points (critical points, inflection points, intercepts) combined with the qualitative information (going up or down? curving toward or away?) is enough to sketch an accurate shape.",
        ],
        examples: [
          {
            title: "Full curve sketch of a cubic",
            steps: [
              "Sketch $f(x) = x^3 - 3x$.",
              "Domain: all reals. Intercepts: $f(0) = 0$ ($y$-intercept). $x^3 - 3x = x(x^2-3) = 0$ gives $x = 0, \\pm\\sqrt{3}$.",
              "Symmetry: $f(-x) = -x^3 + 3x = -(x^3-3x) = -f(x)$. The function is odd — symmetric about the origin.",
              "$f'(x) = 3x^2 - 3 = 3(x-1)(x+1)$. Critical points: $x = -1$ and $x = 1$.",
              "Sign chart for $f'$: positive on $(-\\infty,-1)$, negative on $(-1,1)$, positive on $(1,\\infty)$. So $f$ increases, then decreases, then increases.",
              "$f(-1) = 2$ (local max), $f(1) = -2$ (local min).",
              "$f''(x) = 6x$. Zero at $x = 0$. Negative for $x<0$ (concave down), positive for $x>0$ (concave up). Inflection point at $(0, 0)$.",
              "Shape: rises to local max $(-1, 2)$, curves concave-down through $(0,0)$, falls to local min $(1, -2)$, then rises — the classic S-shaped cubic.",
            ],
          },
        ],
      },
      {
        title: "Optimization problems",
        section: "optimization",
        body: [
          "The general strategy for optimization word problems:",
          "Step 1: Draw a diagram and define variables. Label everything.",
          "Step 2: Write the objective function (what you want to maximize or minimize).",
          "Step 3: Write the constraint equation (the relationship that limits your variables).",
          "Step 4: Use the constraint to eliminate one variable from the objective, getting a function of a single variable.",
          "Step 5: Find the critical points of this function. Test them (and the endpoints, if the domain is closed) to identify the optimum.",
          "Step 6: Answer the original question. Make sure you're solving for what was asked.",
          "Common setups: maximize area given a perimeter constraint, minimize material given a volume constraint, maximize revenue.",
        ],
        examples: [
          {
            title: "Optimization: minimizing material for a box",
            steps: [
              "Design an open-top box with volume $32\\text{ cm}^3$ using the least material. The base is square.",
              "Step 1 — define variables: let $x$ = side length of the square base, $h$ = height.",
              "Step 2 — objective function: surface area (what we minimize). Open top means: $S = x^2 + 4xh$ (base + 4 sides, no top).",
              "Step 3 — constraint: volume $= x^2 h = 32$, so $h = \\frac{32}{x^2}$.",
              "Step 4 — substitute to get one variable: $S(x) = x^2 + 4x \\cdot \\frac{32}{x^2} = x^2 + \\frac{128}{x}$.",
              "Step 5 — differentiate: $S'(x) = 2x - \\frac{128}{x^2}$.",
              "Set $S'(x) = 0$: $2x = \\frac{128}{x^2}$, so $2x^3 = 128$, giving $x^3 = 64$, thus $x = 4$.",
              "Then $h = \\frac{32}{16} = 2$.",
              "Step 6 — verify minimum: $S''(x) = 2 + \\frac{256}{x^3}$. At $x=4$: $S''(4) = 2 + 4 = 6 > 0$. Confirmed minimum.",
              "Minimum surface area: $S(4) = 16 + 32 = 48\\text{ cm}^2$.",
            ],
          },
        ],
      },
      {
        title: "Related rates",
        section: "relatedrates",
        body: [
          "Related rates problems involve multiple quantities changing over time, connected by a geometric or physical equation.",
          "Step 1: Draw a picture and identify all variables. Label which quantities are changing.",
          "Step 2: Write an equation relating the variables (e.g., Pythagorean theorem, area formula, volume formula).",
          "Step 3: Differentiate both sides with respect to time $t$ using implicit differentiation.",
          "Step 4: Plug in all known values and rates at the specific instant in question.",
          "Step 5: Solve for the unknown rate.",
          "Critical: never plug in specific values before differentiating. The equation must remain general during differentiation because the variables are changing.",
          "Common setups: expanding balloon (sphere volume), sliding ladder (Pythagorean theorem), filling cone (similar triangles + cone volume), spreading oil slick (circle area).",
        ],
        eli5: [
          "Imagine you're blowing up a balloon. You know how fast you're blowing air in (liters per second). You want to know how fast the radius is growing. Those two rates are related through the formula for the volume of a sphere.",
          "The trick is: write down the equation that connects the things that are changing (like volume and radius). Then take the derivative of the whole equation with respect to time. This creates a new equation that connects the rates of change instead of the quantities themselves.",
          "The #1 rule: don't plug in numbers too early. The whole point is that the variables are changing, so you need to differentiate first while everything is still a variable. Only after differentiating do you plug in the specific moment you care about.",
        ],
        examples: [
          {
            title: "Related rates: a sliding ladder",
            steps: [
              "A 10-ft ladder leans against a wall. The base slides away at 1 ft/s. How fast is the top sliding down when the base is 6 ft from the wall?",
              "Step 1 — draw and label: $x$ = distance from base to wall, $y$ = height of top on wall. Both change with time $t$.",
              "Step 2 — equation relating variables: by the Pythagorean theorem, $x^2 + y^2 = 100$ (the ladder is always 10 ft).",
              "Step 3 — differentiate with respect to $t$: $2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0$.",
              "Note: we did NOT plug in numbers yet. This is critical — both $x$ and $y$ are changing.",
              "Step 4 — plug in the known values at the instant in question: $x = 6$, $\\frac{dx}{dt} = 1$. Find $y$: $y = \\sqrt{100 - 36} = 8$.",
              "Step 5 — solve: $2(6)(1) + 2(8)\\frac{dy}{dt} = 0$, so $12 + 16\\frac{dy}{dt} = 0$, giving $\\frac{dy}{dt} = -\\frac{3}{4}$.",
              "The top slides down at $\\frac{3}{4}$ ft/s. The negative sign confirms the top is moving downward.",
            ],
          },
        ],
      },
      {
        title: "Motion along a line",
        section: "motion",
        body: [
          "Given a position function $s(t)$: velocity is $v(t) = s'(t)$ and acceleration is $a(t) = v'(t) = s''(t)$. This is the most natural physical application of derivatives.",
          "The particle is moving right (positive direction) when $v(t) > 0$ and moving left when $v(t) < 0$. The particle is at rest (momentarily stopped) when $v(t) = 0$.",
          "Direction change: the particle changes direction when $v(t) = 0$ and the velocity changes sign. If $v$ doesn't change sign, the particle merely pauses.",
          "Speed vs. velocity: velocity is signed (includes direction), speed is $|v(t)|$ (always non-negative). The particle speeds up when velocity and acceleration have the same sign (both positive or both negative) and slows down when they have opposite signs.",
          "Displacement vs. total distance: $\\int_a^b v(t)\\,dt$ gives displacement (net change in position, which can be zero if the particle returns). $\\int_a^b |v(t)|\\,dt$ gives total distance traveled (always ≥ 0). To compute total distance, find where $v(t) = 0$, split the integral, and flip signs on intervals where $v < 0$.",
        ],
        eli5: [
          "Imagine tracking a car on a straight road. Position tells you where it is. Velocity tells you how fast and which direction. Acceleration tells you whether it's speeding up or slowing down.",
          "Displacement is like 'how far from where you started?' If you drive 3 miles east and then 3 miles west, your displacement is 0 (you're back where you started). But your total distance is 6 miles (you actually drove 6 miles). The integral of velocity gives displacement; the integral of |velocity| gives total distance.",
        ],
        examples: [
          {
            title: "Analyzing particle motion",
            steps: [
              "A particle has position $s(t) = t^3 - 6t^2 + 9t$ for $t \\geq 0$. Describe its motion.",
              "$v(t) = s'(t) = 3t^2 - 12t + 9 = 3(t-1)(t-3)$.",
              "$v(t) = 0$ at $t = 1$ and $t = 3$ — the particle stops at these times.",
              "Sign chart: $v > 0$ on $(0,1)$ (moving right), $v < 0$ on $(1,3)$ (moving left), $v > 0$ on $(3,\\infty)$ (moving right again).",
              "The particle changes direction at $t = 1$ and $t = 3$.",
              "$a(t) = 6t - 12 = 0$ at $t = 2$. For $t < 2$, $a < 0$; for $t > 2$, $a > 0$.",
              "On $(0,1)$: $v > 0$, $a < 0$ — moving right but slowing down. On $(1,2)$: $v < 0$, $a < 0$ — moving left and speeding up. On $(2,3)$: $v < 0$, $a > 0$ — moving left but slowing down.",
            ],
          },
        ],
      },
      {
        title: "Linearization and differentials",
        section: "linearization",
        body: [
          "The linearization of $f$ at $a$ is $L(x) = f(a) + f'(a)(x-a)$. This is the equation of the tangent line at $x = a$, repurposed as an approximation tool.",
          "For values of $x$ near $a$, $f(x) \\approx L(x)$. The closer $x$ is to $a$, the better the approximation. This is the foundation of how engineers and scientists do quick estimates without a calculator.",
          "Differentials formalize this: if $y = f(x)$, then $dy = f'(x)\\,dx$ is the approximate change in $y$ when $x$ changes by a small amount $dx$. The actual change is $\\Delta y = f(x+dx) - f(x)$, and $dy \\approx \\Delta y$ when $dx$ is small.",
          "Why this works: the tangent line is the best linear approximation to the curve at that point. For tiny changes, a curve behaves almost exactly like its tangent line. The error is proportional to $(x-a)^2$, so it vanishes quickly as $x \\to a$.",
          "Applications: estimating values like $\\sqrt{4.02}$ or $\\sin(0.1)$ by hand, error propagation in measurements, and building the intuition that leads to Taylor series (which extend this idea to quadratic, cubic, and higher-degree approximations).",
        ],
        eli5: [
          "Imagine zooming in very close to a curve. It starts to look like a straight line. Linearization says: use that straight line as an approximation. If you only need a quick estimate for a value near the zoom point, the line is plenty accurate.",
          "For example, $\\sqrt{4} = 2$ is easy. What about $\\sqrt{4.02}$? Instead of computing it exactly, slide along the tangent line a tiny bit: the slope is $\\frac{1}{4}$, so the answer is approximately $2 + \\frac{1}{4}(0.02) = 2.005$. The actual value is $2.00499...$  — incredibly close!",
        ],
        examples: [
          {
            title: "Linearization to estimate a cube root",
            steps: [
              "Estimate $\\sqrt[3]{8.1}$ using linearization.",
              "Choose $f(x) = \\sqrt[3]{x} = x^{1/3}$ and anchor at $a = 8$ (because $\\sqrt[3]{8} = 2$ is exact).",
              "$f'(x) = \\frac{1}{3}x^{-2/3} = \\frac{1}{3x^{2/3}}$. So $f'(8) = \\frac{1}{3 \\cdot 4} = \\frac{1}{12}$.",
              "Linearization: $L(x) = 2 + \\frac{1}{12}(x - 8)$.",
              "Estimate: $L(8.1) = 2 + \\frac{1}{12}(0.1) = 2 + 0.00833 \\approx 2.0083$.",
              "Actual value: $\\sqrt[3]{8.1} \\approx 2.00830...$  The estimate is accurate to 4 decimal places!",
            ],
          },
        ],
      },
      {
        title: "The Mean Value Theorem",
        section: "mvt",
        body: [
          "If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, then there exists at least one $c$ in $(a,b)$ such that $f'(c) = \\frac{f(b)-f(a)}{b-a}$.",
          "In words: somewhere between $a$ and $b$, the instantaneous rate of change equals the average rate of change.",
          "Geometric interpretation: there's a point where the tangent line is parallel to the secant line connecting $(a, f(a))$ and $(b, f(b))$.",
          "Applications: proving that a function must have a certain derivative value, establishing speed limits (if you drove 120 miles in 2 hours, you must have been going 60 mph at some instant).",
        ],
        eli5: [
          "You drive 120 miles in 2 hours. Your average speed was 60 mph. The Mean Value Theorem says: at some point during your drive, your speedometer must have read exactly 60 mph. Maybe you were going 40 sometimes and 80 other times, but you definitely hit 60 at least once.",
          "This makes intuitive sense — to average 60, you can't always be above or always be below. You must cross through 60 at some point. The MVT guarantees this mathematically for any smooth function.",
        ],
      },
      {
        title: "Newton's method",
        section: "newton",
        body: [
          "Newton's method finds approximate roots of $f(x) = 0$ using tangent lines.",
          "Start with an initial guess $x_0$. The iteration formula is: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$.",
          "Each step draws the tangent line at $(x_n, f(x_n))$ and finds where it crosses the $x$-axis. That crossing point is $x_{n+1}$.",
          "Convergence is typically quadratic: the number of correct digits roughly doubles each step. For example, if $x_3$ has 3 correct digits, $x_4$ may have 6.",
          "Error estimation: $|x_{n+1} - r| \\approx \\frac{|f''(r)|}{2|f'(r)|} \\cdot |x_n - r|^2$ where $r$ is the true root. This quantifies the quadratic convergence.",
          "Pitfalls: the method can fail if $f'(x_n) = 0$ (horizontal tangent), if the initial guess is too far from the root, or if the function oscillates. Cycling is possible — Newton's method applied to $x^3 - 2x + 2$ starting at $x_0 = 0$ enters an infinite loop between $1$ and $0$.",
          "Stopping criterion: iterate until $|x_{n+1} - x_n| < \\varepsilon$ for a desired tolerance $\\varepsilon$, or until $|f(x_n)| < \\varepsilon$.",
        ],
        examples: [
          {
            title: "Newton's method: finding $\\sqrt{5}$",
            steps: [
              "We want to solve $f(x) = x^2 - 5 = 0$, so $f'(x) = 2x$.",
              "Iteration formula: $x_{n+1} = x_n - \\frac{x_n^2 - 5}{2x_n} = \\frac{x_n + 5/x_n}{2}$.",
              "Start with $x_0 = 2$: $x_1 = \\frac{2 + 5/2}{2} = \\frac{2 + 2.5}{2} = 2.25$.",
              "$x_2 = \\frac{2.25 + 5/2.25}{2} = \\frac{2.25 + 2.2222}{2} = 2.23611$.",
              "$x_3 = 2.23607$ (already accurate to 5 decimal places). $\\sqrt{5} = 2.23607...$",
              "In just 3 iterations we went from a rough guess to 5-digit accuracy — that's quadratic convergence in action.",
            ],
          },
        ],
      },
      {
        title: "Rates of change in the sciences",
        section: "ratesci",
        body: [
          "The derivative is the universal language for rates. Here are key applications across disciplines.",
          "Physics — velocity and acceleration: if $s(t)$ is position, then $v(t) = s'(t)$ is velocity and $a(t) = v'(t) = s''(t)$ is acceleration. Force equals mass times acceleration: $F = ma = ms''(t)$.",
          "Biology — population growth: if $P(t)$ is population, $P'(t)$ is the growth rate. The per-capita growth rate is $P'(t)/P(t)$. This leads to the logistic equation $P' = rP(1 - P/K)$.",
          "Chemistry — reaction rates: the rate of a chemical reaction $\\frac{d[A]}{dt}$ measures how fast a reactant $A$ is consumed. The rate law relates this to concentrations: $-\\frac{d[A]}{dt} = k[A]^n$.",
          "Economics — marginal analysis: the marginal cost $C'(x)$ is the cost of producing one additional unit. The marginal revenue $R'(x)$ is the revenue from one more sale. Profit is maximized when $R'(x) = C'(x)$.",
          "Engineering — sensitivity analysis: if an output $y$ depends on a parameter $p$, the derivative $dy/dp$ measures how sensitive the output is to small changes in $p$. This is fundamental to error propagation: $\\Delta y \\approx |y'(p)| \\cdot \\Delta p$.",
          "The mathematical tools (chain rule, implicit differentiation, related rates) are identical across all these fields. Only the variable names change.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting to check endpoints in absolute extrema problems. The extreme values can occur at the boundary of the interval, not just at critical points.",
      "In optimization problems, not verifying that the critical point is actually a max or min. Use the second derivative test or check the value at boundaries.",
      "In related rates, plugging in numbers before differentiating. This kills the variable relationships you need.",
      "Confusing velocity with speed. Velocity is signed (direction matters), speed is $|v(t)|$.",
      "Thinking $f''(c) = 0$ means $c$ is an inflection point. You must verify that $f''$ actually changes sign.",
      "In optimization, not checking the domain of your variable. A side length can't be negative, and constraints often restrict the range.",
      "Skipping the diagram in related rates and optimization. A picture clarifies the relationship between variables enormously.",
    ],
  },
  {
    topicId: "series",
    title: "Series & Sequences",
    intro: [
      "Sequences are ordered lists of numbers, and series are their sums. The fundamental question of this entire topic: when you add up infinitely many numbers, can you get a finite answer?",
      "Series are not just theoretical: they underpin how computers calculate $\\sin x$, $e^x$, and $\\ln x$. Taylor series let you approximate any smooth function with a polynomial. Power series extend calculus into the realm of infinite-degree polynomials.",
      "This module covers convergence tests (the toolkit for determining if a series converges), power series, and Taylor/Maclaurin series. Master the tests systematically and you'll always know which tool to reach for.",
    ],
    sections: [
      {
        title: "Sequences and their limits",
        section: "sequences",
        body: [
          "A sequence $\\{a_n\\}$ is an ordered list: $a_1, a_2, a_3, \\ldots$ The sequence converges if $\\lim_{n\\to\\infty} a_n = L$ for some finite $L$. If no such $L$ exists, the sequence diverges.",
          "Common sequences: $a_n = 1/n \\to 0$, $a_n = (1+1/n)^n \\to e$ (the definition of $e$), $a_n = (-1)^n$ diverges (oscillates between $-1$ and $1$, never settling), $a_n = n^2$ diverges to $\\infty$.",
          "Tools for evaluating sequence limits: L'Hôpital's Rule (treat $n$ as a continuous variable and apply to $f(x)$), the Squeeze Theorem (trap the sequence between two that converge to the same limit), and the growth-rate hierarchy: $\\ln n \\ll n^p \\ll a^n \\ll n! \\ll n^n$ for $a > 1$, $p > 0$. This hierarchy means, for example, that $n^{100}/2^n \\to 0$ — any exponential eventually crushes any polynomial.",
          "A sequence is monotonic if it is always increasing ($a_{n+1} \\geq a_n$) or always decreasing ($a_{n+1} \\leq a_n$). A bounded monotonic sequence always converges (Monotone Convergence Theorem). This is useful for proving convergence when you can't find the limit directly.",
          "A sequence is bounded if there exist numbers $m$ and $M$ such that $m \\leq a_n \\leq M$ for all $n$. Bounded alone doesn't guarantee convergence ($(-1)^n$ is bounded but divergent). You need bounded plus monotonic.",
        ],
        eli5: [
          "A sequence is just a list of numbers generated by a pattern. The question is: does the list settle down to a single value as you go further and further? If $a_n = 1/n$, the list is $1, 1/2, 1/3, 1/4, \\ldots$ — it's getting closer and closer to $0$. The limit is $0$.",
          "Some sequences never settle: $(-1)^n$ bounces between $-1$ and $1$ forever. That's divergence. A sequence can also diverge by growing without bound, like $n^2 = 1, 4, 9, 16, \\ldots$",
        ],
      },
      {
        title: "Series: partial sums and convergence",
        section: "partialsums",
        body: [
          "A series $\\sum_{n=1}^{\\infty} a_n$ is the limit of its partial sums: $S_N = \\sum_{n=1}^{N} a_n$. If $\\lim_{N\\to\\infty} S_N$ exists and is finite, the series converges.",
          "Key distinction: a sequence $\\{a_n\\}$ converging to $0$ is necessary for the series to converge, but not sufficient. $a_n = 1/n \\to 0$, yet $\\sum 1/n$ diverges.",
          "The harmonic series $\\sum 1/n$ diverges. This is one of the most important facts in the theory of series. It shows that terms going to zero isn't enough.",
        ],
        eli5: [
          "Imagine stacking blocks. Each block is thinner than the last. The question is: does the tower reach a finite height, or does it grow forever?",
          "If each block is half as thick as the previous one (like $1, 1/2, 1/4, 1/8, \\ldots$), the tower settles at height 2. That's a convergent series. But if each block is $1, 1/2, 1/3, 1/4, \\ldots$ (harmonic series), the blocks get thinner but not fast enough — the tower grows forever, just very slowly.",
          "So 'the pieces get smaller' isn't enough. They have to get smaller fast enough. The convergence tests are all about measuring whether 'fast enough' is satisfied.",
        ],
      },
      {
        title: "Geometric series",
        section: "geometric",
        body: [
          "A geometric series has the form $\\sum_{n=0}^{\\infty} ar^n$ where $a$ is the first term and $r$ is the common ratio.",
          "It converges if and only if $|r| < 1$, and the sum is $\\frac{a}{1-r}$.",
          "Example: $\\sum_{n=0}^{\\infty} \\frac{3}{2^n} = \\frac{3}{1-1/2} = 6$.",
          "This is the only common series where we can easily compute the exact sum. Many convergence tests compare other series to geometric ones.",
        ],
        examples: [
          {
            title: "Summing a geometric series",
            steps: [
              "Compute $\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{4^n}$.",
              "Rewrite: this is $\\sum_{n=0}^{\\infty} \\left(-\\frac{1}{4}\\right)^n$. So $a = 1$ and $r = -1/4$.",
              "Check: $|r| = 1/4 < 1$, so it converges.",
              "Apply the formula: $\\frac{a}{1-r} = \\frac{1}{1-(-1/4)} = \\frac{1}{5/4} = \\frac{4}{5}$.",
              "The sum is $\\frac{4}{5}$. Note: even though terms alternate sign, the geometric series formula handles this perfectly.",
            ],
          },
        ],
      },
      {
        title: "Telescoping series",
        section: "telescoping",
        body: [
          "A telescoping series is one where consecutive terms in the partial sum cancel, leaving only a few surviving terms — like a collapsing telescope.",
          "The classic example: $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)}$. Use partial fractions: $\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$.",
          "Write out the partial sum: $S_N = \\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\left(\\frac{1}{3} - \\frac{1}{4}\\right) + \\cdots + \\left(\\frac{1}{N} - \\frac{1}{N+1}\\right)$. Almost everything cancels! What survives: $S_N = 1 - \\frac{1}{N+1}$. As $N \\to \\infty$, $S_N \\to 1$.",
          "To recognize telescoping: use partial fractions to split the general term into a difference $f(n) - f(n+1)$ (or $f(n) - f(n+k)$ for wider telescoping). If consecutive terms cancel, the partial sum collapses to a simple expression.",
          "Telescoping series are one of the few types where you can find the exact sum, not just determine convergence. Always check for this pattern when partial fractions reveal a clean difference.",
        ],
        eli5: [
          "Imagine a row of dominoes where each one knocks down the next, but also picks up the previous one. After all the dominoes have fallen, only the first and last are still standing. That's telescoping — massive cancellation leaves only the endpoints.",
        ],
        examples: [
          {
            title: "Telescoping with a shifted difference",
            steps: [
              "Compute $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+2)}$.",
              "Partial fractions: $\\frac{1}{n(n+2)} = \\frac{1}{2}\\left(\\frac{1}{n} - \\frac{1}{n+2}\\right)$.",
              "This is a 'step-2' telescope. Write out terms: $\\frac{1}{2}\\left[\\left(\\frac{1}{1}-\\frac{1}{3}\\right) + \\left(\\frac{1}{2}-\\frac{1}{4}\\right) + \\left(\\frac{1}{3}-\\frac{1}{5}\\right) + \\left(\\frac{1}{4}-\\frac{1}{6}\\right) + \\cdots\\right]$.",
              "After cancellation, only $\\frac{1}{1}$ and $\\frac{1}{2}$ survive from the positive terms. $S = \\frac{1}{2}\\left(1 + \\frac{1}{2}\\right) = \\frac{3}{4}$.",
            ],
          },
        ],
      },
      {
        title: "The Divergence Test (nth-term test)",
        section: "divergence",
        body: [
          "If $\\lim_{n\\to\\infty} a_n \\neq 0$, then $\\sum a_n$ diverges. Full stop. If the terms don't approach zero, they can't possibly add up to a finite sum — the partial sums keep jumping by non-negligible amounts.",
          "This should always be your first check for any series. It's quick and catches obvious divergence. Example: $\\sum \\frac{n}{n+1}$ diverges because $a_n = \\frac{n}{n+1} \\to 1 \\neq 0$.",
          "Critical limitation: if $\\lim_{n\\to\\infty} a_n = 0$, the test tells you nothing. The series might converge ($\\sum 1/n^2$ converges) or diverge ($\\sum 1/n$ diverges). Terms going to zero is necessary for convergence but not sufficient. You need another test to decide.",
          "Think of this test as a 'quick rejection filter.' It can rule out convergence (if terms don't go to zero), but it can never confirm convergence.",
        ],
        eli5: [
          "If you keep adding amounts that don't shrink to zero, the total will keep growing forever — it can never settle at a finite number. That's the divergence test: 'Are the terms even getting small?' If not, don't bother — the series diverges.",
          "But terms getting small doesn't guarantee the sum is finite. You can add smaller and smaller amounts and still accumulate an infinite total ($1 + 1/2 + 1/3 + 1/4 + \\cdots = \\infty$). So '$a_n \\to 0$' just means 'we need to investigate further.'",
        ],
      },
      {
        title: "p-series and the harmonic series",
        section: "pseries",
        body: [
          "A p-series has the form $\\sum_{n=1}^{\\infty} \\frac{1}{n^p}$ where $p$ is a positive constant. These are the most important benchmark series in all of convergence testing.",
          "The rule: converges if $p > 1$, diverges if $p \\leq 1$. The critical boundary is $p = 1$.",
          "Key examples: $p=1$: the harmonic series $\\sum 1/n$ diverges (this is the most important single fact about series). $p=2$: $\\sum 1/n^2 = \\pi^2/6$ (Euler proved this in 1734 — a celebrated result). $p=1/2$: $\\sum 1/\\sqrt{n}$ diverges (the terms shrink, but too slowly).",
          "Why $p=1$ diverges: group terms in powers of 2. $1 + \\frac{1}{2} + (\\frac{1}{3}+\\frac{1}{4}) + (\\frac{1}{5}+\\frac{1}{6}+\\frac{1}{7}+\\frac{1}{8}) + \\cdots > 1 + \\frac{1}{2} + \\frac{1}{2} + \\frac{1}{2} + \\cdots = \\infty$. Each group contributes at least $1/2$.",
          "p-series serve as the go-to comparison: when you encounter a series with terms that 'look like' $1/n^p$ for large $n$, use the limit comparison test against the appropriate p-series.",
        ],
        eli5: [
          "The harmonic series is the ultimate counterexample in mathematics: the terms $1, 1/2, 1/3, 1/4, \\ldots$ clearly shrink to zero, yet their sum is infinite! It grows incredibly slowly (you need about $e^{10^{43}}$ terms to reach a partial sum of $100$), but it does grow forever. The p-series rule tells you exactly how fast the terms need to shrink: faster than $1/n$ (meaning $p > 1$) to get a finite sum.",
        ],
      },
      {
        title: "The Integral Test",
        section: "integraltest",
        body: [
          "If $f(x)$ is positive, continuous, and decreasing for $x \\geq N$, and $a_n = f(n)$, then $\\sum_{n=N}^{\\infty} a_n$ and $\\int_N^{\\infty} f(x)\\,dx$ either both converge or both diverge. The series and the integral live or die together.",
          "Why it works: the sum $\\sum a_n$ is a left Riemann sum for $\\int f(x)\\,dx$ (or a right Riemann sum, depending on the direction). Since $f$ is decreasing, these Riemann sums sandwich the integral. If one is finite, the other must be too.",
          "The integral test does not give the exact sum — just convergence or divergence. The integral's value is related to but not equal to the series sum.",
          "Example: does $\\sum_{n=2}^{\\infty} \\frac{1}{n(\\ln n)^2}$ converge? Let $f(x) = \\frac{1}{x(\\ln x)^2}$. It's positive, continuous, and decreasing for $x \\geq 2$. $\\int_2^\\infty \\frac{1}{x(\\ln x)^2}\\,dx$: substitute $u = \\ln x$, giving $\\int_{\\ln 2}^{\\infty} u^{-2}\\,du = \\frac{1}{\\ln 2}$. The integral converges, so the series converges.",
          "Remainder estimate: $\\int_{N+1}^{\\infty} f(x)\\,dx \\leq R_N \\leq \\int_N^{\\infty} f(x)\\,dx$ where $R_N = \\sum_{n=N+1}^{\\infty} a_n$ is the error from truncating at $N$ terms. This gives concrete error bounds.",
        ],
        eli5: [
          "Drawing rectangles under a curve approximates the area (integral). Each rectangle's height is $a_n = f(n)$, and its width is $1$. Since the function is decreasing, the rectangles' total area is close to the integral's area. If the area under the infinite curve is finite, the total rectangle area is finite too — and vice versa.",
        ],
      },
      {
        title: "Comparison and Limit Comparison Tests",
        section: "comparison",
        body: [
          "Direct comparison: if $0 \\leq a_n \\leq b_n$ for all sufficiently large $n$ and $\\sum b_n$ converges, then $\\sum a_n$ converges (a smaller series is forced to converge if a larger one does). Conversely, if $\\sum a_n$ diverges, then $\\sum b_n$ diverges.",
          "Direct comparison requires an inequality that holds term by term. This can be tricky to establish. The limit comparison test removes that difficulty.",
          "Limit comparison: if $\\lim_{n\\to\\infty} a_n / b_n = L$ where $0 < L < \\infty$, then $\\sum a_n$ and $\\sum b_n$ either both converge or both diverge. The series behave the same because their terms are proportional for large $n$.",
          "Strategy: look at your series for large $n$ and simplify by dropping lower-order terms. $\\frac{n}{n^3+1}$ behaves like $\\frac{n}{n^3} = \\frac{1}{n^2}$ for large $n$. Use $b_n = 1/n^2$ in the limit comparison test. Since $\\sum 1/n^2$ converges ($p = 2 > 1$), the original series converges.",
          "Choosing $b_n$: almost always a p-series or geometric series. Keep only the highest-power terms in the numerator and denominator, cancel, and you'll get $b_n = 1/n^p$ for some $p$. Then the p-series rule tells you the answer.",
        ],
        eli5: [
          "Direct comparison: 'I earn less than my neighbor, and my neighbor can afford rent, so I can too.' (If a bigger series converges, a smaller one must as well.)",
          "Limit comparison: 'For large $n$, my series and a known series look practically the same — they differ by just a constant multiple. So if one converges, the other must too.' You're comparing behavior, not individual terms.",
        ],
      },
      {
        title: "Ratio and Root Tests",
        section: "ratioroot",
        body: [
          "Ratio test: compute $L = \\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|$. If $L < 1$: converges absolutely. $L > 1$: diverges. $L = 1$: inconclusive.",
          "Root test: compute $L = \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}$. Same criteria as the ratio test.",
          "The ratio test excels for series with factorials (like $n!/3^n$) or products. The root test is ideal for terms raised to the $n$th power (like $(2/3)^n$).",
          "Warning: both tests are inconclusive when $L=1$. This happens for all p-series, so you can't use ratio/root tests on $\\sum 1/n^p$.",
        ],
        examples: [
          {
            title: "Ratio test on a factorial series",
            steps: [
              "Does $\\sum_{n=1}^{\\infty} \\frac{n!}{3^n}$ converge or diverge?",
              "Use the ratio test. Compute $\\frac{a_{n+1}}{a_n} = \\frac{(n+1)!}{3^{n+1}} \\cdot \\frac{3^n}{n!}$.",
              "Simplify: $(n+1)!/n! = n+1$ and $3^n/3^{n+1} = 1/3$.",
              "So $\\frac{a_{n+1}}{a_n} = \\frac{n+1}{3}$.",
              "Take the limit: $L = \\lim_{n\\to\\infty} \\frac{n+1}{3} = \\infty$.",
              "Since $L > 1$ (in fact $L = \\infty$), the series diverges. The factorial grows so much faster than $3^n$ that the terms blow up.",
            ],
          },
        ],
      },
      {
        title: "Alternating Series Test",
        section: "alternating",
        body: [
          "An alternating series has terms that switch sign: $\\sum (-1)^n a_n$ or $\\sum (-1)^{n+1} a_n$ where $a_n > 0$. The positive and negative terms partially cancel each other.",
          "The Alternating Series Test (Leibniz's test): the series converges if two conditions hold: (1) $\\{a_n\\}$ is eventually decreasing ($a_{n+1} \\leq a_n$ for large enough $n$), and (2) $\\lim_{n\\to\\infty} a_n = 0$.",
          "Example: the alternating harmonic series $\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n} = 1 - 1/2 + 1/3 - 1/4 + \\cdots = \\ln 2$. The regular harmonic series diverges, but the alternation saves it — the positive and negative terms cancel just enough to give a finite sum.",
          "Alternating series estimation theorem: the error from truncating after $N$ terms satisfies $|R_N| \\leq a_{N+1}$ (the first omitted term). This is an exceptionally convenient error bound — you know exactly how accurate your partial sum is. If $a_{N+1} = 0.001$, your approximation is within $0.001$ of the true sum.",
          "This estimation theorem is why alternating series are 'friendly' — they come with a built-in accuracy guarantee, unlike most other convergent series.",
        ],
        eli5: [
          "An alternating series is like a pendulum. First you overshoot (positive), then you overcorrect (negative), then you overshoot again, but less. Each swing is smaller than the last. As long as the swings shrink to zero, the pendulum settles — the series converges.",
          "The error bound says: the pendulum is never more than one swing away from its final resting place. So after $N$ swings, the farthest you could be off is the size of the next swing ($a_{N+1}$).",
        ],
      },
      {
        title: "Absolute vs. conditional convergence",
        section: "absconv",
        body: [
          "A series $\\sum a_n$ converges absolutely if $\\sum |a_n|$ converges. It converges conditionally if $\\sum a_n$ converges but $\\sum |a_n|$ diverges.",
          "Absolute convergence implies convergence. So if the absolute value series converges, you're done.",
          "Example: $\\sum (-1)^n/n^2$ converges absolutely because $\\sum 1/n^2$ converges.",
          "Example: $\\sum (-1)^n/n$ converges conditionally. It converges by the alternating series test, but $\\sum 1/n$ diverges.",
          "Why it matters: absolutely convergent series can be rearranged freely without changing the sum. Conditionally convergent series cannot (Riemann rearrangement theorem).",
        ],
        eli5: [
          "Think of absolute convergence like having money in the bank. Even if some terms are positive and some are negative, if the total amount of money moving around (ignoring direction) is finite, you're safe. The sum is solid and reliable.",
          "Conditional convergence is like balancing on a tightrope. The positive and negative terms cancel each other out just right to give a finite sum, but it's fragile. If you rearrange the order you add them, you can get a completely different answer (or no answer at all). It only works because of the specific order.",
        ],
      },
      {
        title: "Power series",
        section: "power",
        body: [
          "A power series centered at $a$ is $\\sum_{n=0}^{\\infty} c_n(x-a)^n = c_0 + c_1(x-a) + c_2(x-a)^2 + \\cdots$. It's an 'infinite polynomial' with infinitely many terms.",
          "The radius of convergence $R$ determines where it converges: $|x-a| < R$ (converges absolutely), $|x-a| > R$ (diverges). At $|x-a| = R$ (the endpoints), you must check separately — the series may converge at one, both, or neither endpoint.",
          "Three possible scenarios: $R = 0$ (converges only at $x = a$), $0 < R < \\infty$ (converges on a finite interval), or $R = \\infty$ (converges for all $x$, like the series for $e^x$).",
          "Find $R$ using the ratio test: $R = \\lim_{n\\to\\infty} \\left|\\frac{c_n}{c_{n+1}}\\right|$ (or equivalently, $1/R = \\lim_{n\\to\\infty}|c_{n+1}/c_n|$). The root test also works: $1/R = \\limsup_{n\\to\\infty} |c_n|^{1/n}$.",
          "Inside the radius, power series behave like polynomials: you can differentiate and integrate them term by term, and the radius of convergence stays the same (endpoints may change).",
          "The simplest power series: $\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n$ for $|x| < 1$ ($R = 1$). From this, many other series can be derived by substitution, differentiation, or integration.",
        ],
        eli5: [
          "A power series is like a polynomial that never ends. Regular polynomials have a fixed number of terms. Power series keep going: $c_0 + c_1 x + c_2 x^2 + c_3 x^3 + \\cdots$. The question is: for which values of $x$ does this infinite sum make sense (converge)?",
          "The radius of convergence is the 'safe zone.' Inside the radius, the terms shrink fast enough to give a finite sum. Outside, they blow up. At the boundary, it's a coin flip — you have to check by hand.",
        ],
      },
      {
        title: "Taylor and Maclaurin series",
        section: "taylor",
        body: [
          "The Taylor series of $f(x)$ centered at $a$ is: $f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n$.",
          "A Maclaurin series is a Taylor series centered at $a=0$.",
          "Essential Maclaurin series to memorize:",
          "$e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$ for all $x$.",
          "$\\sin x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!} = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots$ for all $x$.",
          "$\\cos x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!} = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots$ for all $x$.",
          "$\\ln(1+x) = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1} x^n}{n} = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\cdots$ for $-1 < x \\leq 1$.",
          "$\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n$ for $|x| < 1$.",
        ],
        eli5: [
          "A Taylor series is like building a copy of a function out of simple polynomial building blocks ($1, x, x^2, x^3, \\ldots$).",
          "Imagine you want to recreate a complicated curve. First, you match the value at one point (constant term). Then you match the slope (linear term). Then the curvature ($x^2$ term). Each new term makes your copy more accurate, like adding more detail to a sketch.",
          "With enough terms, your polynomial copy becomes indistinguishable from the original function. That's how your calculator computes $\\sin(0.5)$ — it's not drawing a circle, it's evaluating a polynomial like $0.5 - 0.5^3/6 + 0.5^5/120 - \\cdots$ that happens to equal $\\sin(0.5)$ to many decimal places.",
        ],
        examples: [
          {
            title: "Computing a Taylor series from scratch",
            steps: [
              "Find the Maclaurin series for $f(x) = e^x$ (centered at $a = 0$).",
              "We need $f^{(n)}(0)$ for each $n$. Since $\\frac{d}{dx}e^x = e^x$, every derivative of $e^x$ is $e^x$.",
              "So $f(0) = 1$, $f'(0) = 1$, $f''(0) = 1$, $f'''(0) = 1$, and so on. Every derivative at $0$ equals $1$.",
              "Plug into the Taylor formula: $e^x = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!} x^n = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}$.",
              "Written out: $e^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + \\frac{x^4}{24} + \\cdots$",
              "This converges for all $x$. For example, $e^1 \\approx 1 + 1 + 0.5 + 0.167 + 0.042 + 0.008 + \\cdots \\approx 2.718$.",
            ],
          },
          {
            title: "Deriving a series by substitution",
            steps: [
              "Find the Maclaurin series for $e^{-x^2}$.",
              "Instead of computing derivatives (which get very messy), use the known series for $e^x$ and substitute $-x^2$ for $x$.",
              "We know: $e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}$.",
              "Replace $x$ with $-x^2$: $e^{-x^2} = \\sum_{n=0}^{\\infty} \\frac{(-x^2)^n}{n!} = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{n!}$.",
              "Written out: $e^{-x^2} = 1 - x^2 + \\frac{x^4}{2} - \\frac{x^6}{6} + \\cdots$",
              "This is the Gaussian function used in probability and statistics. Its integral $\\int_0^\\infty e^{-x^2}dx = \\frac{\\sqrt{\\pi}}{2}$ has no closed form — but we can integrate the series term by term!",
            ],
          },
        ],
      },
      {
        title: "Taylor remainder and error bounds",
        section: "remainder",
        body: [
          "The $n$th degree Taylor polynomial $T_n(x)$ approximates $f(x)$ near $x = a$. The error (remainder) is $R_n(x) = f(x) - T_n(x)$ — the difference between the true function and the polynomial approximation.",
          "Taylor's inequality (Lagrange error bound): $|R_n(x)| \\leq \\frac{M}{(n+1)!}|x-a|^{n+1}$, where $M$ is an upper bound for $|f^{(n+1)}(t)|$ on the interval between $a$ and $x$. The $(n+1)!$ in the denominator grows extremely fast, which is why Taylor polynomials get accurate quickly.",
          "For alternating Taylor series (like $\\sin x$, $\\cos x$, $\\ln(1+x)$), the alternating series estimation applies: $|R_n| \\leq |a_{n+1}|$ (the first omitted term). This is usually easier to use than the Lagrange bound.",
          "Practical use: 'How many terms of the Maclaurin series for $e^x$ do I need to approximate $e^{0.5}$ to within $0.0001$?' Find the smallest $n$ such that $\\frac{(0.5)^{n+1}}{(n+1)!} < 0.0001$. With $n = 5$: $\\frac{0.5^6}{720} \\approx 0.0000217 < 0.0001$. So 6 terms suffice (through the $x^5$ term).",
          "This is how calculators and computers evaluate functions like $\\sin$, $\\cos$, and $e^x$ — they use Taylor polynomials with enough terms to guarantee the desired precision.",
        ],
        eli5: [
          "When you approximate a function with a Taylor polynomial, you're sketching it with a limited number of pencil strokes. The error bound tells you: 'your sketch is at most this far from the real thing.' Add more terms (more pencil strokes), and the bound shrinks — your sketch gets closer to the original.",
          "The $(n+1)!$ in the denominator is your best friend here. Factorials grow so fast that even a few extra terms dramatically improve accuracy. That's why Taylor series work so well in practice.",
        ],
      },
      {
        title: "Building new series from known ones",
        section: "building",
        body: [
          "Instead of computing Taylor coefficients from scratch (which requires evaluating $n$ derivatives), you can derive new series from known ones using three operations: substitution, differentiation, and integration.",
          "Substitution: replace $x$ in a known series with an expression. $e^{-x^2}$? Start with $e^u = \\sum u^n/n!$ and substitute $u = -x^2$: $e^{-x^2} = \\sum \\frac{(-1)^n x^{2n}}{n!}$. No derivatives needed.",
          "Term-by-term differentiation: differentiate a known series to get a new one. $\\frac{1}{1-x} = \\sum x^n$ for $|x|<1$. Differentiate both sides: $\\frac{1}{(1-x)^2} = \\sum n x^{n-1}$. The radius of convergence is preserved.",
          "Term-by-term integration: integrate a known series. $\\frac{1}{1+t^2} = \\sum (-1)^n t^{2n}$ for $|t|<1$. Integrate from $0$ to $x$: $\\arctan x = \\sum \\frac{(-1)^n x^{2n+1}}{2n+1}$. This gives the series for $\\arctan$ without ever differentiating $\\arctan$.",
          "Multiplication and addition: you can add or multiply series. $\\frac{x}{1-x^2} = x \\cdot \\frac{1}{1-x^2} = x \\sum x^{2n} = \\sum x^{2n+1}$.",
          "These techniques are immensely powerful. In practice, almost every Taylor series you encounter can be derived from the five basic series ($e^x$, $\\sin x$, $\\cos x$, $\\ln(1+x)$, $1/(1-x)$) using these operations.",
        ],
        eli5: [
          "You've memorized five basic series. From those five, you can build hundreds of others — just by plugging in different expressions, differentiating, or integrating. It's like having five LEGO base plates and building anything on top of them.",
        ],
      },
      {
        title: "Choosing the right convergence test (strategy)",
        section: "strategy",
        body: [
          "1. Divergence test first: if $a_n \\not\\to 0$, done (diverges).",
          "2. Is it geometric? Check if $a_n = ar^n$.",
          "3. Is it a p-series? Check if $a_n = 1/n^p$.",
          "4. Does it telescope? Try partial fractions.",
          "5. Are there factorials or $n$th powers? Try ratio or root test.",
          "6. Does it look like a known series? Try comparison or limit comparison.",
          "7. Is it alternating? Try the alternating series test.",
          "8. Is $f(n) = a_n$ easy to integrate? Try the integral test.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Using the divergence test to 'prove' convergence. If $a_n \\to 0$, the test tells you nothing. It can only prove divergence.",
      "Applying the ratio or root test to a p-series. These tests always give $L = 1$ (inconclusive) for $\\sum 1/n^p$.",
      "Forgetting to check the endpoints of a power series interval. The series may converge at one endpoint, both, or neither.",
      "Confusing absolute and conditional convergence. Absolute convergence ($\\sum |a_n|$ converges) is strictly stronger than conditional convergence.",
      "Computing Taylor coefficients incorrectly: the $n$th coefficient is $\\frac{f^{(n)}(a)}{n!}$, not $f^{(n)}(a)$. Don't forget the $n!$ in the denominator.",
      "Trying to determine the sum of a series when the question only asks about convergence. Most convergent series don't have nice closed-form sums.",
      "Not simplifying before choosing a test. Algebra can often reveal the right comparison or simplify the ratio test calculation.",
    ],
  },
  {
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
  {
    topicId: "applications-of-integration",
    title: "Applications of Integration",
    intro: [
      "Integration computes accumulated quantities. So far you've seen it as 'area under a curve,' but the real power of the integral is that it can measure anything that accumulates: length along a curve, volume of a solid, work done by a force, or probability of an event.",
      "The strategy is always the same: slice the quantity into infinitely many small pieces, write a formula for each piece, then integrate (sum them up). The only thing that changes from problem to problem is what you're slicing and how.",
      "This module covers the major geometric and physical applications: areas between curves, volumes of solids of revolution, arc length, and an introduction to parametric curves.",
    ],
    sections: [
      {
        title: "Areas between curves",
        section: "areacurves",
        body: [
          "The area between $y = f(x)$ (top) and $y = g(x)$ (bottom) from $x = a$ to $x = b$ is $A = \\int_a^b [f(x) - g(x)]\\,dx$.",
          "The integrand is always (top minus bottom) or (right minus left). If the curves cross, split the integral at the crossing points and take care with which function is on top in each sub-interval.",
          "To find crossing points, solve $f(x) = g(x)$. These are the limits of integration.",
          "For curves given as $x = h(y)$, integrate with respect to $y$: $A = \\int_c^d [h_{\\text{right}}(y) - h_{\\text{left}}(y)]\\,dy$. Sometimes integrating in $y$ is simpler because it avoids splitting at crossings.",
        ],
        examples: [
          {
            title: "Area between a parabola and a line",
            steps: [
              "Find the area between $y = x^2$ and $y = x + 2$.",
              "Find the crossing points: $x^2 = x + 2 \\Rightarrow x^2 - x - 2 = 0 \\Rightarrow (x-2)(x+1) = 0$, so $x = -1$ and $x = 2$.",
              "Determine which is on top: at $x = 0$, $x+2 = 2$ and $x^2 = 0$. The line is above the parabola on $[-1, 2]$.",
              "$A = \\int_{-1}^{2} [(x+2) - x^2]\\,dx = \\int_{-1}^{2} (x + 2 - x^2)\\,dx$.",
              "Antiderivative: $\\frac{x^2}{2} + 2x - \\frac{x^3}{3}$.",
              "Evaluate: $\\left(\\frac{4}{2} + 4 - \\frac{8}{3}\\right) - \\left(\\frac{1}{2} - 2 + \\frac{1}{3}\\right) = \\left(2 + 4 - \\frac{8}{3}\\right) - \\left(\\frac{1}{2} - 2 + \\frac{1}{3}\\right) = \\frac{9}{2}$.",
              "The area is $\\frac{9}{2}$.",
            ],
          },
        ],
      },
      {
        title: "Volumes of solids of revolution: disk and washer methods",
        section: "diskwasher",
        body: [
          "When you rotate a region around an axis, it sweeps out a solid. To find its volume, slice perpendicular to the axis of rotation.",
          "Disk method (no hole): rotating $y = f(x)$ around the $x$-axis from $a$ to $b$: $V = \\int_a^b \\pi [f(x)]^2\\,dx$. Each cross-section is a disk with radius $f(x)$.",
          "Washer method (with a hole): if the region is between $y = f(x)$ (outer) and $y = g(x)$ (inner), $V = \\int_a^b \\pi\\left([f(x)]^2 - [g(x)]^2\\right)dx$. Each cross-section is a washer (annulus).",
          "For rotation around the $y$-axis, express $x$ as a function of $y$ and integrate with respect to $y$.",
          "For rotation around a line $y = c$ (not the $x$-axis), adjust the radii: outer radius is $|f(x) - c|$ and inner radius is $|g(x) - c|$.",
        ],
        examples: [
          {
            title: "Disk method: solid of revolution",
            steps: [
              "Find the volume of the solid obtained by rotating $y = \\sqrt{x}$ around the $x$-axis from $x = 0$ to $x = 4$.",
              "Using the disk method, each cross-section at position $x$ is a disk with radius $r = \\sqrt{x}$.",
              "$V = \\int_0^4 \\pi (\\sqrt{x})^2\\,dx = \\int_0^4 \\pi x\\,dx = \\pi \\cdot \\frac{x^2}{2}\\Big|_0^4 = \\pi \\cdot \\frac{16}{2} = 8\\pi$.",
            ],
          },
        ],
        eli5: [
          "Imagine spinning a shape (like a half-circle) around a stick, like a pottery wheel. It carves out a solid 3D object. To find the volume, imagine slicing it into thin circular disks, computing each disk's volume ($\\pi r^2 \\cdot \\text{thickness}$), and adding them all up. That's the disk method.",
          "If the shape has a hole in the middle (like a donut), each slice is a washer (a disk with a hole). Subtract the inner circle from the outer circle: $\\pi(R^2 - r^2) \\cdot \\text{thickness}$. That's the washer method.",
        ],
      },
      {
        title: "Volumes by cylindrical shells",
        section: "shells",
        body: [
          "The shell method computes volumes of revolution by wrapping thin cylindrical shells around the axis of rotation, rather than slicing perpendicular to it.",
          "For rotation around the $y$-axis: $V = \\int_a^b 2\\pi x \\cdot f(x)\\,dx$. Each shell is a thin hollow cylinder with radius $x$ (distance from the axis), height $f(x)$, and thickness $dx$. Unrolling a shell gives a rectangle with area $2\\pi x \\cdot f(x)$.",
          "For rotation around the $x$-axis: $V = \\int_c^d 2\\pi y \\cdot h(y)\\,dy$, where $h(y)$ is the horizontal width of the region at height $y$.",
          "For rotation around a vertical line $x = c$: the radius becomes $|x - c|$ instead of $x$.",
          "When to use shells vs. washers: use whichever makes the integral simpler. Shells are ideal when: (a) the function is easier to express as $y = f(x)$ but you're rotating around a vertical axis, or (b) the washer method would require splitting into multiple integrals but shells give a single clean integral.",
          "General formula: $V = \\int 2\\pi \\cdot (\\text{radius from axis}) \\cdot (\\text{height of shell}) \\cdot d(\\text{variable})$. Always identify the three components before writing the integral.",
        ],
        eli5: [
          "Imagine wrapping thin layers of paper around a pole to form a cylinder. Each layer is a shell. Its volume is the circumference ($2\\pi r$) times the height times the thickness. To find the total volume, add up infinitely many such shells from the inside out. That's the shell method.",
          "The key question is: are you slicing the solid like a loaf of bread (washers) or peeling it like an onion (shells)? Both give the same answer, but one might be easier to set up.",
        ],
        examples: [
          {
            title: "Shell method: rotation around the y-axis",
            steps: [
              "Find the volume of the solid obtained by rotating the region under $y = x^2$ from $x = 0$ to $x = 2$ around the $y$-axis.",
              "Using shells: each shell at position $x$ has radius $x$, height $x^2$, and thickness $dx$.",
              "$V = \\int_0^2 2\\pi x \\cdot x^2\\,dx = 2\\pi \\int_0^2 x^3\\,dx$.",
              "$= 2\\pi \\cdot \\frac{x^4}{4}\\Big|_0^2 = 2\\pi \\cdot \\frac{16}{4} = 8\\pi$.",
              "Compare: using washers would require rewriting as $x = \\sqrt{y}$ and integrating in $y$, which works but involves more setup.",
            ],
          },
        ],
      },
      {
        title: "Arc length",
        section: "arclength",
        body: [
          "The length of a curve $y = f(x)$ from $x = a$ to $x = b$ is $L = \\int_a^b \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "Derivation: on a tiny interval $[x, x+dx]$, the curve covers a horizontal distance $dx$ and a vertical distance $dy = f'(x)\\,dx$. By Pythagoras, the actual distance along the curve is $\\sqrt{(dx)^2 + (dy)^2} = \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "Warning: most arc length integrals are hard or impossible to evaluate in closed form. The formula is simple; the computation rarely is. Numerical methods are often used in practice.",
          "For parametric curves $x = x(t)$, $y = y(t)$: $L = \\int_\\alpha^\\beta \\sqrt{[x'(t)]^2 + [y'(t)]^2}\\,dt$.",
        ],
        examples: [
          {
            title: "Arc length of a parabola",
            steps: [
              "Find the arc length of $y = x^2$ from $x = 0$ to $x = 1$.",
              "$f'(x) = 2x$, so $[f'(x)]^2 = 4x^2$.",
              "$L = \\int_0^1 \\sqrt{1 + 4x^2}\\,dx$.",
              "Use the substitution $x = \\frac{1}{2}\\tan\\theta$, $dx = \\frac{1}{2}\\sec^2\\theta\\,d\\theta$.",
              "After simplification: $L = \\frac{1}{2}[\\sec\\theta\\tan\\theta + \\ln|\\sec\\theta + \\tan\\theta|]$ evaluated at the appropriate bounds.",
              "$L = \\frac{\\sqrt{5}}{2} + \\frac{1}{4}\\ln(2 + \\sqrt{5}) \\approx 1.4789$.",
            ],
          },
        ],
      },
      {
        title: "Parametric equations: curves in motion",
        section: "parametric",
        body: [
          "A parametric curve is defined by $x = x(t)$ and $y = y(t)$ as a parameter $t$ varies. The point $(x(t), y(t))$ traces out a path in the plane.",
          "Example: $x = \\cos t$, $y = \\sin t$ for $t \\in [0, 2\\pi]$ traces the unit circle.",
          "The slope of the tangent line is $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} = \\frac{y'(t)}{x'(t)}$, provided $x'(t) \\neq 0$.",
          "The second derivative: $\\frac{d^2y}{dx^2} = \\frac{\\frac{d}{dt}(dy/dx)}{dx/dt}$.",
          "Arc length: $L = \\int_\\alpha^\\beta \\sqrt{[x'(t)]^2 + [y'(t)]^2}\\,dt$.",
          "Area under a parametric curve: $A = \\int_\\alpha^\\beta y(t) \\cdot x'(t)\\,dt$ (careful with orientation).",
          "Parametric curves are essential for describing motion: $t$ is time, $(x(t), y(t))$ is position, $(x'(t), y'(t))$ is the velocity vector.",
        ],
        examples: [
          {
            title: "Tangent line to a parametric curve",
            steps: [
              "Find the slope of the tangent line to $x = t^2$, $y = t^3$ at $t = 1$.",
              "$\\frac{dx}{dt} = 2t$ and $\\frac{dy}{dt} = 3t^2$.",
              "$\\frac{dy}{dx} = \\frac{3t^2}{2t} = \\frac{3t}{2}$.",
              "At $t = 1$: $\\frac{dy}{dx} = \\frac{3}{2}$.",
              "The point is $(1^2, 1^3) = (1, 1)$.",
              "Tangent line: $y - 1 = \\frac{3}{2}(x - 1)$, i.e., $y = \\frac{3}{2}x - \\frac{1}{2}$.",
            ],
          },
        ],
      },
      {
        title: "Surface area of revolution",
        section: "surfacearea",
        body: [
          "When rotating $y = f(x)$ around the $x$-axis, each tiny piece of the curve sweeps out a band (frustum) on the surface. The surface area of that band is the circumference $2\\pi f(x)$ times the arc length element $ds = \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "Full formula: $S = \\int_a^b 2\\pi f(x) \\sqrt{1 + [f'(x)]^2}\\,dx$. This is the integral of $2\\pi r \\cdot ds$ where $r = f(x)$ is the radius (distance from the axis) and $ds$ is the length element along the curve.",
          "For rotation around the $y$-axis: the radius is $x$ instead of $f(x)$, giving $S = \\int_a^b 2\\pi x \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "For parametric curves: $S = \\int_\\alpha^\\beta 2\\pi y(t) \\sqrt{[x'(t)]^2 + [y'(t)]^2}\\,dt$ (rotation around the $x$-axis).",
          "Warning: surface area integrals are typically harder than volume integrals. The $\\sqrt{1+[f']^2}$ factor rarely simplifies to something nice. Most surface area problems either have exact answers engineered to work out (like cones and spheres) or require numerical methods.",
        ],
        eli5: [
          "Imagine painting the outside of a vase. The surface area tells you how much paint you need. To compute it, think of the vase as many thin rings stacked together. Each ring has a circumference ($2\\pi$ times its radius) and a tiny width (the arc length of the curve, not just $dx$, because the surface might be slanted). Multiply and add up all the rings.",
        ],
        examples: [
          {
            title: "Surface area of a cone",
            steps: [
              "Find the surface area of the cone formed by rotating $y = x$ from $x = 0$ to $x = 1$ around the $x$-axis.",
              "$f(x) = x$, $f'(x) = 1$, so $\\sqrt{1+[f'(x)]^2} = \\sqrt{1+1} = \\sqrt{2}$.",
              "$S = \\int_0^1 2\\pi x \\cdot \\sqrt{2}\\,dx = 2\\pi\\sqrt{2} \\int_0^1 x\\,dx$.",
              "$= 2\\pi\\sqrt{2} \\cdot \\frac{1}{2} = \\pi\\sqrt{2}$.",
              "This is the lateral surface area of a cone with radius $1$, height $1$, and slant height $\\sqrt{2}$. It matches the formula $\\pi r \\ell$ where $\\ell = \\sqrt{2}$. ✓",
            ],
          },
        ],
      },
      {
        title: "Work and physical applications",
        section: "work",
        body: [
          "In physics, work = force × distance. When the force varies over the displacement, you slice the motion into tiny steps where the force is approximately constant and integrate: $W = \\int_a^b F(x)\\,dx$.",
          "Spring problems (Hooke's Law): the force to stretch a spring $x$ units beyond its natural length is $F(x) = kx$. The work to stretch from $x = a$ to $x = b$ is $W = \\int_a^b kx\\,dx = \\frac{k}{2}(b^2 - a^2)$. Note: $x$ measures displacement from natural length, not the total length of the spring.",
          "Pumping problems: to pump liquid out of a tank, slice the liquid into thin horizontal layers. Each layer at height $y$ has volume $A(y)\\,dy$ (where $A(y)$ is the cross-sectional area), weighs $\\rho g \\cdot A(y)\\,dy$, and must be lifted a distance $d(y)$ to the top. Total work: $W = \\int_0^h \\rho g \\cdot A(y) \\cdot d(y)\\,dy$. The tricky part is expressing $A(y)$ and $d(y)$ correctly for the tank's shape.",
          "Hydrostatic force: the pressure at depth $d$ below the surface of a fluid is $P = \\rho g d$. The total force on a submerged vertical plate is $F = \\int_a^b \\rho g \\cdot d(y) \\cdot w(y)\\,dy$, where $w(y)$ is the width of the plate at depth $d(y)$.",
          "The unifying idea: in every application, you identify the small piece, write its contribution ($dW$, $dF$, etc.), and integrate. The calculus is the same; only the physical setup changes.",
        ],
        eli5: [
          "If you push a box with a constant force, work is just force times distance. But what if the force changes as you go — like stretching a rubber band, where it gets harder the further you stretch? You can't just multiply one force by one distance anymore.",
          "Instead, break the motion into tiny steps. In each tiny step, the force is approximately constant. Compute force × tiny distance for each step and add them all up. That's exactly what the integral does.",
        ],
        examples: [
          {
            title: "Work to stretch a spring",
            steps: [
              "A spring has natural length 10 cm and spring constant $k = 40$ N/m. Find the work to stretch it from 12 cm to 15 cm.",
              "We measure $x$ as displacement from natural length. So we stretch from $x = 0.02$ m to $x = 0.05$ m.",
              "By Hooke's Law: $F(x) = 40x$ newtons.",
              "$W = \\int_{0.02}^{0.05} 40x\\,dx = 40 \\cdot \\frac{x^2}{2}\\Big|_{0.02}^{0.05} = 20(0.0025 - 0.0004) = 20(0.0021) = 0.042$ J.",
              "The work is $0.042$ joules. Note: stretching the first 2 cm requires less work than stretching the next 3 cm, because the force increases with displacement.",
            ],
          },
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting to determine which curve is on top (or right) before subtracting. Always check a test point in each interval.",
      "Squaring the difference instead of differencing the squares in the washer method. It is $\\pi(R^2 - r^2)$, not $\\pi(R - r)^2$.",
      "Using the wrong method (shells vs. washers) and ending up with an impossible integral. Try both and pick the simpler one.",
      "In arc length, forgetting to take the derivative. The formula involves $f'(x)$, not $f(x)$.",
      "Not adjusting radii when rotating around a line other than an axis. If rotating around $y = 3$, the radius is $|f(x) - 3|$, not $f(x)$.",
      "Confusing the parameter $t$ with $x$ in parametric problems. $\\frac{dy}{dx} \\neq \\frac{dy}{dt}$; you need $\\frac{dy/dt}{dx/dt}$.",
    ],
  },
  {
    topicId: "multivariable",
    title: "Multivariable & Vector Calculus",
    intro: [
      "Single-variable calculus studies functions $f: \\mathbb{R} \\to \\mathbb{R}$ — one input, one output. Multivariable calculus extends everything to functions of two or three variables: surfaces, vector fields, and 3D geometry.",
      "The core ideas (limits, derivatives, integrals) carry over, but with richer structure. A function of two variables has infinitely many directions to differentiate in. An integral over a region in the plane computes volume. Vector fields assign a vector to every point in space, and their integrals compute work and flux.",
      "This module covers vectors, partial derivatives, optimization with several variables, multiple integrals, and the three great theorems of vector calculus: Green's, Stokes', and the Divergence Theorem.",
    ],
    sections: [
      {
        title: "Vectors and the geometry of space",
        section: "vectors",
        body: [
          "A vector $\\mathbf{v} = \\langle a, b, c \\rangle$ in $\\mathbb{R}^3$ has magnitude $|\\mathbf{v}| = \\sqrt{a^2 + b^2 + c^2}$ and direction.",
          "Dot product: $\\mathbf{u} \\cdot \\mathbf{v} = u_1 v_1 + u_2 v_2 + u_3 v_3 = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$. It measures how aligned two vectors are. Zero dot product means perpendicular.",
          "Cross product: $\\mathbf{u} \\times \\mathbf{v}$ is a vector perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$, with magnitude $|\\mathbf{u}||\\mathbf{v}|\\sin\\theta$ (the area of the parallelogram they span).",
          "Equations of lines: $\\mathbf{r}(t) = \\mathbf{r}_0 + t\\mathbf{v}$ (point plus direction). Equations of planes: $\\mathbf{n} \\cdot (\\mathbf{r} - \\mathbf{r}_0) = 0$ (normal vector dotted with displacement is zero).",
          "These tools let you describe points, lines, planes, and curves in 3D space — the setting for everything that follows.",
        ],
        examples: [
          {
            title: "Finding the equation of a plane",
            steps: [
              "Find the equation of the plane through $(1, 2, 3)$ with normal vector $\\mathbf{n} = \\langle 2, -1, 4 \\rangle$.",
              "The plane equation is $\\mathbf{n} \\cdot (\\mathbf{r} - \\mathbf{r}_0) = 0$.",
              "$2(x - 1) + (-1)(y - 2) + 4(z - 3) = 0$.",
              "Expand: $2x - 2 - y + 2 + 4z - 12 = 0$.",
              "Simplify: $2x - y + 4z = 12$.",
            ],
          },
        ],
      },
      {
        title: "Vector functions and space curves",
        section: "vectorfunc",
        body: [
          "A vector function $\\mathbf{r}(t) = \\langle x(t), y(t), z(t) \\rangle$ traces a curve in 3D space as the parameter $t$ varies. Think of $t$ as time: at each moment, the point $(x(t), y(t), z(t))$ is the particle's position.",
          "The derivative $\\mathbf{r}'(t) = \\langle x'(t), y'(t), z'(t) \\rangle$ is the velocity vector — it points in the direction of motion and its magnitude is the speed.",
          "Speed: $|\\mathbf{r}'(t)| = \\sqrt{[x'(t)]^2 + [y'(t)]^2 + [z'(t)]^2}$. The unit tangent vector $\\mathbf{T}(t) = \\mathbf{r}'(t)/|\\mathbf{r}'(t)|$ gives the direction of motion without the speed information.",
          "Arc length: $L = \\int_a^b |\\mathbf{r}'(t)|\\,dt$ — integrate speed over time to get total distance traveled. This is the 3D generalization of $L = \\int \\sqrt{1+[f']^2}\\,dx$.",
          "Curvature $\\kappa$ measures how sharply the curve turns: $\\kappa = |\\mathbf{T}'(t)|/|\\mathbf{r}'(t)| = |\\mathbf{r}' \\times \\mathbf{r}''|/|\\mathbf{r}'|^3$. A straight line has $\\kappa = 0$; a circle of radius $r$ has $\\kappa = 1/r$ (tighter circle = higher curvature).",
          "The acceleration vector $\\mathbf{a} = \\mathbf{r}''(t)$ naturally decomposes into two components: $\\mathbf{a} = a_T \\mathbf{T} + a_N \\mathbf{N}$ where $a_T = \\frac{d}{dt}|\\mathbf{r}'|$ (tangential — speeding up or slowing down) and $a_N = \\kappa|\\mathbf{r}'|^2$ (normal — turning). This is why you feel pushed sideways on a curve and pressed back under acceleration.",
        ],
        eli5: [
          "A vector function describes a path through space, like the GPS track of a drone. The derivative is the velocity — how fast and which direction it's flying at each moment. Speed is how fast; the unit tangent vector is which direction.",
          "Curvature measures how 'bendy' the path is at each point. Flying straight? Curvature is zero. Doing a tight spiral? Curvature is large. A circle with a small radius has high curvature (tight turns), while a circle with a huge radius has low curvature (gentle turns).",
        ],
      },
      {
        title: "Partial derivatives",
        section: "partials",
        body: [
          "For $f(x, y)$, the partial derivative $f_x = \\frac{\\partial f}{\\partial x}$ differentiates with respect to $x$ while treating $y$ as a constant.",
          "Geometrically: $f_x(a, b)$ is the slope of the surface $z = f(x, y)$ in the $x$-direction at the point $(a, b)$.",
          "Higher-order partials: $f_{xx}$, $f_{yy}$, $f_{xy}$, $f_{yx}$. Clairaut's Theorem: if $f_{xy}$ and $f_{yx}$ are continuous, then $f_{xy} = f_{yx}$ (the order of differentiation doesn't matter).",
          "Example: if $f(x,y) = x^2 y + \\sin(xy)$, then $f_x = 2xy + y\\cos(xy)$ and $f_y = x^2 + x\\cos(xy)$.",
          "Limits and continuity in multiple variables: $\\lim_{(x,y)\\to(a,b)} f(x,y) = L$ means $f$ approaches $L$ from every possible path. To show a limit doesn't exist, find two paths that give different limits.",
        ],
        examples: [
          {
            title: "Showing a multivariable limit does not exist",
            steps: [
              "Investigate $\\lim_{(x,y)\\to(0,0)} \\frac{xy}{x^2 + y^2}$.",
              "Along the path $y = 0$: $\\frac{x \\cdot 0}{x^2 + 0} = 0$. Limit is $0$.",
              "Along the path $y = x$: $\\frac{x \\cdot x}{x^2 + x^2} = \\frac{x^2}{2x^2} = \\frac{1}{2}$. Limit is $\\frac{1}{2}$.",
              "Two paths give different limits ($0 \\neq \\frac{1}{2}$), so the limit does not exist.",
            ],
          },
        ],
      },
      {
        title: "The gradient vector and directional derivatives",
        section: "gradient",
        body: [
          "The gradient of $f(x,y)$ is the vector $\\nabla f = \\langle f_x, f_y \\rangle$. It encodes all the directional information about how $f$ changes. Its direction points toward the steepest uphill, and its magnitude $|\\nabla f|$ is the rate of steepest ascent.",
          "The directional derivative of $f$ in the direction of unit vector $\\mathbf{u}$ is $D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u} = |\\nabla f|\\cos\\theta$, where $\\theta$ is the angle between $\\nabla f$ and $\\mathbf{u}$. This tells you the rate of change of $f$ in any direction.",
          "Key consequences: $D_{\\mathbf{u}} f$ is maximized when $\\mathbf{u}$ points in the direction of $\\nabla f$ (steepest ascent, $\\theta=0$). It's minimized in the direction of $-\\nabla f$ (steepest descent, $\\theta=\\pi$). It's zero when $\\mathbf{u}$ is perpendicular to $\\nabla f$ — this is the 'contour direction' where $f$ stays constant.",
          "The gradient is perpendicular to level curves (in 2D) and level surfaces (in 3D). This is why contour maps work: if you walk along a contour line ($f = $ constant), you're moving perpendicular to $\\nabla f$, so $f$ doesn't change.",
          "The tangent plane to $z = f(x,y)$ at $(a, b, f(a,b))$ is $z - f(a,b) = f_x(a,b)(x-a) + f_y(a,b)(y-b)$. This is the multivariable analog of the tangent line — the best linear approximation to the surface at that point.",
        ],
        eli5: [
          "Imagine standing on a hillside. The gradient vector is an arrow that points directly uphill — the steepest direction you could walk. The length of the arrow tells you how steep that steepest direction is. Walking perpendicular to the gradient means walking along a contour line — staying at the same elevation.",
          "The directional derivative answers: 'If I walk in this particular direction, how steep is the slope?' Walking straight uphill (with the gradient) gives the maximum slope. Walking along a contour (perpendicular to the gradient) gives zero slope. Walking at an angle gives something in between.",
        ],
      },
      {
        title: "Optimization and Lagrange multipliers",
        section: "optimization",
        body: [
          "To find extrema of $f(x,y)$: set $f_x = 0$ and $f_y = 0$ simultaneously. Solutions are critical points.",
          "Second derivative test: compute $D = f_{xx} f_{yy} - (f_{xy})^2$ at a critical point. If $D > 0$ and $f_{xx} > 0$: local min. If $D > 0$ and $f_{xx} < 0$: local max. If $D < 0$: saddle point. If $D = 0$: inconclusive.",
          "Lagrange multipliers solve constrained optimization: maximize/minimize $f(x,y)$ subject to a constraint $g(x,y) = c$.",
          "Method: solve $\\nabla f = \\lambda \\nabla g$ and $g(x,y) = c$ simultaneously. The scalar $\\lambda$ is the Lagrange multiplier.",
          "Geometric insight: at a constrained extremum, the gradient of $f$ must be parallel to the gradient of $g$. They point in the same (or opposite) direction along the constraint curve.",
        ],
        examples: [
          {
            title: "Lagrange multipliers: maximizing on a circle",
            steps: [
              "Maximize $f(x,y) = x + 2y$ subject to $g(x,y) = x^2 + y^2 = 5$.",
              "$\\nabla f = \\langle 1, 2 \\rangle$ and $\\nabla g = \\langle 2x, 2y \\rangle$.",
              "Set $\\nabla f = \\lambda \\nabla g$: $1 = 2\\lambda x$ and $2 = 2\\lambda y$.",
              "From equation 1: $\\lambda = \\frac{1}{2x}$. From equation 2: $\\lambda = \\frac{1}{y}$.",
              "So $\\frac{1}{2x} = \\frac{1}{y} \\Rightarrow y = 2x$.",
              "Substitute into the constraint: $x^2 + (2x)^2 = 5 \\Rightarrow 5x^2 = 5 \\Rightarrow x = \\pm 1$.",
              "Points: $(1, 2)$ and $(-1, -2)$. $f(1,2) = 5$ (max) and $f(-1,-2) = -5$ (min).",
            ],
          },
        ],
      },
      {
        title: "Multiple integrals",
        section: "multiint",
        body: [
          "A double integral $\\iint_R f(x,y)\\,dA$ computes the volume under $z = f(x,y)$ over a region $R$ in the $xy$-plane.",
          "Iterated integrals: $\\iint_R f\\,dA = \\int_a^b \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx$. Evaluate the inner integral first (treating the outer variable as a constant).",
          "Fubini's Theorem: if $f$ is continuous on $R$, you can integrate in either order: $\\int\\int f\\,dy\\,dx = \\int\\int f\\,dx\\,dy$. Sometimes one order is much easier.",
          "Polar coordinates: for circular or radial regions, use $x = r\\cos\\theta$, $y = r\\sin\\theta$, $dA = r\\,dr\\,d\\theta$. The extra factor of $r$ is critical.",
          "Triple integrals extend to 3D: $\\iiint_E f\\,dV$ computes mass (if $f$ is density), or volume (if $f = 1$).",
          "Cylindrical coordinates $(r, \\theta, z)$: $dV = r\\,dr\\,d\\theta\\,dz$. Use for problems with cylindrical symmetry.",
          "Spherical coordinates $(\\rho, \\phi, \\theta)$: $dV = \\rho^2 \\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$. Use for spheres and cones.",
          "Applications: mass = $\\iint \\rho\\,dA$, center of mass = $\\frac{\\iint x\\rho\\,dA}{\\text{mass}}$, moments of inertia.",
        ],
        examples: [
          {
            title: "Double integral in polar coordinates",
            steps: [
              "Evaluate $\\iint_R e^{-(x^2+y^2)}\\,dA$ where $R$ is the disk $x^2 + y^2 \\leq 4$.",
              "Convert to polar: $x^2 + y^2 = r^2$, $dA = r\\,dr\\,d\\theta$, and the disk becomes $0 \\leq r \\leq 2$, $0 \\leq \\theta \\leq 2\\pi$.",
              "$\\int_0^{2\\pi} \\int_0^2 e^{-r^2} \\cdot r\\,dr\\,d\\theta$.",
              "The $\\theta$ integral is trivial: $\\int_0^{2\\pi} d\\theta = 2\\pi$.",
              "For the $r$ integral: $\\int_0^2 r e^{-r^2}\\,dr$. Let $u = -r^2$, $du = -2r\\,dr$: $-\\frac{1}{2}\\int_0^{-4} e^u\\,du = -\\frac{1}{2}[e^{-4} - 1] = \\frac{1-e^{-4}}{2}$.",
              "Total: $2\\pi \\cdot \\frac{1 - e^{-4}}{2} = \\pi(1 - e^{-4})$.",
            ],
          },
        ],
      },
      {
        title: "Vector fields",
        section: "vectorfields",
        body: [
          "A vector field assigns a vector to every point in space: $\\mathbf{F}(x,y) = \\langle P(x,y), Q(x,y) \\rangle$ in 2D, or $\\mathbf{F}(x,y,z) = \\langle P, Q, R \\rangle$ in 3D. Visually, draw a small arrow at each point showing the direction and magnitude.",
          "Physical examples: gravitational fields (arrows point toward massive objects), electric fields (arrows show the force on a positive charge), fluid velocity fields (arrows show speed and direction of flow at each point), wind maps, and magnetic fields.",
          "A vector field is conservative if $\\mathbf{F} = \\nabla f$ for some scalar function $f$ (called the potential function). This means the field is the gradient of something. Conservative fields have a crucial property: the line integral between two points is independent of the path taken — only the endpoints matter.",
          "Test for conservative fields in 2D: $\\mathbf{F} = \\langle P, Q \\rangle$ is conservative if and only if $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$ on a simply connected domain (no holes). This is the 'cross-partial' test.",
          "Finding the potential function: if $\\mathbf{F} = \\langle P, Q \\rangle$ passes the cross-partial test, find $f$ by integrating: $f(x,y) = \\int P\\,dx$ (treating $y$ as constant), then determine any leftover function of $y$ by matching $f_y = Q$.",
          "Non-conservative fields include anything with a nonzero curl (in 3D) or failing the cross-partial test. The work done by such a field depends on the path, not just the endpoints. Example: $\\mathbf{F} = \\langle -y, x \\rangle$ has $P_y = -1$ but $Q_x = 1$, so it's not conservative — it swirls.",
        ],
        eli5: [
          "A vector field is like a weather map with wind arrows at every location. At each point, the arrow tells you which way the wind blows and how strong it is.",
          "A conservative field is special: it has a 'potential energy landscape' underneath it, like a hilly terrain where the arrows always point downhill. In such a field, the work done between two points depends only on the elevation difference, not on the path you take. A non-conservative field has no such landscape — the path matters, like a wind field that swirls in circles.",
        ],
      },
      {
        title: "Line integrals",
        section: "lineint",
        body: [
          "A line integral computes a quantity accumulated along a curve $C$ in space. There are two main types, and they answer different questions.",
          "Scalar line integral: $\\int_C f\\,ds = \\int_a^b f(\\mathbf{r}(t)) |\\mathbf{r}'(t)|\\,dt$. Here $ds = |\\mathbf{r}'(t)|\\,dt$ is the arc length element. This computes the 'weighted length' of the curve — for example, the mass of a wire with density $f$ at each point, or the total cost of a path where $f$ is the cost per unit length.",
          "Vector line integral (work integral): $\\int_C \\mathbf{F} \\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}(\\mathbf{r}(t)) \\cdot \\mathbf{r}'(t)\\,dt$. The dot product picks out the component of $\\mathbf{F}$ in the direction of motion. This computes the work done by the force field $\\mathbf{F}$ on a particle moving along $C$. Force components perpendicular to the path contribute zero work.",
          "Fundamental Theorem for Line Integrals: if $\\mathbf{F} = \\nabla f$ (conservative), then $\\int_C \\nabla f \\cdot d\\mathbf{r} = f(\\text{end}) - f(\\text{start})$. The integral depends only on the endpoints, not the path. This is the multivariable analog of $\\int_a^b F'(x)\\,dx = F(b) - F(a)$.",
          "Corollary: for a conservative field, the line integral around any closed loop is zero ($\\oint_C \\nabla f \\cdot d\\mathbf{r} = 0$). You end where you started, so the potential difference is zero.",
        ],
        eli5: [
          "A scalar line integral is like measuring the total cost of a road trip, where different stretches of road have different tolls per mile. You multiply the toll rate by the distance at each point and add up along the route.",
          "A vector line integral (work) is like measuring how much the wind helps or hinders you as you walk along a path. Wind pushing you forward = positive work. Wind pushing sideways = zero contribution. Wind pushing backward = negative work. The total work is what you feel over the entire walk.",
        ],
        examples: [
          {
            title: "Work integral using the Fundamental Theorem",
            steps: [
              "Compute $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$ where $\\mathbf{F} = \\langle 2x, 2y \\rangle$ and $C$ is any path from $(0,0)$ to $(3,4)$.",
              "Check if $\\mathbf{F}$ is conservative: $P = 2x$, $Q = 2y$. $P_y = 0$ and $Q_x = 0$. Since $P_y = Q_x$, $\\mathbf{F}$ is conservative.",
              "Find the potential function: $f_x = 2x \\Rightarrow f = x^2 + g(y)$. Then $f_y = g'(y) = 2y \\Rightarrow g(y) = y^2 + C$.",
              "So $f(x,y) = x^2 + y^2$.",
              "By the Fundamental Theorem: $\\int_C \\nabla f \\cdot d\\mathbf{r} = f(3,4) - f(0,0) = (9+16) - 0 = 25$.",
              "The answer is $25$, regardless of which path we take from $(0,0)$ to $(3,4)$.",
            ],
          },
        ],
      },
      {
        title: "Curl and divergence",
        section: "curldiv",
        body: [
          "Divergence measures how much a vector field 'spreads out' from a point: $\\text{div}\\,\\mathbf{F} = \\nabla \\cdot \\mathbf{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}$.",
          "Positive divergence: source (field flows outward). Negative: sink (field flows inward). Zero: incompressible flow.",
          "Curl measures the 'rotation' or 'circulation' of a field: $\\text{curl}\\,\\mathbf{F} = \\nabla \\times \\mathbf{F} = \\left\\langle \\frac{\\partial R}{\\partial y} - \\frac{\\partial Q}{\\partial z},\\, \\frac{\\partial P}{\\partial z} - \\frac{\\partial R}{\\partial x},\\, \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right\\rangle$.",
          "If $\\text{curl}\\,\\mathbf{F} = \\mathbf{0}$ everywhere, the field is irrotational (no swirling). For simply connected domains, irrotational implies conservative.",
          "Physical examples: the curl of a fluid velocity field tells you how fast and around which axis a small paddle wheel would spin. The divergence tells you whether fluid is being created or destroyed at a point.",
        ],
      },
      {
        title: "Green's, Stokes', and the Divergence Theorem",
        section: "theorems",
        body: [
          "These three theorems are the pinnacle of vector calculus. Each relates an integral over a boundary to an integral over the region it encloses.",
          "Green's Theorem (2D): $\\oint_C P\\,dx + Q\\,dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA$. A line integral around a closed curve equals a double integral over the enclosed region.",
          "Stokes' Theorem (3D surfaces): $\\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$. A line integral around the boundary of a surface equals the surface integral of the curl.",
          "Divergence Theorem (3D volumes): $\\oiint_S \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_E (\\nabla \\cdot \\mathbf{F})\\,dV$. The flux through a closed surface equals the triple integral of the divergence inside.",
          "Unified pattern: in every case, an integral over the boundary = an integral of a derivative over the interior. This is the same idea as the Fundamental Theorem of Calculus ($\\int_a^b f'(x)\\,dx = f(b) - f(a)$), generalized to higher dimensions.",
          "Green's Theorem is the 2D special case of Stokes'. The Divergence Theorem is the 3D analog for flux instead of circulation.",
        ],
        eli5: [
          "Imagine you have a pond with water flowing around. You want to know the total circulation (how much the water swirls) around the edge of the pond. Green's Theorem says: instead of measuring along the entire bank, you can add up all the tiny swirls inside the pond. The total around the boundary equals the sum of what's happening inside.",
          "Stokes' Theorem is the same idea but for a surface in 3D — like measuring the total wind circulation around the edge of a sail by adding up the curl of the wind over the sail's surface.",
          "The Divergence Theorem says: the total amount of stuff flowing out through the walls of a room equals the total amount of stuff being produced inside the room. Sources inside push flux out through the boundary.",
          "All three theorems say the same thing at different levels: boundary integral = interior derivative integral. This is the grand unification of calculus.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting the $r$ factor when converting to polar coordinates: $dA = r\\,dr\\,d\\theta$, not $dr\\,d\\theta$.",
      "In double integrals, getting the order of integration wrong or using incorrect bounds. Always sketch the region first.",
      "Confusing the dot product and cross product. The dot product gives a scalar; the cross product gives a vector.",
      "Applying the 2D conservative test ($P_y = Q_x$) to a non-simply-connected domain. The test can give a false positive if the domain has holes.",
      "In line integrals, forgetting to parametrize the curve before integrating. You need $\\mathbf{r}(t)$ and $\\mathbf{r}'(t)$.",
      "Confusing divergence (a scalar) with curl (a vector). Divergence measures expansion; curl measures rotation.",
      "In Stokes' Theorem, using the wrong orientation. The boundary curve and surface normal must be consistently oriented (right-hand rule).",
      "Forgetting the $\\rho^2 \\sin\\phi$ factor in spherical coordinates. This is the 3D analog of the $r$ factor in polar.",
    ],
  },
];
