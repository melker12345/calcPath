import type { ModuleContent } from "../types";

/**
 * Limits & Continuity
 * Extracted from the original monolithic modules.ts as part of the content scalability refactor.
 */

export const limitsModule: ModuleContent = {
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
        section: "funcrep",
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
        section: "intuition",
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
        section: "onesided",
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
        section: "directsub",
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
        section: "indeterminate",
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
        section: "trig",
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
        section: "squeeze",
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
        section: "continuity",
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
        section: "piecewise",
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
        section: "infinite",
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
        section: "atinfinity",
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
        section: "lhopital",
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
  };
