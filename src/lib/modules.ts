import type { Topic } from "@/lib/shared-types";

export type WorkedExample = {
  title: string;
  steps: string[];
};

export type ModuleSection = {
  title: string;
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
  {
    topicId: "limits",
    title: "Limits & Continuity",
    intro: [
      "Limits are the foundation of all of calculus. Every derivative and every integral is secretly a limit. Before you can do anything else, you need to master what it means for a function to approach a value.",
      "The notation $\\lim_{x\\to a} f(x) = L$ means: as $x$ gets arbitrarily close to $a$, the outputs $f(x)$ get arbitrarily close to $L$. Notice we never require $f(a)$ itself to equal $L$, or even to exist.",
      "Continuity is the special case where the limit and the actual value agree. A function is continuous when you can draw it without lifting your pen. Most functions you encounter are continuous, but the interesting calculus happens at the exceptions.",
    ],
    sections: [
      {
        title: "Functional representations: the language before the calculus",
        body: [
          "Before studying limits, you need fluency with the functions that calculus operates on. Every model in science begins with choosing the right function family.",
          "Linear functions $f(x) = mx + b$ model constant rates of change. Their graphs are straight lines, and their simplicity is what derivatives approximate locally — the tangent line is a linear approximation.",
          "Power functions $f(x) = x^n$ produce polynomial behavior. Quadratics model projectile motion, cubics model inflection-style curves. Polynomials are the most 'well-behaved' functions: continuous, differentiable, no surprises.",
          "Exponential functions $f(x) = a^x$ (especially $e^x$) model growth and decay — population, radioactivity, compound interest. Their defining property: the rate of growth is proportional to the current value. This is why $e^x$ is its own derivative.",
          "Logarithmic functions $f(x) = \\log_a(x)$ are the inverses of exponentials. $\\ln x$ grows without bound, but incredibly slowly. It takes center stage in integration ($\\int 1/x\\,dx = \\ln|x| + C$).",
          "Trigonometric functions $\\sin x$, $\\cos x$, $\\tan x$ model periodic phenomena — waves, oscillations, circular motion. Their derivatives cycle through each other, and their limits (especially $\\lim_{x\\to 0} \\sin x / x = 1$) are foundational.",
          "Inverse functions reverse input and output. If $f(x) = e^x$, then $f^{-1}(x) = \\ln x$. For inverses to exist, $f$ must be one-to-one. The derivative of an inverse function satisfies $(f^{-1})'(x) = \\frac{1}{f'(f^{-1}(x))}$.",
          "Piecewise functions are defined by different rules on different intervals. They are the natural setting for studying one-sided limits, continuity, and differentiability — the exact concepts coming next.",
        ],
        eli5: [
          "Think of function families like different vehicle types. Linear functions are bicycles — steady, predictable speed. Exponentials are rockets — the faster they go, the faster they accelerate. Logarithms are the opposite: rapid start, then diminishing returns. Trig functions are Ferris wheels — they go up and down in a repeating cycle.",
          "Calculus doesn't invent new functions — it studies how these existing families change. The whole point of the derivative is to measure the 'speed' of a function, and the integral measures the 'total distance traveled.' You need to recognize the function before you can analyze it.",
        ],
      },
      {
        title: "Building intuition: what does 'approaching' mean?",
        body: [
          "Imagine plugging in values of $x$ that get closer and closer to $a$. For $f(x) = (x^2-1)/(x-1)$, try $x=0.9, 0.99, 0.999, 1.001, 1.01, 1.1$. You'll see the outputs cluster around $2$, even though $f(1)$ is undefined.",
          "That clustering is the limit. Formally, $\\lim_{x\\to 1} \\frac{x^2-1}{x-1} = 2$ because the outputs can be made as close to $2$ as we like by choosing $x$ close enough to $1$.",
          "The limit cares about the neighborhood around a point, not the point itself. This is why limits are useful: they let us analyze behavior at places where the function might break.",
          "The formal $\\varepsilon$-$\\delta$ definition makes this precise: $\\lim_{x\\to a} f(x) = L$ means for every $\\varepsilon > 0$, there exists a $\\delta > 0$ such that if $0 < |x - a| < \\delta$ then $|f(x) - L| < \\varepsilon$. You pick a tolerance $\\varepsilon$ for the output, and the definition guarantees a tolerance $\\delta$ for the input that works.",
        ],
        eli5: [
          "Imagine you're walking toward a door but you never actually step through it. With every step, you get halfway closer. The question is: what's on the other side of the door? Even though you never reach it, you can get close enough to peek through and see the answer. That peek is the limit.",
          "The formal definition just says: no matter how close you want the answer to be (that's $\\varepsilon$), I can always get close enough to the input (that's $\\delta$) to make it happen.",
        ],
        examples: [
          {
            title: "Building a limit table",
            steps: [
              "Estimate $\\lim_{x\\to 2} \\frac{x^2 - 4}{x - 2}$ numerically.",
              "The function is undefined at $x = 2$ ($0/0$). But we can approach from both sides.",
              "From the left: $f(1.9) = 3.9$, $f(1.99) = 3.99$, $f(1.999) = 3.999$.",
              "From the right: $f(2.1) = 4.1$, $f(2.01) = 4.01$, $f(2.001) = 4.001$.",
              "The outputs clearly approach $4$ from both sides.",
              "Algebraic verification: $\\frac{x^2-4}{x-2} = \\frac{(x-2)(x+2)}{x-2} = x+2$ for $x \\neq 2$. So $\\lim_{x\\to 2} (x+2) = 4$. ✓",
            ],
          },
        ],
      },
      {
        title: "One-sided limits",
        body: [
          "The left-hand limit $\\lim_{x\\to a^-} f(x)$ only uses $x$-values less than $a$ (approaching from the left). The right-hand limit $\\lim_{x\\to a^+} f(x)$ only uses values greater than $a$.",
          "The two-sided limit $\\lim_{x\\to a} f(x)$ exists if and only if both one-sided limits exist and are equal. This is the bridge between one-sided behavior and a 'full' limit.",
          "Example: for $f(x) = |x|/x$, we have $\\lim_{x\\to 0^-} f(x) = -1$ and $\\lim_{x\\to 0^+} f(x) = 1$. Since they disagree, the two-sided limit at $0$ does not exist.",
          "One-sided limits are essential for piecewise functions, absolute value expressions, and functions with jumps. They also arise naturally at domain boundaries — for instance, $\\lim_{x\\to 0^+} \\ln x = -\\infty$, and asking about the left-hand limit doesn't make sense since $\\ln x$ is undefined for $x < 0$.",
        ],
        eli5: [
          "Think of a one-way street. The left-hand limit is what you'd see driving in from the left; the right-hand limit is what you'd see from the right. If both drivers see the same thing, the limit exists. If one sees a café and the other sees a parking lot, there's a disagreement — no single limit.",
        ],
        examples: [
          {
            title: "One-sided limits of a piecewise function",
            steps: [
              "Evaluate the one-sided limits of $f(x) = \\begin{cases} x+1, & x < 3 \\\\ 5, & x = 3 \\\\ x^2 - 5, & x > 3 \\end{cases}$ at $x = 3$.",
              "Left-hand limit: use the piece $x + 1$ (valid for $x < 3$). $\\lim_{x\\to 3^-}(x+1) = 4$.",
              "Right-hand limit: use the piece $x^2 - 5$ (valid for $x > 3$). $\\lim_{x\\to 3^+}(x^2-5) = 9 - 5 = 4$.",
              "Both one-sided limits equal $4$, so $\\lim_{x\\to 3} f(x) = 4$.",
              "But $f(3) = 5 \\neq 4$, so $f$ has a removable discontinuity at $x = 3$ (the limit exists but doesn't match the function value).",
            ],
          },
        ],
      },
      {
        title: "Evaluating limits: direct substitution",
        body: [
          "Always try direct substitution first. If $f$ is continuous at $a$, then $\\lim_{x\\to a} f(x) = f(a)$. You're done. This is the simplest and fastest method.",
          "Polynomials, rational functions (away from zeros of the denominator), $e^x$, $\\ln x$ (for $x>0$), $\\sin x$, $\\cos x$, and $\\tan x$ (away from asymptotes) are all continuous on their domains. Compositions, sums, and products of continuous functions are also continuous.",
          "Direct substitution fails when you get an undefined expression like $0/0$ or $\\infty/\\infty$. These are called indeterminate forms, and they signal that the function's behavior at that point is more complex — the limit might exist, but you need algebraic techniques or L'Hôpital's Rule to find it.",
          "If substitution gives something like $5/0$ (nonzero over zero), the limit doesn't exist as a finite number — the function blows up. This typically signals a vertical asymptote.",
        ],
        eli5: [
          "Direct substitution is like asking: 'What happens if I just plug in the number?' For well-behaved functions, this works perfectly — the function doesn't do anything weird at that point, so you just evaluate normally.",
          "It only breaks when you get something meaningless like $0/0$. That's the function telling you: 'It's not that simple here — something subtle is going on. You'll need to dig deeper.'",
        ],
        examples: [
          {
            title: "When substitution works vs. fails",
            steps: [
              "Example 1: $\\lim_{x\\to 2} (x^3 + 1)$. Substitute: $2^3 + 1 = 9$. Done. Polynomials are continuous everywhere.",
              "Example 2: $\\lim_{x\\to 0} \\frac{\\sin x}{x}$. Substitute: $\\frac{\\sin 0}{0} = \\frac{0}{0}$. Indeterminate — substitution fails. Need another technique (this famous limit equals $1$).",
              "Example 3: $\\lim_{x\\to 3} \\frac{x+1}{x-3}$. Substitute: $\\frac{4}{0}$. Not indeterminate — the numerator is nonzero. This means the function blows up: the limit is $\\pm\\infty$ (vertical asymptote at $x=3$).",
              "Lesson: $0/0$ means 'undecided, investigate further.' Nonzero over zero means 'the limit is infinite.'",
            ],
          },
        ],
      },
      {
        title: "Indeterminate forms and algebraic tricks",
        body: [
          "The expression $0/0$ is called indeterminate because the limit could be anything: $0$, $5$, $\\infty$, or it might not exist. You must simplify.",
          "Factor and cancel: if the numerator and denominator share a common factor like $(x-a)$, cancel it and try substitution again.",
          "Rationalize: when you see a square root, multiply by the conjugate. For example, $\\frac{\\sqrt{x+1}-1}{x}$ times $\\frac{\\sqrt{x+1}+1}{\\sqrt{x+1}+1}$ simplifies the radical.",
          "Combine fractions: if the expression has two fractions being subtracted, find a common denominator to combine them into a single fraction.",
          "Use trig identities: rewrite expressions using $\\sin^2 x + \\cos^2 x = 1$, double-angle formulas, or the identity $1-\\cos x = 2\\sin^2(x/2)$ to simplify.",
        ],
        examples: [
          {
            title: "Factoring a removable discontinuity",
            steps: [
              "Compute $\\lim_{x\\to 3} \\frac{x^2-9}{x-3}$.",
              "First, try direct substitution: plugging in $x=3$ gives $\\frac{9-9}{3-3} = \\frac{0}{0}$. This is indeterminate, so we need to simplify.",
              "Recognize that the numerator is a difference of squares: $x^2 - 9 = (x-3)(x+3)$.",
              "Rewrite: $\\frac{(x-3)(x+3)}{x-3}$. Since we're taking the limit as $x \\to 3$ (not evaluating at $x=3$), $x \\neq 3$, so we can cancel the $(x-3)$ terms.",
              "After canceling: $\\lim_{x\\to 3} (x+3)$.",
              "Now direct substitution works: $3 + 3 = 6$.",
              "The limit is $6$. The original function has a hole at $x=3$, but the limit 'sees through' the hole to the value the function approaches.",
            ],
          },
          {
            title: "Rationalizing a radical expression",
            steps: [
              "Compute $\\lim_{x\\to 0} \\frac{\\sqrt{1+x} - 1}{x}$.",
              "Direct substitution: $\\frac{\\sqrt{1}-1}{0} = \\frac{0}{0}$. Indeterminate.",
              "The trouble is the square root in the numerator. To eliminate it, multiply by the conjugate: $\\frac{\\sqrt{1+x}-1}{x} \\cdot \\frac{\\sqrt{1+x}+1}{\\sqrt{1+x}+1}$.",
              "The numerator becomes $(\\sqrt{1+x})^2 - 1^2 = (1+x) - 1 = x$ (difference of squares pattern).",
              "So the expression simplifies to $\\frac{x}{x(\\sqrt{1+x}+1)} = \\frac{1}{\\sqrt{1+x}+1}$.",
              "Now substitute $x=0$: $\\frac{1}{\\sqrt{1}+1} = \\frac{1}{2}$.",
              "The limit is $\\frac{1}{2}$. The conjugate trick is your go-to whenever you see $\\sqrt{\\text{something}} - \\text{number}$ in a limit.",
            ],
          },
        ],
      },
      {
        title: "Key trigonometric limits",
        body: [
          "These special limits appear constantly and should be memorized:",
          "$\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1$. This is the most important trig limit in calculus. It's proven using the Squeeze Theorem.",
          "$\\lim_{x\\to 0} \\frac{1-\\cos x}{x} = 0$. You can derive this by multiplying by $\\frac{1+\\cos x}{1+\\cos x}$ and using the first limit.",
          "$\\lim_{x\\to 0} \\frac{\\tan x}{x} = 1$. This follows from $\\frac{\\tan x}{x} = \\frac{\\sin x}{x} \\cdot \\frac{1}{\\cos x}$.",
          "Generalization: $\\lim_{x\\to 0} \\frac{\\sin(kx)}{x} = k$ for any constant $k$. Factor out the $k$ or substitute $u=kx$.",
          "Another useful limit: $\\lim_{x\\to 0} \\frac{e^x - 1}{x} = 1$. This shows up in many exponential limit problems.",
        ],
        examples: [
          {
            title: "Using the generalized sin(kx)/x limit",
            steps: [
              "Compute $\\lim_{x\\to 0} \\frac{\\sin(5x)}{3x}$.",
              "This doesn't match $\\frac{\\sin x}{x}$ exactly, but we can manipulate it to use the standard limit.",
              "Rewrite: $\\frac{\\sin(5x)}{3x} = \\frac{5}{3} \\cdot \\frac{\\sin(5x)}{5x}$. We multiplied and divided by $5$ to create the form $\\frac{\\sin(\\text{stuff})}{\\text{stuff}}$.",
              "Now as $x \\to 0$, the expression $5x \\to 0$ as well, so $\\frac{\\sin(5x)}{5x} \\to 1$ by the standard trig limit.",
              "Therefore: $\\frac{5}{3} \\cdot 1 = \\frac{5}{3}$.",
              "Key takeaway: whenever you see $\\frac{\\sin(kx)}{mx}$, the answer is $\\frac{k}{m}$. Just match the argument of $\\sin$ with the denominator.",
            ],
          },
        ],
      },
      {
        title: "The Squeeze Theorem",
        body: [
          "If $g(x) \\leq f(x) \\leq h(x)$ near $a$, and $\\lim_{x\\to a} g(x) = \\lim_{x\\to a} h(x) = L$, then $\\lim_{x\\to a} f(x) = L$.",
          "The function $f$ is 'squeezed' between two functions that both approach the same value, so $f$ has no choice but to approach that value too.",
          "Classic example: $\\lim_{x\\to 0} x^2 \\sin(1/x)$. We know $-x^2 \\leq x^2\\sin(1/x) \\leq x^2$, and both $-x^2$ and $x^2$ approach $0$, so the limit is $0$.",
          "The Squeeze Theorem is how we rigorously prove $\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1$ using geometry of the unit circle.",
        ],
        eli5: [
          "Imagine you're walking between two friends on a sidewalk. Both friends are heading toward the same coffee shop. Since you're stuck between them, you have to end up at the same coffee shop too — you have no choice.",
          "That's the Squeeze Theorem. If a wiggly, hard-to-track function is trapped between two simpler functions, and those simpler functions both go to the same place, the wiggly one must go there too.",
          "It's especially handy when a function oscillates wildly (like $\\sin(1/x)$ near zero) but is being multiplied by something that shrinks to zero (like $x^2$). The shrinking part forces everything to zero.",
        ],
        examples: [
          {
            title: "Squeeze Theorem with an oscillating function",
            steps: [
              "Compute $\\lim_{x\\to 0} x^2 \\cos(1/x)$.",
              "The problem: $\\cos(1/x)$ oscillates wildly between $-1$ and $1$ as $x \\to 0$. We can't evaluate $\\cos(1/0)$. So direct substitution is hopeless.",
              "But we know $-1 \\leq \\cos(1/x) \\leq 1$ for all $x \\neq 0$.",
              "Multiply the entire inequality by $x^2$ (which is positive, so the inequality direction stays the same): $-x^2 \\leq x^2\\cos(1/x) \\leq x^2$.",
              "Now evaluate the outer limits: $\\lim_{x\\to 0} (-x^2) = 0$ and $\\lim_{x\\to 0} x^2 = 0$.",
              "Both sides squeeze to $0$, so by the Squeeze Theorem: $\\lim_{x\\to 0} x^2\\cos(1/x) = 0$.",
              "The insight: even though $\\cos(1/x)$ is chaotic, $x^2$ is shrinking to zero so fast that it forces the entire product to zero. The $x^2$ 'tames' the oscillation.",
            ],
          },
        ],
      },
      {
        title: "Continuity",
        body: [
          "A function is continuous at $x=a$ when three conditions all hold: (1) $f(a)$ is defined, (2) $\\lim_{x\\to a} f(x)$ exists, and (3) $\\lim_{x\\to a} f(x) = f(a)$.",
          "If any condition fails, we have a discontinuity. Types of discontinuity:",
          "Removable discontinuity (hole): the limit exists but $f(a)$ is either undefined or disagrees with the limit. Example: $f(x) = (x^2-1)/(x-1)$ at $x=1$.",
          "Jump discontinuity: the left and right limits exist but are different. Example: $f(x) = \\lfloor x \\rfloor$ (floor function) at every integer.",
          "Infinite discontinuity: the function blows up to $\\pm\\infty$. Example: $f(x) = 1/x$ at $x=0$.",
          "A function continuous on a closed interval $[a,b]$ is guaranteed to hit every $y$-value between $f(a)$ and $f(b)$ (Intermediate Value Theorem). This is used to prove equations have solutions.",
        ],
        eli5: [
          "A continuous function is one you can draw without lifting your pen off the paper. No gaps, no jumps, no sudden teleporting.",
          "A hole (removable discontinuity) is like a missing stepping stone in a path — the path clearly continues, but one stone is gone. A jump is like a staircase — you suddenly leap to a different height. An infinite discontinuity is like a cliff — the ground drops away forever.",
          "The Intermediate Value Theorem is common sense: if it's 30°F in the morning and 70°F in the afternoon, at some point during the day it must have been exactly 50°F. Temperature doesn't teleport — it's continuous.",
        ],
      },
      {
        title: "Evaluating limits of piecewise functions",
        body: [
          "For a piecewise function, you must check the left-hand and right-hand limits separately at each boundary point. Each side of the boundary uses a different formula.",
          "Use the piece that applies for $x < a$ to compute $\\lim_{x\\to a^-}$, and the piece that applies for $x > a$ to compute $\\lim_{x\\to a^+}$.",
          "If $\\lim_{x\\to a^-} f(x) = \\lim_{x\\to a^+} f(x) = L$, then $\\lim_{x\\to a} f(x) = L$. For continuity, you additionally need $f(a) = L$ — the actual function value at the boundary must match.",
          "Three outcomes at a boundary: (1) both sides match and equal $f(a)$ — continuous; (2) both sides match but $f(a)$ differs — removable discontinuity; (3) the sides disagree — jump discontinuity.",
        ],
        eli5: [
          "A piecewise function is like a road that changes surface material at a certain point — asphalt on one side, gravel on the other. To see if the road is smooth at the junction, you need to check both sides. If both end at the same elevation and the road is actually at that elevation, it's a smooth crossing. Otherwise there's a bump, a gap, or a cliff.",
        ],
        examples: [
          {
            title: "Continuity check for a piecewise function",
            steps: [
              "Let $f(x) = \\begin{cases} x^2, & x < 2 \\\\ 3x - 2, & x \\geq 2 \\end{cases}$. Is $f$ continuous at $x = 2$?",
              "Left-hand limit: $\\lim_{x\\to 2^-} x^2 = 4$.",
              "Right-hand limit: $\\lim_{x\\to 2^+} (3x-2) = 6-2 = 4$.",
              "Both one-sided limits equal $4$, so $\\lim_{x\\to 2} f(x) = 4$.",
              "Function value: $f(2) = 3(2)-2 = 4$ (using the $x \\geq 2$ piece).",
              "Since $\\lim_{x\\to 2} f(x) = f(2) = 4$, the function is continuous at $x = 2$. ✓",
              "The two pieces meet seamlessly at the boundary — no hole, no jump.",
            ],
          },
        ],
      },
      {
        title: "Infinite limits and vertical asymptotes",
        body: [
          "An infinite limit like $\\lim_{x\\to a} f(x) = \\infty$ means the outputs grow without bound as $x$ approaches $a$. The limit technically does not exist as a real number, but we write $\\infty$ to describe the behavior.",
          "Vertical asymptotes occur where the denominator approaches $0$ but the numerator does not. The graph shoots upward or downward near these points.",
          "Check signs carefully: $\\lim_{x\\to 0^+} 1/x = +\\infty$ but $\\lim_{x\\to 0^-} 1/x = -\\infty$. The one-sided behavior can differ, so always examine both sides. If the two sides have opposite signs, the graph has an asymptote going in both directions.",
          "For rational functions, factor the denominator to find all vertical asymptotes. Cancel common factors first — those give removable discontinuities (holes), not asymptotes.",
          "For functions like $\\ln x$, $\\tan x$, and $\\csc x$, the asymptotes come from the nature of the function rather than a denominator. For example, $\\tan x$ has vertical asymptotes at $x = \\pm \\pi/2, \\pm 3\\pi/2, \\ldots$",
        ],
        eli5: [
          "A vertical asymptote is an invisible wall that the function's graph races toward but never crosses. As $x$ gets closer to that wall, the output skyrockets (or plummets) toward infinity. The graph gets infinitely tall or infinitely deep right at that $x$-value.",
          "To find these walls in a fraction: look where the denominator equals zero. If the numerator is nonzero there, you've found an asymptote. If the numerator is also zero, the zeros might cancel and you get a hole instead — like a pothole, not a wall.",
        ],
        examples: [
          {
            title: "Identifying vertical asymptotes vs. holes",
            steps: [
              "Analyze $f(x) = \\frac{x^2 - 1}{x^2 - x}$ for vertical asymptotes.",
              "Factor: $f(x) = \\frac{(x-1)(x+1)}{x(x-1)}$.",
              "The denominator is zero at $x = 0$ and $x = 1$.",
              "At $x = 1$: the factor $(x-1)$ cancels from top and bottom. After canceling, $f(x) = \\frac{x+1}{x}$ for $x \\neq 1$. So $x = 1$ is a hole, not an asymptote. The limit is $\\frac{2}{1} = 2$.",
              "At $x = 0$: after canceling, $f(x) = \\frac{x+1}{x}$. The numerator is $1$ (nonzero) while the denominator is $0$. This is a vertical asymptote.",
              "$\\lim_{x\\to 0^+} \\frac{x+1}{x} = +\\infty$ and $\\lim_{x\\to 0^-} \\frac{x+1}{x} = -\\infty$.",
            ],
          },
        ],
      },
      {
        title: "Limits at infinity and horizontal asymptotes",
        body: [
          "Limits as $x\\to \\infty$ describe long-run behavior. A horizontal asymptote $y=L$ means $\\lim_{x\\to \\infty} f(x) = L$ or $\\lim_{x\\to -\\infty} f(x) = L$.",
          "For rational functions $\\frac{p(x)}{q(x)}$, compare the degrees: if $\\deg(p) < \\deg(q)$, the limit is $0$. If $\\deg(p) = \\deg(q)$, the limit is the ratio of leading coefficients. If $\\deg(p) > \\deg(q)$, the limit is $\\pm\\infty$ (no horizontal asymptote).",
          "Technique: divide every term by the highest power of $x$ in the denominator. As $x\\to \\infty$, terms like $1/x$, $1/x^2$, etc. all go to $0$.",
          "For expressions with radicals, factor out the dominant term. Example: $\\lim_{x\\to \\infty} \\frac{\\sqrt{4x^2+1}}{x} = \\lim_{x\\to \\infty} \\frac{x\\sqrt{4+1/x^2}}{x} = 2$.",
        ],
        examples: [
          {
            title: "Rational function limit at infinity",
            steps: [
              "Compute $\\lim_{x\\to \\infty} \\frac{2x^2 + 3x + 1}{x^2 - 4}$.",
              "Both numerator and denominator grow without bound, so we get $\\infty / \\infty$. We need to compare how fast each grows.",
              "Technique: divide every term by the highest power of $x$ in the denominator, which is $x^2$.",
              "$\\frac{2x^2 + 3x + 1}{x^2 - 4} = \\frac{2 + 3/x + 1/x^2}{1 - 4/x^2}$.",
              "As $x \\to \\infty$: $3/x \\to 0$, $1/x^2 \\to 0$, and $4/x^2 \\to 0$.",
              "So the expression approaches $\\frac{2 + 0 + 0}{1 - 0} = 2$.",
              "The horizontal asymptote is $y = 2$. Quick rule: when the degrees are equal, the limit is just the ratio of the leading coefficients ($2/1 = 2$).",
            ],
          },
        ],
      },
      {
        title: "L'Hôpital's Rule",
        body: [
          "When direct substitution gives $0/0$ or $\\infty/\\infty$, L'Hôpital's Rule says: $\\lim_{x\\to a} \\frac{f(x)}{g(x)} = \\lim_{x\\to a} \\frac{f'(x)}{g'(x)}$, provided the right-hand limit exists.",
          "Important: differentiate the numerator and denominator separately — not as a single fraction. This is not the quotient rule.",
          "After applying the rule once, check whether the new limit is still indeterminate. If it is, apply L'Hôpital's Rule again. Repeat until you reach a form where substitution gives a definite value. For example, $\\lim_{x\\to 0} \\frac{e^x - 1 - x}{x^2}$ requires two applications: the first gives $\\frac{e^x - 1}{2x}$ (still $0/0$), and the second gives $\\frac{e^x}{2} \\to \\frac{1}{2}$.",
          "Before each application, always verify the form is still $0/0$ or $\\infty/\\infty$. If it isn't — for instance, if the denominator approaches a nonzero constant — stop and evaluate directly. Applying L'Hôpital to a non-indeterminate form produces wrong answers.",
          "For other indeterminate forms like $0 \\cdot \\infty$, $\\infty - \\infty$, $1^\\infty$, $0^0$, or $\\infty^0$, rewrite the expression into a $0/0$ or $\\infty/\\infty$ form first, then apply L'Hôpital.",
          "Example: for $\\lim_{x\\to 0^+} x\\ln x$ ($0 \\cdot (-\\infty)$ form), rewrite as $\\lim_{x\\to 0^+} \\frac{\\ln x}{1/x}$ ($-\\infty / \\infty$ form) and apply L'Hôpital.",
        ],
        eli5: [
          "The expression $0/0$ is called indeterminate because the ratio genuinely depends on context — the same symbol can represent limits equal to $0$, $7$, $\\infty$, or anything else. Direct substitution simply doesn't carry enough information to decide.",
          "L'Hôpital's Rule resolves this by shifting the question: instead of asking what the functions' values are (both zero), ask how quickly each function is approaching zero. The derivative measures exactly that rate of approach, so the ratio of derivatives captures the relationship that the original values obscured.",
          "When one application still gives $0/0$, it means the first-order rates also cancel — both functions approach zero at the same first-order speed. Applying the rule again compares second-order rates (curvature), and so on, until the rates finally differ enough to determine the limit.",
        ],
        examples: [
          {
            title: "Single application of L'Hôpital's Rule",
            steps: [
              "Compute $\\lim_{x\\to 0} \\frac{e^x - 1}{\\sin x}$.",
              "Direct substitution: $\\frac{e^0 - 1}{\\sin 0} = \\frac{0}{0}$. This is indeterminate, so L'Hôpital's Rule applies.",
              "Differentiate the numerator: $f'(x) = e^x$.",
              "Differentiate the denominator: $g'(x) = \\cos x$.",
              "The new limit is $\\lim_{x\\to 0} \\frac{e^x}{\\cos x}$.",
              "Check: substituting $x = 0$ gives $\\frac{e^0}{\\cos 0} = \\frac{1}{1} = 1$. This is no longer indeterminate, so we're done.",
              "The limit is $1$.",
            ],
          },
          {
            title: "Applying L'Hôpital's Rule multiple times",
            steps: [
              "Compute $\\lim_{x\\to 0} \\frac{x - \\sin x}{x^3}$.",
              "Direct substitution: $\\frac{0 - \\sin 0}{0^3} = \\frac{0}{0}$. Indeterminate — apply L'Hôpital's Rule.",
              "First application — differentiate top and bottom: $\\lim_{x\\to 0} \\frac{1 - \\cos x}{3x^2}$.",
              "Check the form: $\\frac{1 - \\cos 0}{3 \\cdot 0^2} = \\frac{0}{0}$. Still indeterminate — apply L'Hôpital again.",
              "Second application: $\\lim_{x\\to 0} \\frac{\\sin x}{6x}$.",
              "Check the form: $\\frac{\\sin 0}{6 \\cdot 0} = \\frac{0}{0}$. Still indeterminate — apply L'Hôpital a third time.",
              "Third application: $\\lim_{x\\to 0} \\frac{\\cos x}{6}$.",
              "Check: $\\frac{\\cos 0}{6} = \\frac{1}{6}$. This is a definite value — we stop here.",
              "The limit is $\\frac{1}{6}$. Each application peeled away one layer of cancellation between $x - \\sin x$ and $x^3$.",
            ],
          },
          {
            title: "Converting a 0 · ∞ form for L'Hôpital",
            steps: [
              "Compute $\\lim_{x\\to 0^+} x \\ln x$.",
              "As $x \\to 0^+$: $x \\to 0$ and $\\ln x \\to -\\infty$. This is a $0 \\cdot (-\\infty)$ form — L'Hôpital does not apply directly to products.",
              "Rewrite as a fraction: $x \\ln x = \\frac{\\ln x}{1/x}$. Now the numerator $\\ln x \\to -\\infty$ and the denominator $1/x \\to \\infty$, giving $-\\infty / \\infty$. L'Hôpital applies.",
              "Differentiate numerator: $\\frac{d}{dx} \\ln x = \\frac{1}{x}$.",
              "Differentiate denominator: $\\frac{d}{dx} (1/x) = -\\frac{1}{x^2}$.",
              "So $\\lim_{x\\to 0^+} \\frac{1/x}{-1/x^2} = \\lim_{x\\to 0^+} \\frac{x^2}{-x} = \\lim_{x\\to 0^+} (-x) = 0$.",
              "The limit is $0$. Even though $\\ln x \\to -\\infty$, the factor $x$ shrinks to zero fast enough to drive the product to $0$.",
            ],
          },
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Plugging in the value too early before simplifying an indeterminate form. Always check for $0/0$ or $\\infty/\\infty$ first.",
      "Concluding the limit does not exist just because $f(a)$ is undefined. The function not being defined at $a$ says nothing about the limit.",
      "Ignoring one-sided limits for piecewise functions and absolute values. You must check both sides.",
      "Confusing continuity with differentiability. Continuity means no jumps or holes; differentiability means no sharp corners either. $|x|$ is continuous at $0$ but not differentiable.",
      "Forgetting to cancel common factors before declaring a vertical asymptote. A common factor means a hole, not an asymptote.",
      "Using L'Hôpital's Rule when the form is not indeterminate. It only applies to $0/0$ or $\\infty/\\infty$.",
      "Applying the quotient rule instead of differentiating numerator and denominator separately in L'Hôpital's Rule.",
    ],
  },
  {
    topicId: "derivatives",
    title: "Derivatives",
    intro: [
      "The derivative of a function measures its instantaneous rate of change at any point. Geometrically, $f'(a)$ is the slope of the tangent line to $y = f(x)$ at $x = a$.",
      "Derivatives power every optimization problem, every physics equation involving rates, and every approximation method in applied math. If you understand derivatives deeply, the rest of calculus becomes much easier.",
      "The formal definition is $f'(a) = \\lim_{h\\to 0} \\frac{f(a+h)-f(a)}{h}$. This limit captures the idea of zooming in on a curve until it looks like a straight line, then measuring that line's slope.",
    ],
    sections: [
      {
        title: "The definition and what it means",
        body: [
          "The derivative $f'(x) = \\lim_{h\\to 0} \\frac{f(x+h)-f(x)}{h}$ is the limit of the difference quotient. The difference quotient $\\frac{f(x+h)-f(x)}{h}$ is the slope of a secant line through two nearby points on the graph of $f$.",
          "As $h\\to 0$, the secant line becomes the tangent line, and its slope becomes the derivative. This is the geometric heart of the derivative: zoom in far enough on any smooth curve and it looks like a straight line. The derivative measures the slope of that local line.",
          "If this limit exists at $x=a$, we say $f$ is differentiable at $a$. Differentiability implies continuity — if $f$ is differentiable at $a$, then $f$ is also continuous at $a$. The converse is false: $|x|$ is continuous at $0$ but not differentiable (it has a sharp corner where two lines meet at different slopes).",
          "Places where differentiability fails: sharp corners (like $|x|$), cusps (like $x^{2/3}$), vertical tangent lines (like $\\sqrt[3]{x}$ at $0$), and discontinuities. At all of these points, the limit of the difference quotient either doesn't exist or is infinite.",
        ],
        eli5: [
          "Imagine zooming in on a curve with a magnifying glass. The more you zoom, the more the curve looks like a straight line. The slope of that 'zoomed-in line' is the derivative.",
          "A sharp corner (like the tip of a V) can never be zoomed into a single straight line — from the left it looks like one slope, from the right a different slope. That's why corners don't have derivatives.",
        ],
        examples: [
          {
            title: "Computing a derivative from the definition",
            steps: [
              "Find $f'(x)$ for $f(x) = x^2 + 3x$ using the limit definition.",
              "$f'(x) = \\lim_{h\\to 0} \\frac{f(x+h) - f(x)}{h}$.",
              "Expand $f(x+h) = (x+h)^2 + 3(x+h) = x^2 + 2xh + h^2 + 3x + 3h$.",
              "Subtract $f(x)$: $f(x+h) - f(x) = 2xh + h^2 + 3h$.",
              "Divide by $h$: $\\frac{2xh + h^2 + 3h}{h} = 2x + h + 3$.",
              "Take the limit: $\\lim_{h\\to 0} (2x + h + 3) = 2x + 3$.",
              "So $f'(x) = 2x + 3$. This matches the power rule ($2x$) plus the derivative of $3x$ ($3$).",
            ],
          },
        ],
      },
      {
        title: "Core differentiation rules",
        body: [
          "Power rule: $\\frac{d}{dx} x^n = nx^{n-1}$ for any real number $n$. This works for negative and fractional exponents too: $\\frac{d}{dx} x^{-2} = -2x^{-3}$ and $\\frac{d}{dx} \\sqrt{x} = \\frac{1}{2\\sqrt{x}}$.",
          "Constant multiple rule: $\\frac{d}{dx}[cf(x)] = c f'(x)$. Constants pass through the derivative.",
          "Sum/difference rule: $\\frac{d}{dx}[f(x) \\pm g(x)] = f'(x) \\pm g'(x)$. Differentiate term by term.",
          "Constant rule: $\\frac{d}{dx}[c] = 0$. The derivative of any constant is zero.",
        ],
        examples: [
          {
            title: "Using the power rule on a polynomial",
            steps: [
              "Find $\\frac{d}{dx}(3x^4 - 5x^2 + 7x - 2)$.",
              "Apply the rules term by term: sum rule lets us differentiate each term separately, constant multiple rule pulls out the coefficients.",
              "First term: $\\frac{d}{dx}(3x^4) = 3 \\cdot 4x^3 = 12x^3$ (power rule: bring down the $4$, reduce exponent by $1$).",
              "Second term: $\\frac{d}{dx}(-5x^2) = -5 \\cdot 2x = -10x$.",
              "Third term: $\\frac{d}{dx}(7x) = 7 \\cdot 1 = 7$ (since $x = x^1$, power rule gives $1 \\cdot x^0 = 1$).",
              "Fourth term: $\\frac{d}{dx}(-2) = 0$ (constant rule).",
              "Combine: $\\frac{d}{dx}(3x^4 - 5x^2 + 7x - 2) = 12x^3 - 10x + 7$.",
            ],
          },
        ],
      },
      {
        title: "Derivatives of common functions",
        body: [
          "Exponentials: $\\frac{d}{dx} e^x = e^x$ — the defining property of $e$. No other function equals its own derivative. More generally, $\\frac{d}{dx} a^x = a^x \\ln a$ (the $\\ln a$ factor accounts for the base).",
          "Logarithms: $\\frac{d}{dx} \\ln x = \\frac{1}{x}$ for $x > 0$. This is why $\\ln x$ appears everywhere in integration — it's the antiderivative of $1/x$. More generally, $\\frac{d}{dx} \\log_a x = \\frac{1}{x \\ln a}$.",
          "Trigonometric: $\\frac{d}{dx} \\sin x = \\cos x$, $\\frac{d}{dx} \\cos x = -\\sin x$ (note the negative sign!), $\\frac{d}{dx} \\tan x = \\sec^2 x$.",
          "More trig: $\\frac{d}{dx} \\sec x = \\sec x \\tan x$, $\\frac{d}{dx} \\csc x = -\\csc x \\cot x$, $\\frac{d}{dx} \\cot x = -\\csc^2 x$. Notice the pattern: the 'co-' functions ($\\cos$, $\\csc$, $\\cot$) always pick up a negative sign.",
          "These formulas are non-negotiable — they must be committed to memory. Every more complex derivative ultimately reduces to combinations of these through the product, quotient, and chain rules.",
        ],
        eli5: [
          "Think of these as the 'vocabulary words' of calculus. Just like you can't write sentences without knowing words, you can't compute derivatives without knowing these basic building blocks. The rules (product, quotient, chain) are the grammar; these formulas are the words.",
          "The pattern to notice: trig derivatives cycle — $\\sin \\to \\cos \\to -\\sin \\to -\\cos \\to \\sin \\to \\ldots$. And the 'co-' functions always introduce an extra negative sign.",
        ],
      },
      {
        title: "Product rule",
        body: [
          "When two functions are multiplied: $(fg)' = f'g + fg'$.",
          "Think of it as: \"derivative of the first times the second, plus the first times the derivative of the second.\"",
          "Example: $\\frac{d}{dx}[x^2 \\sin x] = 2x \\sin x + x^2 \\cos x$.",
          "Tip: always check if you can simplify the expression first. Sometimes you don't need the product rule at all.",
        ],
        examples: [
          {
            title: "Product rule with exponential and polynomial",
            steps: [
              "Find $\\frac{d}{dx}[x^3 e^x]$.",
              "Identify the two functions: $f(x) = x^3$ and $g(x) = e^x$.",
              "Find each derivative: $f'(x) = 3x^2$ and $g'(x) = e^x$.",
              "Apply the product rule: $(fg)' = f'g + fg' = 3x^2 \\cdot e^x + x^3 \\cdot e^x$.",
              "Factor out common terms: $e^x(3x^2 + x^3) = x^2 e^x(3 + x)$.",
              "Final answer: $\\frac{d}{dx}[x^3 e^x] = x^2 e^x(x + 3)$.",
            ],
          },
        ],
      },
      {
        title: "Quotient rule",
        body: [
          "For a ratio of functions: $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$. The order matters — it's $f'g$ first, then subtract $fg'$.",
          "Memory aid: \"low d-high minus high d-low, over the square of what's below.\" Here 'high' is the numerator $f$, 'low' is the denominator $g$, and 'd-' means 'derivative of.'",
          "Alternative: you can often rewrite $f/g$ as $f \\cdot g^{-1}$ and use the product rule with the chain rule instead. For simple denominators, sometimes pure algebra avoids the quotient rule entirely.",
          "When to definitely use the quotient rule: when the denominator is a non-trivial function (like $\\cos x$, $e^x + 1$, etc.) and rewriting would be messier than just applying the formula.",
        ],
        examples: [
          {
            title: "Quotient rule with trigonometric functions",
            steps: [
              "Find $\\frac{d}{dx}\\frac{x^2}{\\cos x}$.",
              "Identify: $f = x^2$, $g = \\cos x$, $f' = 2x$, $g' = -\\sin x$.",
              "Apply the formula: $\\frac{f'g - fg'}{g^2} = \\frac{2x \\cos x - x^2(-\\sin x)}{\\cos^2 x}$.",
              "Simplify: $\\frac{2x\\cos x + x^2\\sin x}{\\cos^2 x}$.",
              "Factor: $\\frac{x(2\\cos x + x\\sin x)}{\\cos^2 x}$.",
            ],
          },
        ],
      },
      {
        title: "Chain rule",
        body: [
          "The chain rule handles compositions: if $y = f(g(x))$, then $\\frac{dy}{dx} = f'(g(x)) \\cdot g'(x)$.",
          "In words: derivative of the outer function (evaluated at the inner function) times the derivative of the inner function.",
          "Example: $\\frac{d}{dx} \\sin(x^3) = \\cos(x^3) \\cdot 3x^2$. The outer function is $\\sin$, the inner function is $x^3$.",
          "Nested chains: for $e^{\\sin(x^2)}$, apply the chain rule twice: $e^{\\sin(x^2)} \\cdot \\cos(x^2) \\cdot 2x$.",
          "The chain rule is arguably the most important rule. It appears everywhere: in implicit differentiation, related rates, and integration by substitution.",
        ],
        examples: [
          {
            title: "Chain rule with a nested composition",
            steps: [
              "Find $\\frac{d}{dx} \\ln(\\cos x)$.",
              "Identify the outer and inner functions. Outer: $\\ln(u)$ where $u = \\cos x$. Inner: $\\cos x$.",
              "Derivative of the outer function: $\\frac{d}{du} \\ln u = \\frac{1}{u}$, evaluated at $u = \\cos x$ gives $\\frac{1}{\\cos x}$.",
              "Derivative of the inner function: $\\frac{d}{dx} \\cos x = -\\sin x$.",
              "Multiply them (chain rule): $\\frac{1}{\\cos x} \\cdot (-\\sin x) = -\\frac{\\sin x}{\\cos x} = -\\tan x$.",
              "Final answer: $\\frac{d}{dx} \\ln(\\cos x) = -\\tan x$.",
            ],
          },
          {
            title: "Double chain rule",
            steps: [
              "Find $\\frac{d}{dx} e^{\\sin(x^2)}$.",
              "There are three nested layers: $e^{(\\cdot)}$, then $\\sin(\\cdot)$, then $x^2$. We peel them off one at a time.",
              "Outermost layer: $\\frac{d}{du} e^u = e^u$, evaluated at $u = \\sin(x^2)$ gives $e^{\\sin(x^2)}$.",
              "Middle layer: $\\frac{d}{dv} \\sin v = \\cos v$, evaluated at $v = x^2$ gives $\\cos(x^2)$.",
              "Innermost layer: $\\frac{d}{dx} x^2 = 2x$.",
              "Multiply all three together: $e^{\\sin(x^2)} \\cdot \\cos(x^2) \\cdot 2x$.",
              "Final answer: $\\frac{d}{dx} e^{\\sin(x^2)} = 2x \\cos(x^2)\\, e^{\\sin(x^2)}$.",
            ],
          },
        ],
        eli5: [
          "Imagine a machine with two gears connected together. The big gear turns the small gear. If you want to know how fast the final output changes, you need to know two things: how fast the big gear turns the small gear, and how fast the small gear turns on its own.",
          "That's the chain rule. If you have a function inside another function (like $\\sin$ of $x^3$), the rate of change of the whole thing is: how fast the outer part changes × how fast the inner part changes.",
          "A real-world example: temperature affects ice cream sales, and ice cream sales affect your revenue. If temperature goes up by 1°, sales go up by 50 cones, and each cone gives you \\$3, then your revenue goes up by $50 \\times 3 = 150$ dollars per degree. You multiplied the two rates together — that's the chain rule.",
        ],
      },
      {
        title: "Inverse trigonometric derivatives",
        body: [
          "$\\frac{d}{dx} \\arcsin x = \\frac{1}{\\sqrt{1-x^2}}$, valid for $|x| < 1$. The domain restriction comes from the original function: $\\arcsin$ only takes inputs between $-1$ and $1$.",
          "$\\frac{d}{dx} \\arccos x = -\\frac{1}{\\sqrt{1-x^2}}$. Notice this is exactly the negative of $\\arcsin$'s derivative. This makes sense because $\\arcsin x + \\arccos x = \\pi/2$ (they always add to a right angle), so their derivatives must be negatives of each other.",
          "$\\frac{d}{dx} \\arctan x = \\frac{1}{1+x^2}$. This is the most commonly used inverse trig derivative. It appears constantly in integration (the antiderivative of $\\frac{1}{1+x^2}$ is $\\arctan x + C$).",
          "With the chain rule: $\\frac{d}{dx} \\arctan(g(x)) = \\frac{g'(x)}{1+[g(x)]^2}$. For example, $\\frac{d}{dx} \\arctan(3x) = \\frac{3}{1+9x^2}$.",
          "Where these come from: use implicit differentiation. If $y = \\arcsin x$, then $\\sin y = x$. Differentiate: $\\cos y \\cdot y' = 1$, so $y' = 1/\\cos y = 1/\\sqrt{1-\\sin^2 y} = 1/\\sqrt{1-x^2}$.",
        ],
        eli5: [
          "Inverse trig functions answer questions like: 'What angle has a sine of $0.5$?' The derivative tells you how sensitive that angle is to small changes in the input value.",
          "The square-root expressions ($\\sqrt{1-x^2}$, $1+x^2$) come from the Pythagorean theorem. When you 'unwrap' the inverse function using a right triangle, the missing side gives you the derivative.",
        ],
        examples: [
          {
            title: "Inverse trig derivative with the chain rule",
            steps: [
              "Find $\\frac{d}{dx} \\arcsin(x^2)$.",
              "Use the chain rule: outer function is $\\arcsin(u)$ with $u = x^2$.",
              "Derivative of outer: $\\frac{1}{\\sqrt{1-u^2}}$ evaluated at $u = x^2$ gives $\\frac{1}{\\sqrt{1-x^4}}$.",
              "Derivative of inner: $\\frac{d}{dx}(x^2) = 2x$.",
              "Multiply: $\\frac{d}{dx} \\arcsin(x^2) = \\frac{2x}{\\sqrt{1-x^4}}$.",
              "Domain: requires $|x^2| < 1$, i.e., $|x| < 1$.",
            ],
          },
        ],
      },
      {
        title: "Implicit differentiation",
        body: [
          "When $y$ is defined implicitly by an equation like $x^2 + y^2 = 25$, differentiate both sides with respect to $x$.",
          "Every time you differentiate a $y$ term, attach a $\\frac{dy}{dx}$ factor (this is the chain rule in action: $y$ is a function of $x$).",
          "Example: differentiate $x^2 + y^2 = 25$ to get $2x + 2y\\frac{dy}{dx} = 0$, then solve $\\frac{dy}{dx} = -\\frac{x}{y}$.",
          "Implicit differentiation is essential for curves that can't be written as $y = f(x)$, such as circles, ellipses, and other relations.",
        ],
        examples: [
          {
            title: "Implicit differentiation of a circle",
            steps: [
              "Find $\\frac{dy}{dx}$ for $x^2 + y^2 = 25$.",
              "Differentiate both sides with respect to $x$. Remember: $y$ is a function of $x$, so we must use the chain rule on $y$ terms.",
              "Left side: $\\frac{d}{dx}(x^2) + \\frac{d}{dx}(y^2) = 2x + 2y \\frac{dy}{dx}$.",
              "The $2y \\frac{dy}{dx}$ came from the chain rule: $\\frac{d}{dx}(y^2) = 2y \\cdot \\frac{dy}{dx}$.",
              "Right side: $\\frac{d}{dx}(25) = 0$.",
              "So: $2x + 2y \\frac{dy}{dx} = 0$.",
              "Solve for $\\frac{dy}{dx}$: $2y\\frac{dy}{dx} = -2x$, therefore $\\frac{dy}{dx} = -\\frac{x}{y}$.",
              "At the point $(3, 4)$ on the circle: $\\frac{dy}{dx} = -\\frac{3}{4}$. This makes geometric sense — the tangent line at $(3,4)$ on a circle centered at the origin should slope downward to the right.",
            ],
          },
        ],
        eli5: [
          "Usually, you have a nice equation like $y = x^2 + 3$ where $y$ is alone on one side. But sometimes $x$ and $y$ are tangled together, like in $x^2 + y^2 = 25$ (a circle). You can't easily solve for $y$.",
          "Implicit differentiation says: just differentiate everything with respect to $x$ anyway. Whenever you hit a $y$, remember that $y$ secretly depends on $x$, so slap on a $\\frac{dy}{dx}$ (that's just the chain rule). Then solve for $\\frac{dy}{dx}$.",
          "It's like a detective figuring out how fast a hidden variable changes by looking at the equation it's trapped in.",
        ],
      },
      {
        title: "Logarithmic differentiation",
        body: [
          "For complicated products, quotients, or expressions where the variable appears in both the base and exponent (like $x^x$), take the natural log of both sides first, then differentiate implicitly.",
          "Why it works: $\\ln$ converts products into sums ($\\ln(fg) = \\ln f + \\ln g$), quotients into differences ($\\ln(f/g) = \\ln f - \\ln g$), and powers into products ($\\ln(f^g) = g \\ln f$). These are all easier to differentiate.",
          "The procedure: let $y = f(x)$, take $\\ln$ of both sides, simplify using log properties, differentiate implicitly ($\\frac{1}{y} \\frac{dy}{dx} = \\ldots$), then solve for $\\frac{dy}{dx}$ by multiplying both sides by $y$.",
          "This is the only way to differentiate variable-base, variable-exponent expressions like $x^{\\sin x}$ or $(\\ln x)^x$. Neither the power rule nor the exponential rule applies when both the base and exponent depend on $x$.",
        ],
        eli5: [
          "Some expressions are like nested puzzles — the variable is both the base and the exponent, so no single rule works. Logarithmic differentiation is like taking the puzzle apart first. The logarithm untangles the messy structure into simple pieces that you know how to differentiate, and then you put the answer back together.",
        ],
        examples: [
          {
            title: "Logarithmic differentiation of $x^x$",
            steps: [
              "Find $\\frac{d}{dx} x^x$ for $x > 0$.",
              "Let $y = x^x$. Take $\\ln$ of both sides: $\\ln y = x \\ln x$.",
              "Differentiate both sides with respect to $x$. Left side: $\\frac{1}{y}\\frac{dy}{dx}$ (chain rule on $\\ln y$).",
              "Right side: product rule on $x \\ln x$: $1 \\cdot \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1$.",
              "So $\\frac{1}{y}\\frac{dy}{dx} = \\ln x + 1$.",
              "Multiply both sides by $y = x^x$: $\\frac{dy}{dx} = x^x(\\ln x + 1)$.",
              "Note: $x^x$ is only defined for $x > 0$, and the derivative is zero when $\\ln x = -1$, i.e., $x = 1/e$.",
            ],
          },
        ],
      },
      {
        title: "Higher-order derivatives",
        body: [
          "The second derivative $f''(x)$ is the derivative of $f'(x)$. It measures how the rate of change itself is changing — the 'rate of the rate.'",
          "Notation: $f''(x)$, $\\frac{d^2y}{dx^2}$, or $y''$. For higher orders: $f'''(x)$, $f^{(4)}(x)$, etc. The notation $\\frac{d^2y}{dx^2}$ reminds you that you're applying $\\frac{d}{dx}$ twice.",
          "Physical meaning: if $s(t)$ is position, then $s'(t)$ is velocity (how fast position changes) and $s''(t)$ is acceleration (how fast velocity changes). A car accelerating has positive $s''$; a car braking has negative $s''$.",
          "The second derivative tells you about concavity: $f''(x) > 0$ means concave up (the curve bends upward, like a bowl), $f''(x) < 0$ means concave down (bends downward, like a hill). This is central to the second derivative test for classifying extrema.",
          "Higher-order derivatives appear in Taylor series: the $n$th coefficient uses $f^{(n)}(a)$, letting you approximate any smooth function with a polynomial. Some functions (like $e^x$ and $\\sin x$) have patterns in their higher derivatives that make the Taylor series elegant.",
        ],
        eli5: [
          "The first derivative tells you speed — how fast the function is changing. The second derivative tells you acceleration — is the change itself speeding up or slowing down?",
          "When you drive a car: position → velocity (first derivative, how fast you're going) → acceleration (second derivative, are you pressing the gas or the brake?). The third derivative is sometimes called 'jerk' — how suddenly you slam the gas pedal.",
        ],
        examples: [
          {
            title: "Computing higher-order derivatives",
            steps: [
              "Find $f''(x)$ for $f(x) = x^4 - 3x^2 + 5x$.",
              "First derivative: $f'(x) = 4x^3 - 6x + 5$.",
              "Second derivative: $f''(x) = 12x^2 - 6$.",
              "Third derivative: $f'''(x) = 24x$.",
              "Fourth derivative: $f^{(4)}(x) = 24$.",
              "Fifth and beyond: $f^{(n)}(x) = 0$ for $n \\geq 5$. Any polynomial of degree $n$ has all derivatives beyond the $n$th equal to zero.",
            ],
          },
        ],
      },
      {
        title: "Tangent lines and linearization",
        body: [
          "The tangent line to $f$ at $x = a$ is: $y = f(a) + f'(a)(x - a)$. This is the best linear approximation near $a$.",
          "Linearization: $f(x) \\approx f(a) + f'(a)(x-a)$ for $x$ close to $a$. This is incredibly useful for quick estimates.",
          "Example: approximate $\\sqrt{4.1}$. Use $f(x) = \\sqrt{x}$ at $a = 4$: $f'(x) = \\frac{1}{2\\sqrt{x}}$, $f'(4) = \\frac{1}{4}$.",
          "Linearization gives $\\sqrt{4.1} \\approx 2 + \\frac{1}{4}(0.1) = 2.025$. The actual value is $2.02485...$, very close!",
          "Differentials: $dy = f'(x)\\,dx$ gives the approximate change in $y$ for a small change $dx$ in $x$.",
        ],
      },
      {
        title: "Interpreting the derivative graphically",
        body: [
          "$f'(x) > 0$ on an interval means $f$ is increasing (going uphill) there. $f'(x) < 0$ means $f$ is decreasing (going downhill). The magnitude $|f'(x)|$ tells you how steep the slope is.",
          "Where $f'(x) = 0$, the tangent line is horizontal. These are critical points — candidates for local maxima, local minima, or inflection points.",
          "The sign of $f'$ changing from $+$ to $-$ at a critical point signals a local maximum (function goes up then down). From $-$ to $+$ signals a local minimum (down then up). If $f'$ doesn't change sign, the critical point is neither (e.g., $f(x)=x^3$ at $x=0$ — the function flattens momentarily but keeps going in the same direction).",
          "Reading $f'$'s graph to understand $f$: where $f'$ is above the $x$-axis, $f$ is climbing. Where $f'$ is below, $f$ is falling. The $x$-intercepts of $f'$ correspond to the peaks and valleys (or flat inflection points) of $f$. The higher $|f'|$ is, the steeper $f$ is at that point.",
          "You can also go the other way: given the graph of $f$, sketch $f'$ by estimating the slope at various points. Steep uphill = large positive $f'$; flat = $f'$ near zero; steep downhill = large negative $f'$.",
        ],
        eli5: [
          "The derivative's graph is like a 'steepness report' for the original function. Wherever the report says positive, the original function is climbing uphill. Wherever it says negative, it's going downhill. Wherever the report crosses zero, the original function has a flat moment — a hilltop, a valley, or a brief rest.",
          "If you've ever seen a trail elevation profile (height vs. distance), the derivative is the steepness at each point along the trail. Positive = uphill, negative = downhill, zero = flat.",
        ],
      },
      {
        title: "Hyperbolic functions and their derivatives",
        body: [
          "The hyperbolic functions are built from exponentials: $\\sinh x = \\frac{e^x - e^{-x}}{2}$ and $\\cosh x = \\frac{e^x + e^{-x}}{2}$.",
          "They satisfy $\\cosh^2 x - \\sinh^2 x = 1$ (compare with $\\cos^2 x + \\sin^2 x = 1$ for trig).",
          "Derivatives mirror trig but without the sign changes: $\\frac{d}{dx} \\sinh x = \\cosh x$ and $\\frac{d}{dx} \\cosh x = \\sinh x$.",
          "Also: $\\frac{d}{dx} \\tanh x = \\text{sech}^2 x$ where $\\tanh x = \\sinh x / \\cosh x$.",
          "Inverse hyperbolics have logarithmic forms: $\\sinh^{-1} x = \\ln(x + \\sqrt{x^2+1})$, and their derivatives produce the expressions $\\frac{1}{\\sqrt{x^2+1}}$ and $\\frac{1}{\\sqrt{x^2-1}}$ that appear in integration.",
          "Applications: catenary curves (hanging chains/cables obey $y = a\\cosh(x/a)$), special relativity (rapidity), and certain differential equations.",
        ],
        examples: [
          {
            title: "Differentiating a hyperbolic composition",
            steps: [
              "Find $\\frac{d}{dx} \\cosh(3x^2)$.",
              "This is a composition: outer function is $\\cosh(u)$ with $u = 3x^2$.",
              "Derivative of the outer: $\\frac{d}{du} \\cosh u = \\sinh u$, evaluated at $u = 3x^2$ gives $\\sinh(3x^2)$.",
              "Derivative of the inner: $\\frac{d}{dx}(3x^2) = 6x$.",
              "By the chain rule: $\\frac{d}{dx} \\cosh(3x^2) = 6x\\sinh(3x^2)$.",
            ],
          },
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting the inner derivative in the chain rule. This is the single most common error. Always ask: is there a function inside another function?",
      "Applying the power rule to $e^x$. The derivative of $e^x$ is $e^x$, not $xe^{x-1}$. The power rule is for $x^n$, not $n^x$.",
      "In implicit differentiation, forgetting to multiply by $\\frac{dy}{dx}$ whenever you differentiate a $y$ term.",
      "Using the quotient rule when simple algebra would work. For instance, $\\frac{x^3}{x} = x^2$ is easier to differentiate directly.",
      "Confusing the derivative of $\\ln(f(x))$ with $\\frac{1}{f(x)}$. The correct answer is $\\frac{f'(x)}{f(x)}$ by the chain rule.",
      "Getting signs wrong on trig derivatives: $\\cos x$ differentiates to $-\\sin x$ (not $+\\sin x$).",
      "Assuming differentiability implies smoothness everywhere. A function can be continuous but not differentiable at corners, cusps, or vertical tangents.",
    ],
  },
  {
    topicId: "integrals",
    title: "Integrals",
    intro: [
      "Integration is the reverse of differentiation. Where derivatives break things apart to measure rates, integrals put things together to measure totals.",
      "The integral $\\int_a^b f(x)\\,dx$ gives the net area between the curve $y=f(x)$ and the $x$-axis from $x=a$ to $x=b$. But integrals are far more than area: they compute distance, work, probability, volume, and any accumulated quantity.",
      "Mastering integration requires two skills: knowing the antiderivative formulas and knowing the techniques to transform difficult integrals into ones you can solve.",
    ],
    sections: [
      {
        title: "The big idea: Riemann sums",
        body: [
          "Divide the interval $[a,b]$ into $n$ thin strips of width $\\Delta x = (b-a)/n$. In each strip, build a rectangle with height $f(x_i)$.",
          "The total area of all rectangles is approximately $\\sum_{i=1}^{n} f(x_i)\\Delta x$. This is a Riemann sum.",
          "As $n \\to \\infty$ (strips get infinitely thin), the Riemann sum converges to the definite integral: $\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty} \\sum_{i=1}^{n} f(x_i)\\Delta x$.",
          "This is why integrals represent accumulation: you are adding up infinitely many infinitesimally small contributions.",
        ],
        examples: [
          {
            title: "Setting up a Riemann sum",
            steps: [
              "Estimate $\\int_0^2 x^2\\,dx$ using a right Riemann sum with $n = 4$ rectangles.",
              "Width of each rectangle: $\\Delta x = \\frac{2-0}{4} = 0.5$.",
              "Right endpoints: $x_1 = 0.5,\\; x_2 = 1.0,\\; x_3 = 1.5,\\; x_4 = 2.0$.",
              "Heights: $f(0.5) = 0.25,\\; f(1) = 1,\\; f(1.5) = 2.25,\\; f(2) = 4$.",
              "Sum: $0.25(0.5) + 1(0.5) + 2.25(0.5) + 4(0.5) = 0.125 + 0.5 + 1.125 + 2 = 3.75$.",
              "The exact answer (using the FTC) is $\\frac{x^3}{3}\\Big|_0^2 = \\frac{8}{3} \\approx 2.667$. Our overestimate of $3.75$ comes from the right endpoints overshooting on an increasing function. With more rectangles, the estimate converges to $\\frac{8}{3}$.",
            ],
          },
        ],
      },
      {
        title: "The Fundamental Theorem of Calculus (FTC)",
        body: [
          "FTC Part 1: if $F(x) = \\int_a^x f(t)\\,dt$, then $F'(x) = f(x)$. Differentiation and integration are inverse operations.",
          "FTC Part 2: $\\int_a^b f(x)\\,dx = F(b) - F(a)$ where $F$ is any antiderivative of $f$ (meaning $F'=f$).",
          "Part 2 is the computational powerhouse: instead of computing limits of Riemann sums, just find an antiderivative and evaluate at the bounds.",
          "The connection to derivatives: if position is $s(t)$ and velocity is $v(t) = s'(t)$, then total displacement is $\\int_a^b v(t)\\,dt = s(b) - s(a)$. Integration recovers position from velocity.",
        ],
        eli5: [
          "Imagine you're on a road trip. Your speedometer tells you how fast you're going at each moment (that's the derivative — the rate). The odometer tells you the total distance you've covered (that's the integral — the accumulation).",
          "The FTC says: if you know the speedometer reading at every moment, you can figure out the total distance by 'adding up' all those tiny speeds. And the shortcut is: just check the odometer at the start and end, and subtract.",
          "That's why it's called the Fundamental Theorem — it connects the two main ideas in all of calculus (rates and totals) and gives you a shortcut so you never have to actually add up infinitely many tiny rectangles.",
        ],
        examples: [
          {
            title: "Evaluating a definite integral with the FTC",
            steps: [
              "Compute $\\int_1^3 (2x + 1)\\,dx$.",
              "Step 1 — find an antiderivative: $\\int (2x+1)\\,dx = x^2 + x + C$. (We don't need the $C$ for definite integrals.)",
              "Step 2 — evaluate at the bounds using FTC Part 2: $F(x) = x^2 + x$.",
              "$F(3) = 9 + 3 = 12$.",
              "$F(1) = 1 + 1 = 2$.",
              "$\\int_1^3 (2x+1)\\,dx = F(3) - F(1) = 12 - 2 = 10$.",
              "This is the net area under the line $y = 2x+1$ from $x=1$ to $x=3$. Since $2x+1 > 0$ on this interval, the net area equals the total area.",
            ],
          },
        ],
      },
      {
        title: "Net area vs. total area",
        body: [
          "The definite integral $\\int_a^b f(x)\\,dx$ computes net (signed) area: regions where $f(x) > 0$ (above the $x$-axis) contribute positively, and regions where $f(x) < 0$ (below the $x$-axis) contribute negatively. Positive and negative areas can cancel.",
          "If you want total area (always positive, no cancellation), integrate the absolute value: $\\int_a^b |f(x)|\\,dx$.",
          "In practice, find where $f(x) = 0$ (the zeros), split the integral at those zeros, and negate the integral on sub-intervals where $f < 0$. This turns every piece positive before adding.",
          "Example: $\\int_0^{2\\pi} \\sin x\\,dx = 0$ because the positive area on $[0,\\pi]$ exactly cancels the negative area on $[\\pi,2\\pi]$. But the total area is $\\int_0^\\pi \\sin x\\,dx + \\int_\\pi^{2\\pi} |\\sin x|\\,dx = 2 + 2 = 4$.",
          "Physical analogy: if velocity is positive (forward) for a while and then negative (backward), the integral of velocity gives displacement (net distance from start), which could be small or zero. The integral of $|v|$ gives total distance traveled.",
        ],
        eli5: [
          "Think of a bank account. Deposits are positive, withdrawals are negative. The net integral is your final balance — deposits and withdrawals cancel out. The total area integral is like adding up every transaction's absolute value — the total amount of money that moved, ignoring direction.",
        ],
      },
      {
        title: "Antiderivatives and the constant of integration",
        body: [
          "An antiderivative of $f(x)$ is any function $F(x)$ such that $F'(x) = f(x)$. The indefinite integral $\\int f(x)\\,dx$ represents the entire family of antiderivatives.",
          "Since the derivative of a constant is $0$, any two antiderivatives of the same function differ by a constant: if $F'(x) = f(x)$ and $G'(x) = f(x)$, then $F(x) - G(x) = C$ for some constant. That's why every indefinite integral includes $+C$.",
          "The $+C$ is not a formality — it's essential. In applications, the value of $C$ is determined by an initial condition. For instance, if an object has velocity $v(t) = 3t^2$ and position $s(0) = 5$, then $s(t) = t^3 + C$ and $s(0) = C = 5$, so $s(t) = t^3 + 5$. Without $+C$, you'd get $s(t) = t^3$ and miss that the object started at position 5.",
          "On definite integrals, the $+C$ cancels: $F(b) + C - (F(a) + C) = F(b) - F(a)$. So you only need $+C$ for indefinite integrals.",
        ],
        eli5: [
          "Imagine you know a car's speed at every moment, and you want to figure out where it is. You can compute the position function from the speed, but you don't know where the car started. The $+C$ is that unknown starting position. Different starting positions give different position functions, but they all have the same speed.",
        ],
      },
      {
        title: "Common integrals (your core toolbox)",
        body: [
          "These are the integral formulas you must know by heart. Every other technique (substitution, by-parts, etc.) ultimately reduces an integral to one of these:",
          "Power rule: $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$ for $n \\neq -1$. Works for any real $n$ — including negative and fractional exponents like $\\int x^{-3}\\,dx$ or $\\int \\sqrt{x}\\,dx = \\int x^{1/2}\\,dx$.",
          "The missing case: $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$. The power rule gives $\\frac{x^0}{0}$, which is undefined, so $\\ln|x|$ fills this gap. The absolute value is needed because $\\ln$ requires a positive input.",
          "Exponentials: $\\int e^x\\,dx = e^x + C$ and $\\int a^x\\,dx = \\frac{a^x}{\\ln a} + C$ for $a > 0, a \\neq 1$.",
          "Trigonometric: $\\int \\sin x\\,dx = -\\cos x + C$, $\\int \\cos x\\,dx = \\sin x + C$, $\\int \\sec^2 x\\,dx = \\tan x + C$, $\\int \\csc^2 x\\,dx = -\\cot x + C$, $\\int \\sec x \\tan x\\,dx = \\sec x + C$, $\\int \\csc x \\cot x\\,dx = -\\csc x + C$.",
          "Inverse trig: $\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x + C$ and $\\int \\frac{1}{1+x^2}\\,dx = \\arctan x + C$. These arise constantly after trig substitutions and partial fractions.",
          "Verification: you can always check an antiderivative by differentiating it. If $\\frac{d}{dx} F(x) = f(x)$, then $\\int f(x)\\,dx = F(x) + C$.",
        ],
        eli5: [
          "These formulas are the answers to the question: 'What function has this as its derivative?' You're running the derivative process backward. Since you memorized the derivative table, just reverse it: the derivative of $\\sin x$ is $\\cos x$, so the integral of $\\cos x$ is $\\sin x + C$.",
          "If you ever forget a formula, just differentiate your guess. If it gives back the integrand, you're correct.",
        ],
      },
      {
        title: "Substitution (reverse chain rule)",
        body: [
          "If the integrand looks like $f(g(x)) \\cdot g'(x)$, substitute $u = g(x)$ so $du = g'(x)\\,dx$.",
          "The integral becomes $\\int f(u)\\,du$, which is usually simpler.",
          "Example: $\\int 2x \\cos(x^2)\\,dx$. Let $u = x^2$, $du = 2x\\,dx$. Integral becomes $\\int \\cos u\\,du = \\sin u + C = \\sin(x^2) + C$.",
          "For definite integrals, either convert the bounds to $u$-values, or back-substitute and use the original bounds.",
          "Tip: look for an \"inner function\" whose derivative (or a constant multiple of it) appears as a factor in the integrand.",
        ],
        eli5: [
          "Substitution is like changing languages to make a sentence easier to read. The math looks complicated in $x$-language, so you switch to $u$-language where it's simpler.",
          "The trick is spotting the 'inside function.' Look at your integral and ask: is there a function stuffed inside another function? If yes, call the inside part $u$. If the derivative of that inside part is also floating around in the integral, you're golden — everything converts cleanly to $u$.",
          "When you're done integrating in $u$-land, just swap back to $x$. It's like translating your answer back to the original language.",
        ],
        examples: [
          {
            title: "u-substitution with a definite integral",
            steps: [
              "Compute $\\int_0^1 2x(x^2 + 1)^3\\,dx$.",
              "Spot the pattern: the inner function is $x^2 + 1$ and its derivative $2x$ appears as a factor. Perfect for substitution.",
              "Let $u = x^2 + 1$, so $du = 2x\\,dx$. The $2x\\,dx$ in the integral is exactly $du$.",
              "Convert the bounds: when $x=0$, $u = 0+1 = 1$. When $x=1$, $u = 1+1 = 2$.",
              "The integral becomes $\\int_1^2 u^3\\,du$.",
              "Integrate: $\\frac{u^4}{4}\\Big|_1^2 = \\frac{16}{4} - \\frac{1}{4} = 4 - 0.25 = \\frac{15}{4}$.",
              "Final answer: $\\frac{15}{4}$. No need to back-substitute since we converted the bounds.",
            ],
          },
        ],
      },
      {
        title: "Integration by parts (reverse product rule)",
        body: [
          "Formula: $\\int u\\,dv = uv - \\int v\\,du$. This comes from the product rule run backwards.",
          "Choose $u$ and $dv$ using the LIATE heuristic: Logarithms, Inverse trig, Algebraic ($x^n$), Trig, Exponentials. Pick $u$ from higher in this list.",
          "Example: $\\int x e^x\\,dx$. Let $u = x$ (algebraic), $dv = e^x\\,dx$. Then $du = dx$, $v = e^x$.",
          "Result: $x e^x - \\int e^x\\,dx = x e^x - e^x + C = e^x(x-1) + C$.",
          "Sometimes you need to apply by-parts twice (e.g., $\\int x^2 e^x\\,dx$) or use the tabular method for repeated applications.",
          "A special case: $\\int e^x \\sin x\\,dx$ requires by-parts twice, then solving for the integral algebraically.",
        ],
        eli5: [
          "Imagine you're trying to find the area of a weird shape made by two things multiplied together. You can't handle both at once, so you break the job into pieces.",
          "The idea: pick one part to differentiate (make simpler) and the other to integrate. You do one step of the problem, and in exchange, the remaining integral becomes easier. It's like trading a hard problem for an easier one.",
          "The LIATE trick tells you which part to pick as $u$: Logs first, then Inverse trig, Algebra ($x$, $x^2$), Trig, and Exponentials last. Pick $u$ from higher in the list because those get simpler when you differentiate them.",
        ],
        examples: [
          {
            title: "Integration by parts: x·sin(x)",
            steps: [
              "Compute $\\int x \\sin x\\,dx$.",
              "We have a product of algebraic ($x$) and trig ($\\sin x$). By LIATE, pick $u = x$ (algebraic is above trig).",
              "Set $u = x$ and $dv = \\sin x\\,dx$.",
              "Differentiate $u$: $du = dx$. Integrate $dv$: $v = -\\cos x$.",
              "Apply the formula $\\int u\\,dv = uv - \\int v\\,du$:",
              "$\\int x \\sin x\\,dx = x(-\\cos x) - \\int (-\\cos x)\\,dx = -x\\cos x + \\int \\cos x\\,dx$.",
              "The remaining integral is easy: $\\int \\cos x\\,dx = \\sin x + C$.",
              "Final answer: $\\int x \\sin x\\,dx = -x\\cos x + \\sin x + C$.",
              "Check: differentiate $-x\\cos x + \\sin x$ using the product rule on the first term: $-\\cos x + x\\sin x + \\cos x = x\\sin x$. Correct!",
            ],
          },
        ],
      },
      {
        title: "Trigonometric integrals",
        body: [
          "Integrals of the form $\\int \\sin^m x \\cos^n x\\,dx$ come up constantly and have a systematic strategy based on whether $m$ and $n$ are odd or even.",
          "Case 1 — one power is odd: peel off one factor of the odd-powered function, convert the remaining even power using $\\sin^2 x + \\cos^2 x = 1$, and substitute with $u$ = the other function. Example: $\\int \\cos^3 x\\,dx$. Peel: $\\int \\cos^2 x \\cdot \\cos x\\,dx = \\int(1-\\sin^2 x)\\cos x\\,dx$. Let $u = \\sin x$: $\\int(1-u^2)\\,du = u - u^3/3 + C = \\sin x - \\frac{\\sin^3 x}{3} + C$.",
          "Case 2 — both powers are even: use half-angle identities to reduce. $\\sin^2 x = \\frac{1-\\cos(2x)}{2}$ and $\\cos^2 x = \\frac{1+\\cos(2x)}{2}$. Repeat as needed. These can be tedious but are completely mechanical.",
          "Other trig integrals: $\\int \\tan^n x\\,dx$ and $\\int \\sec^n x\\,dx$ have their own patterns. For $\\tan$, peel off $\\tan^2 x = \\sec^2 x - 1$ and reduce. For $\\sec$, use integration by parts or reduction formulas.",
          "Key results worth knowing: $\\int \\tan x\\,dx = -\\ln|\\cos x| + C = \\ln|\\sec x| + C$ and $\\int \\sec x\\,dx = \\ln|\\sec x + \\tan x| + C$ (this last one is famously non-obvious).",
        ],
        eli5: [
          "Trig integrals look intimidating, but they all follow the same playbook: use identities to simplify, then substitute. The decision is just 'odd power or even power?' Odd → peel and substitute. Even → half-angle identities. Once you know the strategy, it's mechanical.",
        ],
        examples: [
          {
            title: "Even powers: half-angle identity",
            steps: [
              "Compute $\\int \\sin^2 x\\,dx$.",
              "Both powers are even (sin² × cos⁰), so use the half-angle identity.",
              "$\\sin^2 x = \\frac{1-\\cos(2x)}{2}$.",
              "$\\int \\sin^2 x\\,dx = \\int \\frac{1-\\cos(2x)}{2}\\,dx = \\frac{1}{2}\\int 1\\,dx - \\frac{1}{2}\\int \\cos(2x)\\,dx$.",
              "$= \\frac{x}{2} - \\frac{1}{2} \\cdot \\frac{\\sin(2x)}{2} + C = \\frac{x}{2} - \\frac{\\sin(2x)}{4} + C$.",
              "This integral appears so often that it's worth remembering the result directly.",
            ],
          },
        ],
      },
      {
        title: "Trigonometric substitution",
        body: [
          "When the integrand involves $\\sqrt{a^2 - x^2}$, $\\sqrt{a^2 + x^2}$, or $\\sqrt{x^2 - a^2}$, no algebraic trick will eliminate the square root. Trig substitution works by exploiting Pythagorean identities to remove the radical.",
          "$\\sqrt{a^2 - x^2}$: let $x = a\\sin\\theta$, $dx = a\\cos\\theta\\,d\\theta$. Then $\\sqrt{a^2-x^2} = a\\cos\\theta$. (Think: $1 - \\sin^2\\theta = \\cos^2\\theta$.)",
          "$\\sqrt{a^2 + x^2}$: let $x = a\\tan\\theta$, $dx = a\\sec^2\\theta\\,d\\theta$. Then $\\sqrt{a^2+x^2} = a\\sec\\theta$. (Think: $1 + \\tan^2\\theta = \\sec^2\\theta$.)",
          "$\\sqrt{x^2 - a^2}$: let $x = a\\sec\\theta$, $dx = a\\sec\\theta\\tan\\theta\\,d\\theta$. Then $\\sqrt{x^2-a^2} = a\\tan\\theta$. (Think: $\\sec^2\\theta - 1 = \\tan^2\\theta$.)",
          "After substituting, the radical vanishes, leaving a trig integral. Evaluate it, then convert back to $x$ using a reference triangle: draw a right triangle where the side lengths are chosen so $\\sin\\theta$, $\\cos\\theta$, or $\\tan\\theta$ equals $x/a$ (or the appropriate ratio).",
          "Recognition tip: the expression doesn't have to be a clean $\\sqrt{a^2-x^2}$. Complete the square first if needed. For instance, $\\sqrt{6x-x^2} = \\sqrt{9-(x-3)^2}$ after completing the square, and now the $a^2 - u^2$ pattern is visible with $u = x-3$, $a = 3$.",
        ],
        eli5: [
          "The three Pythagorean identities ($1-\\sin^2 = \\cos^2$, $1+\\tan^2 = \\sec^2$, $\\sec^2-1 = \\tan^2$) are perfectly shaped to cancel square roots of the form $a^2 - x^2$, $a^2 + x^2$, $x^2 - a^2$. Trig substitution is just choosing the right identity and letting the Pythagorean theorem do the heavy lifting.",
        ],
        examples: [
          {
            title: "Trig substitution: $\\sqrt{a^2 - x^2}$ pattern",
            steps: [
              "Compute $\\int \\frac{1}{\\sqrt{4-x^2}}\\,dx$.",
              "This has the form $\\sqrt{a^2 - x^2}$ with $a = 2$. Let $x = 2\\sin\\theta$, $dx = 2\\cos\\theta\\,d\\theta$.",
              "$\\sqrt{4 - x^2} = \\sqrt{4 - 4\\sin^2\\theta} = 2\\sqrt{1-\\sin^2\\theta} = 2\\cos\\theta$.",
              "Substitute: $\\int \\frac{1}{2\\cos\\theta} \\cdot 2\\cos\\theta\\,d\\theta = \\int 1\\,d\\theta = \\theta + C$.",
              "Convert back: since $x = 2\\sin\\theta$, we get $\\theta = \\arcsin(x/2)$.",
              "Final answer: $\\int \\frac{1}{\\sqrt{4-x^2}}\\,dx = \\arcsin\\frac{x}{2} + C$.",
            ],
          },
        ],
      },
      {
        title: "Partial fractions",
        body: [
          "To integrate a rational function $\\frac{P(x)}{Q(x)}$ where $\\deg P < \\deg Q$, decompose it into simpler fractions.",
          "Factor the denominator, then write: $\\frac{1}{(x-1)(x+2)} = \\frac{A}{x-1} + \\frac{B}{x+2}$.",
          "Solve for $A$ and $B$ by clearing denominators and comparing coefficients or plugging in strategic $x$ values.",
          "Repeated factors: $\\frac{1}{(x-1)^2}$ requires terms $\\frac{A}{x-1} + \\frac{B}{(x-1)^2}$.",
          "Irreducible quadratics: for $(x^2+1)$ in the denominator, the numerator is $Ax+B$, not just $A$.",
          "If $\\deg P \\geq \\deg Q$, perform polynomial long division first, then decompose the remainder.",
        ],
        examples: [
          {
            title: "Partial fraction decomposition",
            steps: [
              "Compute $\\int \\frac{5x + 1}{(x+1)(x-2)}\\,dx$.",
              "Decompose: $\\frac{5x+1}{(x+1)(x-2)} = \\frac{A}{x+1} + \\frac{B}{x-2}$.",
              "Multiply both sides by $(x+1)(x-2)$: $5x + 1 = A(x-2) + B(x+1)$.",
              "Smart substitution — let $x = 2$: $10 + 1 = A(0) + B(3)$, so $B = \\frac{11}{3}$.",
              "Let $x = -1$: $-5 + 1 = A(-3) + B(0)$, so $A = \\frac{4}{3}$.",
              "The integral becomes $\\int \\frac{4/3}{x+1}\\,dx + \\int \\frac{11/3}{x-2}\\,dx$.",
              "$= \\frac{4}{3}\\ln|x+1| + \\frac{11}{3}\\ln|x-2| + C$.",
            ],
          },
        ],
      },
      {
        title: "Improper integrals",
        body: [
          "An improper integral has an infinite limit of integration or an integrand that blows up within the interval. In either case, you can't just plug in bounds — you need a limit.",
          "Type 1 — infinite bound: replace $\\infty$ with a variable and take a limit. $\\int_1^{\\infty} \\frac{1}{x^2}\\,dx = \\lim_{b\\to\\infty} \\int_1^b \\frac{1}{x^2}\\,dx = \\lim_{b\\to\\infty} [-1/x]_1^b = \\lim_{b\\to\\infty}(-1/b+1) = 1$. Converges.",
          "Type 2 — infinite discontinuity: the integrand blows up at a point in $[a,b]$. Approach the bad point with a limit. $\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx = \\lim_{a\\to 0^+} \\int_a^1 x^{-1/2}\\,dx = \\lim_{a\\to 0^+} [2\\sqrt{x}]_a^1 = 2 - 0 = 2$. Converges.",
          "If the limit is finite, the improper integral converges. If the limit is $\\pm\\infty$ or does not exist, it diverges.",
          "Key result: $\\int_1^{\\infty} \\frac{1}{x^p}\\,dx$ converges if $p > 1$ and diverges if $p \\leq 1$. This is the continuous analog of the p-series test ($\\sum 1/n^p$) and serves as a benchmark for comparison.",
          "Comparison test for improper integrals: if $0 \\leq f(x) \\leq g(x)$ and $\\int g$ converges, then $\\int f$ converges. If $\\int f$ diverges, then $\\int g$ diverges. Same logic as for series.",
        ],
        eli5: [
          "A normal integral asks: 'What's the area under this curve between two finite points?' An improper integral asks: 'What if the region extends to infinity, or the curve shoots up to infinity somewhere?' Surprisingly, some of these infinite regions have finite area.",
          "The trick: sneak up on the infinity with a limit. Instead of integrating all the way to infinity at once, integrate to some large number $b$ and see what happens as $b \\to \\infty$. If the answer settles down to a finite number, the infinite area is actually finite.",
        ],
        examples: [
          {
            title: "Convergence vs. divergence of improper integrals",
            steps: [
              "Compare $\\int_1^\\infty \\frac{1}{x}\\,dx$ and $\\int_1^\\infty \\frac{1}{x^2}\\,dx$.",
              "For $1/x$: $\\lim_{b\\to\\infty} [\\ln x]_1^b = \\lim_{b\\to\\infty} (\\ln b - 0) = \\infty$. Diverges.",
              "For $1/x^2$: $\\lim_{b\\to\\infty} [-1/x]_1^b = \\lim_{b\\to\\infty} (-1/b + 1) = 1$. Converges.",
              "The difference? $1/x$ decays too slowly — its tail has too much area. $1/x^2$ decays fast enough for the total area to be finite.",
              "This is the boundary case: $p=1$ is the critical exponent. For $p > 1$, convergence. For $p \\leq 1$, divergence.",
            ],
          },
        ],
      },
      {
        title: "Which technique should I use? (Decision tree)",
        body: [
          "When facing an unfamiliar integral, work through this decision tree in order:",
          "1. Simplify first: can algebra, trig identities, or long division reduce it? Expanding a product or splitting a fraction may reveal a standard form. Never skip this step.",
          "2. Check the table: is it already a standard form you know? $\\int \\sec^2 x\\,dx$, $\\int e^x\\,dx$, $\\int 1/(1+x^2)\\,dx$, etc. If so, write down the answer immediately.",
          "3. Substitution ($u$-sub): is there a function composition $f(g(x))$ with $g'(x)$ (or a constant multiple of it) present in the integrand? If yes, let $u = g(x)$.",
          "4. Trig integrals: powers of $\\sin$ and $\\cos$ (or $\\tan$/$\\sec$)? Use the odd/even strategies and trig identities.",
          "5. Trig substitution: see $\\sqrt{a^2 - x^2}$, $\\sqrt{a^2 + x^2}$, or $\\sqrt{x^2 - a^2}$? Match the pattern to the right substitution.",
          "6. Integration by parts: product of two different types (e.g., $x \\cdot e^x$, $x^2 \\cdot \\sin x$, $\\ln x \\cdot x^n$)? Use LIATE to choose $u$.",
          "7. Partial fractions: rational function $P(x)/Q(x)$ where $Q$ can be factored? Decompose and integrate each piece.",
          "8. If none of these work: try a creative rewrite (multiply by $1$ in a clever form, add and subtract a term, complete the square) and re-enter the decision tree. Practice is the only way to develop speed and intuition.",
        ],
        eli5: [
          "Integration is like solving a puzzle. Derivatives have a clear algorithm — apply the rules mechanically. Integration doesn't. You have to look at the problem and recognize which tool fits. The decision tree is your checklist: try the easy stuff first, then work your way down to the fancier techniques.",
          "Over time, pattern recognition takes over. You'll see $x e^x$ and immediately think 'by parts.' You'll see $\\sqrt{1-x^2}$ and immediately think 'trig sub.' That speed only comes from practice.",
        ],
      },
      {
        title: "Area between curves and volumes (preview)",
        body: [
          "Integration extends naturally from 'area under one curve' to 'area between two curves' and 'volume of a solid.' The strategy is always the same: slice, approximate each slice, and integrate.",
          "Area between curves: the area between $y = f(x)$ (top) and $y = g(x)$ (bottom) from $x = a$ to $x = b$ is $\\int_a^b [f(x) - g(x)]\\,dx$. First determine which function is on top in each sub-interval. If the curves cross, split the integral at the crossing points.",
          "Volume by disks/washers: revolve a region around the $x$-axis. Each cross-section is a disk (or washer if there's a hole). $V = \\pi\\int_a^b [f(x)]^2\\,dx$ for a solid disk of radius $f(x)$. For a washer: $V = \\pi\\int_a^b ([R(x)]^2 - [r(x)]^2)\\,dx$ where $R$ is the outer radius and $r$ the inner.",
          "Volume by cylindrical shells: revolve around the $y$-axis. Instead of slicing perpendicular to the axis, wrap thin cylindrical shells around it. $V = 2\\pi\\int_a^b x \\cdot f(x)\\,dx$.",
          "These topics are expanded in the Applications of Integration module. The key insight here: integration is not just about area — it's a universal tool for accumulating any quantity that can be sliced into thin pieces.",
        ],
        eli5: [
          "Finding area between curves is like measuring the space between two fences. For volumes, imagine spinning a flat shape around a stick (like a potter's wheel) — it carves out a 3D solid. Integration lets you compute the exact volume by adding up infinitely many thin slices.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting $+C$ on indefinite integrals. Every indefinite integral has a constant of integration.",
      "Trying to use the power rule for $\\int \\frac{1}{x}\\,dx$. The power rule gives $\\frac{x^0}{0}$ which is undefined. The answer is $\\ln|x| + C$.",
      "Forgetting to change the bounds when using substitution in a definite integral. Either convert bounds to $u$-values or back-substitute before evaluating.",
      "Choosing $u$ and $dv$ poorly in integration by parts. If $\\int v\\,du$ is harder than the original, try swapping your choices.",
      "In partial fractions, forgetting to do polynomial long division first when the degree of the numerator is $\\geq$ the degree of the denominator.",
      "Not checking convergence of improper integrals. Always set up the limit explicitly before evaluating.",
      "Getting sign errors with trig antiderivatives: $\\int \\sin x\\,dx = -\\cos x + C$ (note the negative sign).",
    ],
  },
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
