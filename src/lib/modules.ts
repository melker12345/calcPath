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
      "Limits are the foundation of all of calculus. Every derivative and every integral is secretly a limit. Before you can do anything else, you need to master what it means for a function to approach a value.",
      "The notation $\\lim_{x\\to a} f(x) = L$ means: as $x$ gets arbitrarily close to $a$, the outputs $f(x)$ get arbitrarily close to $L$. Notice we never require $f(a)$ itself to equal $L$, or even to exist.",
      "Continuity is the special case where the limit and the actual value agree. A function is continuous when you can draw it without lifting your pen. Most functions you encounter are continuous, but the interesting calculus happens at the exceptions.",
    ],
    sections: [
      {
        title: "Building intuition: what does 'approaching' mean?",
        body: [
          "Imagine plugging in values of $x$ that get closer and closer to $a$. For $f(x) = (x^2-1)/(x-1)$, try $x=0.9, 0.99, 0.999, 1.001, 1.01, 1.1$. You'll see the outputs cluster around $2$, even though $f(1)$ is undefined.",
          "That clustering is the limit. Formally, $\\lim_{x\\to 1} \\frac{x^2-1}{x-1} = 2$ because the outputs can be made as close to $2$ as we like by choosing $x$ close enough to $1$.",
          "The limit cares about the neighborhood around a point, not the point itself. This is why limits are useful: they let us analyze behavior at places where the function might break.",
        ],
      },
      {
        title: "One-sided limits",
        body: [
          "The left-hand limit $\\lim_{x\\to a^-} f(x)$ only uses $x$-values less than $a$ (approaching from the left). The right-hand limit $\\lim_{x\\to a^+} f(x)$ only uses values greater than $a$.",
          "The two-sided limit $\\lim_{x\\to a} f(x)$ exists if and only if both one-sided limits exist and are equal.",
          "Example: for $f(x) = |x|/x$, we have $\\lim_{x\\to 0^-} f(x) = -1$ and $\\lim_{x\\to 0^+} f(x) = 1$. Since they disagree, the two-sided limit at $0$ does not exist.",
          "One-sided limits are essential for piecewise functions, absolute value expressions, and functions with jumps.",
        ],
      },
      {
        title: "Evaluating limits: direct substitution",
        body: [
          "Always try direct substitution first. If $f$ is continuous at $a$, then $\\lim_{x\\to a} f(x) = f(a)$. You're done.",
          "Polynomials, rational functions (away from zeros of the denominator), $e^x$, $\\ln x$ (for $x>0$), $\\sin x$, $\\cos x$, and $\\tan x$ (away from asymptotes) are all continuous on their domains.",
          "Direct substitution fails when you get an undefined expression like $0/0$. That's when you need the techniques below.",
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
      },
      {
        title: "The Squeeze Theorem",
        body: [
          "If $g(x) \\leq f(x) \\leq h(x)$ near $a$, and $\\lim_{x\\to a} g(x) = \\lim_{x\\to a} h(x) = L$, then $\\lim_{x\\to a} f(x) = L$.",
          "The function $f$ is 'squeezed' between two functions that both approach the same value, so $f$ has no choice but to approach that value too.",
          "Classic example: $\\lim_{x\\to 0} x^2 \\sin(1/x)$. We know $-x^2 \\leq x^2\\sin(1/x) \\leq x^2$, and both $-x^2$ and $x^2$ approach $0$, so the limit is $0$.",
          "The Squeeze Theorem is how we rigorously prove $\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1$ using geometry of the unit circle.",
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
      },
      {
        title: "Evaluating limits of piecewise functions",
        body: [
          "For a piecewise function, you must check the left-hand and right-hand limits separately at each boundary point.",
          "Use the piece that applies for $x < a$ to compute $\\lim_{x\\to a^-}$, and the piece that applies for $x > a$ to compute $\\lim_{x\\to a^+}$.",
          "If $\\lim_{x\\to a^-} f(x) = \\lim_{x\\to a^+} f(x) = L$, then $\\lim_{x\\to a} f(x) = L$. For continuity, you also need $f(a) = L$.",
          "Example: if $f(x) = x^2$ for $x < 2$ and $f(x) = 3x-2$ for $x \\geq 2$, then $\\lim_{x\\to 2^-} f(x) = 4$ and $\\lim_{x\\to 2^+} f(x) = 4$, so the limit exists and equals $4$. Since $f(2)=4$, the function is continuous at $x=2$.",
        ],
      },
      {
        title: "Infinite limits and vertical asymptotes",
        body: [
          "An infinite limit like $\\lim_{x\\to a} f(x) = \\infty$ means the outputs grow without bound as $x$ approaches $a$. The limit technically does not exist as a real number, but we write $\\infty$ to describe the behavior.",
          "Vertical asymptotes occur where the denominator approaches $0$ but the numerator does not.",
          "Check signs carefully: $\\lim_{x\\to 0^+} 1/x = +\\infty$ but $\\lim_{x\\to 0^-} 1/x = -\\infty$. The one-sided behavior can differ.",
          "For rational functions, factor the denominator to find all vertical asymptotes. Cancel common factors first (those give removable discontinuities, not asymptotes).",
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
      },
      {
        title: "L'Hôpital's Rule",
        body: [
          "When direct substitution gives $0/0$ or $\\infty/\\infty$, L'Hôpital's Rule says: $\\lim_{x\\to a} \\frac{f(x)}{g(x)} = \\lim_{x\\to a} \\frac{f'(x)}{g'(x)}$, provided the right-hand limit exists.",
          "Important: differentiate the numerator and denominator separately. Do not use the quotient rule.",
          "You may need to apply the rule multiple times if the result is still indeterminate.",
          "For other indeterminate forms like $0 \\cdot \\infty$, $\\infty - \\infty$, $1^\\infty$, $0^0$, or $\\infty^0$, rewrite the expression into a $0/0$ or $\\infty/\\infty$ form first.",
          "Example: for $\\lim_{x\\to 0^+} x\\ln x$ ($0 \\cdot (-\\infty)$ form), rewrite as $\\lim_{x\\to 0^+} \\frac{\\ln x}{1/x}$ ($-\\infty / \\infty$ form) and apply L'Hôpital.",
        ],
      },
    ],
    examples: [
      {
        title: "Factoring out a removable discontinuity",
        steps: [
          "Compute $\\lim_{x\\to 3} \\frac{x^2-9}{x-3}$.",
          "Direct substitution gives $0/0$, so factor: $\\frac{(x-3)(x+3)}{x-3}$.",
          "Cancel the $(x-3)$ terms: the expression simplifies to $x+3$.",
          "Substitute $x=3$: the limit is $3+3=6$.",
        ],
      },
      {
        title: "Rationalizing a radical",
        steps: [
          "Compute $\\lim_{x\\to 0} \\frac{\\sqrt{1+x}-1}{x}$.",
          "Direct substitution gives $0/0$.",
          "Multiply numerator and denominator by the conjugate $\\sqrt{1+x}+1$.",
          "Numerator becomes $(1+x)-1 = x$, so the expression simplifies to $\\frac{x}{x(\\sqrt{1+x}+1)} = \\frac{1}{\\sqrt{1+x}+1}$.",
          "Substitute $x=0$: the limit is $\\frac{1}{1+1} = \\frac{1}{2}$.",
        ],
      },
      {
        title: "Using the key trig limit",
        steps: [
          "Compute $\\lim_{x\\to 0} \\frac{\\sin(5x)}{3x}$.",
          "Rewrite: $\\frac{\\sin(5x)}{3x} = \\frac{5}{3} \\cdot \\frac{\\sin(5x)}{5x}$.",
          "As $x\\to 0$, we have $5x\\to 0$, so $\\frac{\\sin(5x)}{5x} \\to 1$.",
          "The limit is $\\frac{5}{3} \\cdot 1 = \\frac{5}{3}$.",
        ],
      },
      {
        title: "Squeeze Theorem",
        steps: [
          "Compute $\\lim_{x\\to 0} x^2 \\cos(1/x)$.",
          "We know $-1 \\leq \\cos(1/x) \\leq 1$ for all $x \\neq 0$.",
          "Multiply through by $x^2$: $-x^2 \\leq x^2\\cos(1/x) \\leq x^2$.",
          "Both $-x^2$ and $x^2$ approach $0$ as $x\\to 0$.",
          "By the Squeeze Theorem, $\\lim_{x\\to 0} x^2\\cos(1/x) = 0$.",
        ],
      },
      {
        title: "Limits at infinity for a rational function",
        steps: [
          "Compute $\\lim_{x\\to \\infty} \\frac{2x^2+3x+1}{x^2-4}$.",
          "Divide every term by $x^2$: $\\frac{2+3/x+1/x^2}{1-4/x^2}$.",
          "As $x\\to \\infty$: $3/x \\to 0$, $1/x^2 \\to 0$, and $4/x^2 \\to 0$.",
          "The limit is $\\frac{2+0+0}{1-0} = 2$. The horizontal asymptote is $y=2$.",
        ],
      },
      {
        title: "L'Hôpital's Rule",
        steps: [
          "Compute $\\lim_{x\\to 0} \\frac{e^x - 1}{x}$.",
          "Direct substitution gives $\\frac{0}{0}$, an indeterminate form.",
          "Apply L'Hôpital: differentiate top and bottom separately.",
          "Numerator derivative: $e^x$. Denominator derivative: $1$.",
          "New limit: $\\lim_{x\\to 0} \\frac{e^x}{1} = e^0 = 1$.",
        ],
      },
      {
        title: "Piecewise continuity check",
        steps: [
          "Is $f(x) = \\begin{cases} x^2+1 & x < 2 \\\\ 5 & x = 2 \\\\ 3x-1 & x > 2 \\end{cases}$ continuous at $x=2$?",
          "Left-hand limit: $\\lim_{x\\to 2^-} (x^2+1) = 4+1 = 5$.",
          "Right-hand limit: $\\lim_{x\\to 2^+} (3x-1) = 6-1 = 5$.",
          "Both sides agree, so $\\lim_{x\\to 2} f(x) = 5$. Also $f(2)=5$.",
          "All three conditions met: $f$ is continuous at $x=2$.",
        ],
      },
    ],
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
          "The derivative $f'(x) = \\lim_{h\\to 0} \\frac{f(x+h)-f(x)}{h}$ is the limit of the difference quotient. The difference quotient $\\frac{f(x+h)-f(x)}{h}$ is the slope of a secant line through two nearby points.",
          "As $h\\to 0$, the secant line becomes the tangent line, and its slope becomes the derivative.",
          "If this limit exists at $x=a$, we say $f$ is differentiable at $a$. If $f$ is differentiable at $a$, then $f$ is also continuous at $a$. The converse is false: $|x|$ is continuous at $0$ but not differentiable (it has a sharp corner).",
          "Places where differentiability fails: sharp corners (like $|x|$), vertical tangent lines (like $\\sqrt[3]{x}$ at $0$), and discontinuities.",
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
      },
      {
        title: "Derivatives of common functions",
        body: [
          "Exponentials: $\\frac{d}{dx} e^x = e^x$ (the only function equal to its own derivative). More generally, $\\frac{d}{dx} a^x = a^x \\ln a$.",
          "Logarithms: $\\frac{d}{dx} \\ln x = \\frac{1}{x}$. More generally, $\\frac{d}{dx} \\log_a x = \\frac{1}{x \\ln a}$.",
          "Trigonometric: $\\frac{d}{dx} \\sin x = \\cos x$, $\\frac{d}{dx} \\cos x = -\\sin x$, $\\frac{d}{dx} \\tan x = \\sec^2 x$.",
          "More trig: $\\frac{d}{dx} \\sec x = \\sec x \\tan x$, $\\frac{d}{dx} \\csc x = -\\csc x \\cot x$, $\\frac{d}{dx} \\cot x = -\\csc^2 x$.",
          "Memorize these. They are the building blocks for every derivative you will ever compute.",
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
      },
      {
        title: "Quotient rule",
        body: [
          "For a ratio of functions: $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$.",
          "Memory aid: \"low d-high minus high d-low, over the square of what's below.\"",
          "Example: $\\frac{d}{dx}\\frac{x^2}{\\cos x} = \\frac{2x\\cos x - x^2(-\\sin x)}{\\cos^2 x} = \\frac{2x\\cos x + x^2\\sin x}{\\cos^2 x}$.",
          "Alternative: you can often rewrite $f/g$ as $f \\cdot g^{-1}$ and use the product rule instead. Use whichever feels easier.",
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
      },
      {
        title: "Inverse trigonometric derivatives",
        body: [
          "$\\frac{d}{dx} \\arcsin x = \\frac{1}{\\sqrt{1-x^2}}$, valid for $|x| < 1$.",
          "$\\frac{d}{dx} \\arccos x = -\\frac{1}{\\sqrt{1-x^2}}$.",
          "$\\frac{d}{dx} \\arctan x = \\frac{1}{1+x^2}$. This one appears frequently in integration.",
          "With the chain rule: $\\frac{d}{dx} \\arctan(3x) = \\frac{3}{1+(3x)^2} = \\frac{3}{1+9x^2}$.",
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
      },
      {
        title: "Logarithmic differentiation",
        body: [
          "For complicated products, quotients, or expressions like $x^x$, take the natural log of both sides first.",
          "Example: find $\\frac{d}{dx} x^x$. Let $y = x^x$, then $\\ln y = x \\ln x$.",
          "Differentiate implicitly: $\\frac{1}{y}\\frac{dy}{dx} = \\ln x + 1$.",
          "Solve: $\\frac{dy}{dx} = x^x(\\ln x + 1)$.",
          "This technique turns products into sums and powers into products, making differentiation much simpler.",
        ],
      },
      {
        title: "Higher-order derivatives",
        body: [
          "The second derivative $f''(x)$ is the derivative of $f'(x)$. It measures how the rate of change itself is changing.",
          "Notation: $f''(x)$, $\\frac{d^2y}{dx^2}$, or $y''$. For higher orders: $f'''(x)$, $f^{(4)}(x)$, etc.",
          "Physical meaning: if $s(t)$ is position, then $s'(t)$ is velocity and $s''(t)$ is acceleration.",
          "The second derivative tells you about concavity: $f''(x) > 0$ means concave up (like a bowl), $f''(x) < 0$ means concave down (like an arch).",
          "Higher-order derivatives appear in Taylor series: you need $f'(a), f''(a), f'''(a), \\ldots$ to build the polynomial approximation.",
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
          "$f'(x) > 0$ on an interval means $f$ is increasing there. $f'(x) < 0$ means $f$ is decreasing.",
          "Where $f'(x) = 0$, the tangent line is horizontal. These are critical points: potential maxima or minima.",
          "The sign of $f'(x)$ changing from $+$ to $-$ at a critical point signals a local maximum. From $-$ to $+$ signals a local minimum.",
          "If $f'(x)$ does not change sign, the critical point is neither a max nor a min (e.g., $f(x)=x^3$ at $x=0$).",
          "The graph of $f'(x)$ tells you the steepness and direction of $f$. Where $f'$ crosses zero, $f$ has a horizontal tangent.",
        ],
      },
    ],
    examples: [
      {
        title: "Power rule with various exponents",
        steps: [
          "Differentiate $f(x) = 3x^4 - 2x^{-1} + \\sqrt{x}$.",
          "Rewrite: $3x^4 - 2x^{-1} + x^{1/2}$.",
          "Apply power rule term by term: $12x^3 + 2x^{-2} + \\frac{1}{2}x^{-1/2}$.",
          "Simplify: $12x^3 + \\frac{2}{x^2} + \\frac{1}{2\\sqrt{x}}$.",
        ],
      },
      {
        title: "Chain rule with nested functions",
        steps: [
          "Differentiate $f(x) = e^{\\sin(2x)}$.",
          "Outer function: $e^u$ with $u = \\sin(2x)$. Derivative of outer: $e^u$.",
          "Inner function: $\\sin(v)$ with $v = 2x$. Derivative: $\\cos(2x) \\cdot 2$.",
          "Combine: $f'(x) = e^{\\sin(2x)} \\cdot \\cos(2x) \\cdot 2 = 2\\cos(2x)\\,e^{\\sin(2x)}$.",
        ],
      },
      {
        title: "Product rule",
        steps: [
          "Differentiate $f(x) = x^3 \\ln x$.",
          "Let $u = x^3$ and $v = \\ln x$. Then $u' = 3x^2$ and $v' = 1/x$.",
          "Product rule: $f'(x) = 3x^2 \\ln x + x^3 \\cdot \\frac{1}{x}$.",
          "Simplify: $f'(x) = 3x^2 \\ln x + x^2 = x^2(3\\ln x + 1)$.",
        ],
      },
      {
        title: "Implicit differentiation on a circle",
        steps: [
          "Find $\\frac{dy}{dx}$ for $x^2 + y^2 = 25$.",
          "Differentiate both sides with respect to $x$: $2x + 2y\\frac{dy}{dx} = 0$.",
          "Solve for $\\frac{dy}{dx}$: $\\frac{dy}{dx} = -\\frac{x}{y}$.",
          "At the point $(3, 4)$: slope is $-\\frac{3}{4}$. The tangent line is $y - 4 = -\\frac{3}{4}(x-3)$.",
        ],
      },
      {
        title: "Logarithmic differentiation",
        steps: [
          "Differentiate $y = x^x$ for $x > 0$.",
          "Take $\\ln$ of both sides: $\\ln y = x \\ln x$.",
          "Differentiate implicitly: $\\frac{1}{y}\\frac{dy}{dx} = \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1$.",
          "Multiply both sides by $y = x^x$: $\\frac{dy}{dx} = x^x(\\ln x + 1)$.",
        ],
      },
      {
        title: "Linearization for quick estimates",
        steps: [
          "Approximate $\\sin(0.1)$ using linearization at $a = 0$.",
          "$f(x) = \\sin x$, $f(0) = 0$, $f'(x) = \\cos x$, $f'(0) = 1$.",
          "Linear approximation: $\\sin(0.1) \\approx 0 + 1 \\cdot (0.1) = 0.1$.",
          "Actual value: $\\sin(0.1) = 0.09983...$. The approximation is excellent for small $x$.",
        ],
      },
    ],
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
      },
      {
        title: "The Fundamental Theorem of Calculus (FTC)",
        body: [
          "FTC Part 1: if $F(x) = \\int_a^x f(t)\\,dt$, then $F'(x) = f(x)$. Differentiation and integration are inverse operations.",
          "FTC Part 2: $\\int_a^b f(x)\\,dx = F(b) - F(a)$ where $F$ is any antiderivative of $f$ (meaning $F'=f$).",
          "Part 2 is the computational powerhouse: instead of computing limits of Riemann sums, just find an antiderivative and evaluate at the bounds.",
          "The connection to derivatives: if position is $s(t)$ and velocity is $v(t) = s'(t)$, then total displacement is $\\int_a^b v(t)\\,dt = s(b) - s(a)$. Integration recovers position from velocity.",
        ],
      },
      {
        title: "Net area vs. total area",
        body: [
          "The definite integral computes net (signed) area: regions above the $x$-axis contribute positively, regions below contribute negatively.",
          "If you want total area (all positive), integrate the absolute value: $\\int_a^b |f(x)|\\,dx$.",
          "In practice, find where $f(x) = 0$, split the interval at those zeros, and flip the sign on intervals where $f < 0$.",
        ],
      },
      {
        title: "Antiderivatives and the constant of integration",
        body: [
          "An indefinite integral $\\int f(x)\\,dx$ represents the family of all antiderivatives of $f$.",
          "Since the derivative of a constant is $0$, any two antiderivatives differ by a constant. That's why we write $+C$.",
          "Never forget $+C$ on indefinite integrals. It's not optional: it represents an infinite family of solutions.",
        ],
      },
      {
        title: "Common integrals (your core toolbox)",
        body: [
          "- $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$ for $n \\neq -1$.",
          "- $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$. (The power rule doesn't work for $n = -1$.)",
          "- $\\int e^x\\,dx = e^x + C$ and $\\int a^x\\,dx = \\frac{a^x}{\\ln a} + C$.",
          "- $\\int \\sin x\\,dx = -\\cos x + C$ and $\\int \\cos x\\,dx = \\sin x + C$.",
          "- $\\int \\sec^2 x\\,dx = \\tan x + C$ and $\\int \\csc^2 x\\,dx = -\\cot x + C$.",
          "- $\\int \\sec x \\tan x\\,dx = \\sec x + C$ and $\\int \\csc x \\cot x\\,dx = -\\csc x + C$.",
          "- $\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x + C$ and $\\int \\frac{1}{1+x^2}\\,dx = \\arctan x + C$.",
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
      },
      {
        title: "Trigonometric integrals",
        body: [
          "Powers of sin and cos: for $\\int \\sin^m x \\cos^n x\\,dx$, use the following strategies:",
          "If one power is odd, peel off one factor, convert the rest using $\\sin^2 x + \\cos^2 x = 1$, and substitute.",
          "If both powers are even, use the half-angle identities: $\\sin^2 x = \\frac{1-\\cos(2x)}{2}$ and $\\cos^2 x = \\frac{1+\\cos(2x)}{2}$.",
          "Example: $\\int \\sin^2 x\\,dx = \\int \\frac{1-\\cos(2x)}{2}\\,dx = \\frac{x}{2} - \\frac{\\sin(2x)}{4} + C$.",
          "Example: $\\int \\cos^3 x\\,dx = \\int \\cos^2 x \\cos x\\,dx = \\int (1-\\sin^2 x)\\cos x\\,dx$. Let $u = \\sin x$: result is $\\sin x - \\frac{\\sin^3 x}{3} + C$.",
        ],
      },
      {
        title: "Trigonometric substitution",
        body: [
          "For integrands involving $\\sqrt{a^2 - x^2}$, $\\sqrt{a^2 + x^2}$, or $\\sqrt{x^2 - a^2}$, use trig substitutions:",
          "$\\sqrt{a^2 - x^2}$: let $x = a\\sin\\theta$, so $\\sqrt{a^2-x^2} = a\\cos\\theta$.",
          "$\\sqrt{a^2 + x^2}$: let $x = a\\tan\\theta$, so $\\sqrt{a^2+x^2} = a\\sec\\theta$.",
          "$\\sqrt{x^2 - a^2}$: let $x = a\\sec\\theta$, so $\\sqrt{x^2-a^2} = a\\tan\\theta$.",
          "After substituting, the square root disappears and you get a trig integral. Evaluate, then convert back to $x$ using a reference triangle.",
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
      },
      {
        title: "Improper integrals",
        body: [
          "An improper integral has an infinite bound or an integrand with an infinite discontinuity.",
          "Type 1 (infinite bound): $\\int_1^{\\infty} \\frac{1}{x^2}\\,dx = \\lim_{b\\to\\infty} \\int_1^b \\frac{1}{x^2}\\,dx = \\lim_{b\\to\\infty} [-1/x]_1^b = \\lim_{b\\to\\infty}(-1/b+1) = 1$. This converges.",
          "Type 2 (discontinuity): $\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx = \\lim_{a\\to 0^+} \\int_a^1 x^{-1/2}\\,dx = \\lim_{a\\to 0^+} [2\\sqrt{x}]_a^1 = 2$. This also converges.",
          "If the limit is finite, the improper integral converges. If the limit is $\\pm\\infty$ or does not exist, it diverges.",
          "Key result: $\\int_1^{\\infty} \\frac{1}{x^p}\\,dx$ converges if $p > 1$ and diverges if $p \\leq 1$. This mirrors the p-series test.",
        ],
      },
      {
        title: "Which technique should I use? (Decision tree)",
        body: [
          "1. Simplify first: can algebra, trig identities, or long division reduce the integral?",
          "2. Check the table: is it a standard form you already know?",
          "3. Substitution: is there an inner function whose derivative appears in the integrand?",
          "4. Trig integrals: powers of $\\sin$ and $\\cos$? Use identities.",
          "5. Trig substitution: see $\\sqrt{a^2 \\pm x^2}$ or $\\sqrt{x^2 - a^2}$?",
          "6. Integration by parts: product of two different types of functions?",
          "7. Partial fractions: rational function with a factorable denominator?",
          "Practice is the only way to develop intuition for which technique to try first.",
        ],
      },
      {
        title: "Area between curves and volumes (preview)",
        body: [
          "Area between $f(x)$ and $g(x)$ on $[a,b]$: $\\int_a^b |f(x) - g(x)|\\,dx$. Determine which function is on top on each sub-interval.",
          "Volume by disks/washers: revolve a region around the $x$-axis: $V = \\pi\\int_a^b [f(x)]^2\\,dx$.",
          "Volume by shells: revolve around the $y$-axis: $V = 2\\pi\\int_a^b x\\,f(x)\\,dx$.",
          "These are applications of integration, extending the concept of 'summing up infinitely many small pieces' to 2D and 3D geometry.",
        ],
      },
    ],
    examples: [
      {
        title: "Power rule for integrals",
        steps: [
          "Compute $\\int x^3\\,dx$.",
          "Apply the power rule: increase exponent by $1$ and divide: $\\frac{x^4}{4}$.",
          "Add the constant: $\\frac{x^4}{4} + C$.",
        ],
      },
      {
        title: "Substitution",
        steps: [
          "Compute $\\int 2x\\cos(x^2)\\,dx$.",
          "Let $u = x^2$, then $du = 2x\\,dx$.",
          "Integral becomes $\\int \\cos u\\,du = \\sin u + C = \\sin(x^2) + C$.",
        ],
      },
      {
        title: "Integration by parts",
        steps: [
          "Compute $\\int x e^x\\,dx$.",
          "Let $u = x$ (algebraic, simplifies on differentiation), $dv = e^x\\,dx$.",
          "Then $du = dx$, $v = e^x$.",
          "Apply formula: $xe^x - \\int e^x\\,dx = xe^x - e^x + C = e^x(x-1) + C$.",
        ],
      },
      {
        title: "Trig integral with half-angle identity",
        steps: [
          "Compute $\\int \\sin^2 x\\,dx$.",
          "Use the identity: $\\sin^2 x = \\frac{1-\\cos(2x)}{2}$.",
          "Integrate: $\\int \\frac{1-\\cos(2x)}{2}\\,dx = \\frac{x}{2} - \\frac{\\sin(2x)}{4} + C$.",
        ],
      },
      {
        title: "Partial fractions",
        steps: [
          "Compute $\\int \\frac{1}{x^2-1}\\,dx$.",
          "Factor: $x^2-1 = (x-1)(x+1)$. Decompose: $\\frac{1}{(x-1)(x+1)} = \\frac{A}{x-1} + \\frac{B}{x+1}$.",
          "Solve: $A = 1/2$, $B = -1/2$.",
          "Integrate: $\\frac{1}{2}\\ln|x-1| - \\frac{1}{2}\\ln|x+1| + C = \\frac{1}{2}\\ln\\left|\\frac{x-1}{x+1}\\right| + C$.",
        ],
      },
      {
        title: "Improper integral",
        steps: [
          "Compute $\\int_1^{\\infty} \\frac{1}{x^2}\\,dx$.",
          "Replace $\\infty$ with $b$: $\\lim_{b\\to\\infty} \\int_1^b x^{-2}\\,dx$.",
          "Antiderivative: $-1/x$. Evaluate: $\\lim_{b\\to\\infty} (-1/b + 1) = 0 + 1 = 1$.",
          "The integral converges to $1$.",
        ],
      },
      {
        title: "Definite integral with FTC",
        steps: [
          "Compute $\\int_0^2 3x^2\\,dx$.",
          "Antiderivative: $x^3$.",
          "Evaluate: $F(2) - F(0) = 8 - 0 = 8$.",
        ],
      },
    ],
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
      },
      {
        title: "The second derivative test",
        body: [
          "An alternative to sign charts: at a critical point where $f'(c) = 0$:",
          "If $f''(c) > 0$, the function is concave up at $c$, so $f(c)$ is a local minimum (think: bowl shape).",
          "If $f''(c) < 0$, the function is concave down at $c$, so $f(c)$ is a local maximum (think: arch shape).",
          "If $f''(c) = 0$, the test is inconclusive. Fall back to the first derivative test.",
          "The second derivative test is often faster when $f''$ is easy to compute.",
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
      },
      {
        title: "Absolute extrema on closed intervals (Extreme Value Theorem)",
        body: [
          "The Extreme Value Theorem: if $f$ is continuous on a closed interval $[a,b]$, then $f$ attains an absolute maximum and an absolute minimum on $[a,b]$.",
          "The closed interval method to find them:",
          "Step 1: Find all critical points of $f$ in the open interval $(a,b)$.",
          "Step 2: Evaluate $f$ at each critical point and at both endpoints $a$ and $b$.",
          "Step 3: The largest value is the absolute maximum, the smallest is the absolute minimum.",
          "This is the go-to method for any 'find the max/min on an interval' problem. Never forget the endpoints!",
        ],
      },
      {
        title: "Curve sketching (putting it all together)",
        body: [
          "A complete curve sketch uses the following information from derivatives:",
          "1. Domain and intercepts: where is $f$ defined? Where does it cross the axes?",
          "2. First derivative analysis: find critical points, determine intervals of increase/decrease.",
          "3. Second derivative analysis: find inflection points, determine concavity on each interval.",
          "4. Asymptotes: check for vertical asymptotes (denominator = 0) and horizontal asymptotes ($\\lim_{x\\to\\pm\\infty}$).",
          "5. Plot key points (critical points, inflection points, intercepts) and connect with the correct shape (increasing/decreasing, concave up/down).",
          "Example: for $f(x) = x^3 - 3x$: $f'(x) = 3x^2-3 = 3(x-1)(x+1)$. Critical points at $x=\\pm 1$. $f''(x) = 6x$, inflection point at $x=0$. Local max at $(-1, 2)$, local min at $(1, -2)$, inflection at $(0, 0)$.",
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
      },
      {
        title: "Motion along a line",
        body: [
          "Given a position function $s(t)$: velocity is $v(t) = s'(t)$ and acceleration is $a(t) = v'(t) = s''(t)$.",
          "The particle is moving right when $v(t) > 0$ and moving left when $v(t) < 0$.",
          "The particle stops (changes direction) when $v(t) = 0$ and the velocity changes sign.",
          "Speed is $|v(t)|$. The particle speeds up when velocity and acceleration have the same sign, and slows down when they have opposite signs.",
          "Total distance traveled is $\\int_a^b |v(t)|\\,dt$ (not the same as displacement $\\int_a^b v(t)\\,dt$).",
        ],
      },
      {
        title: "Linearization and differentials",
        body: [
          "The linearization of $f$ at $a$ is $L(x) = f(a) + f'(a)(x-a)$. It's the tangent line used as an approximation.",
          "For values of $x$ near $a$, $f(x) \\approx L(x)$. This is how engineers and scientists do quick estimates.",
          "Differentials: if $y = f(x)$, then $dy = f'(x)\\,dx$. The differential $dy$ approximates the actual change $\\Delta y$.",
          "Example: estimate $\\sqrt{4.02}$. Use $f(x) = \\sqrt{x}$ at $a=4$. $f'(4) = 1/4$. So $\\sqrt{4.02} \\approx 2 + \\frac{1}{4}(0.02) = 2.005$.",
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
      },
      {
        title: "Newton's method",
        body: [
          "Newton's method finds approximate roots of $f(x) = 0$ using tangent lines.",
          "Start with an initial guess $x_0$. The iteration formula is: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$.",
          "Each step draws the tangent line at $(x_n, f(x_n))$ and finds where it crosses the $x$-axis. That crossing point is $x_{n+1}$.",
          "Convergence is typically very fast (quadratic) when the initial guess is close to the root.",
          "Pitfalls: the method can fail if $f'(x_n) = 0$ (horizontal tangent), if the initial guess is too far from the root, or if the function oscillates.",
        ],
      },
    ],
    examples: [
      {
        title: "First derivative test: classify critical points",
        steps: [
          "Find and classify the critical points of $f(x) = x^3 - 3x + 1$.",
          "$f'(x) = 3x^2 - 3 = 3(x-1)(x+1)$. Critical points at $x = -1$ and $x = 1$.",
          "Sign chart: $f'(x) > 0$ on $(-\\infty, -1)$, $f'(x) < 0$ on $(-1, 1)$, $f'(x) > 0$ on $(1, \\infty)$.",
          "$x=-1$: $f'$ changes $+$ to $-$, so local maximum. $f(-1) = 3$.",
          "$x=1$: $f'$ changes $-$ to $+$, so local minimum. $f(1) = -1$.",
        ],
      },
      {
        title: "Absolute extrema on a closed interval",
        steps: [
          "Find the absolute max and min of $f(x) = x^3 - 6x^2 + 9x + 2$ on $[0, 4]$.",
          "$f'(x) = 3x^2 - 12x + 9 = 3(x-1)(x-3)$. Critical points: $x=1, x=3$ (both in $(0,4)$).",
          "Evaluate: $f(0) = 2$, $f(1) = 6$, $f(3) = 2$, $f(4) = 6$.",
          "Absolute maximum is $6$ (at $x=1$ and $x=4$). Absolute minimum is $2$ (at $x=0$ and $x=3$).",
        ],
      },
      {
        title: "Optimization: minimizing material",
        steps: [
          "Design an open-top box with volume $32$ cm$^3$ using the least material. The base is a square.",
          "Let the base side be $x$ and height be $h$. Constraint: $x^2 h = 32$, so $h = 32/x^2$.",
          "Surface area (no top): $S = x^2 + 4xh = x^2 + 128/x$.",
          "$S'(x) = 2x - 128/x^2$. Set to zero: $2x^3 = 128$, so $x = 4$ and $h = 2$.",
          "$S''(4) = 2 + 256/64 = 6 > 0$, confirming a minimum. Minimum material: $S = 48$ cm$^2$.",
        ],
      },
      {
        title: "Related rates: sliding ladder",
        steps: [
          "A 10-ft ladder leans against a wall. The base slides away at 1 ft/s. How fast does the top slide down when the base is 6 ft from the wall?",
          "Equation: $x^2 + y^2 = 100$ (Pythagorean theorem).",
          "Differentiate: $2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0$.",
          "When $x=6$: $y = \\sqrt{100-36} = 8$. Given $dx/dt = 1$.",
          "Solve: $2(6)(1) + 2(8)\\frac{dy}{dt} = 0$, so $\\frac{dy}{dt} = -\\frac{3}{4}$ ft/s. The top slides down at $3/4$ ft/s.",
        ],
      },
      {
        title: "Motion analysis",
        steps: [
          "A particle has position $s(t) = t^3 - 6t^2 + 9t$ for $t \\geq 0$.",
          "Velocity: $v(t) = 3t^2 - 12t + 9 = 3(t-1)(t-3)$. Zero at $t=1$ and $t=3$.",
          "Sign analysis: $v > 0$ on $(0,1)$, $v < 0$ on $(1,3)$, $v > 0$ on $(3,\\infty)$.",
          "Particle moves right, then left, then right. Direction changes at $t=1$ and $t=3$.",
          "Acceleration: $a(t) = 6t - 12 = 0$ at $t=2$. Particle slows down on $(0,1)$ since $v>0$ and $a<0$.",
        ],
      },
      {
        title: "Newton's method",
        steps: [
          "Approximate $\\sqrt{5}$ using Newton's method on $f(x) = x^2 - 5$.",
          "$f'(x) = 2x$. Iteration: $x_{n+1} = x_n - \\frac{x_n^2 - 5}{2x_n}$.",
          "Start with $x_0 = 2$: $x_1 = 2 - \\frac{-1}{4} = 2.25$.",
          "$x_2 = 2.25 - \\frac{0.0625}{4.5} = 2.23611...$",
          "After just 2 iterations, we're accurate to 4 decimal places ($\\sqrt{5} \\approx 2.23607$).",
        ],
      },
    ],
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
          "A sequence $\\{a_n\\}$ is an ordered list: $a_1, a_2, a_3, \\ldots$ The sequence converges if $\\lim_{n\\to\\infty} a_n = L$ for some finite $L$.",
          "Common sequences: $a_n = 1/n \\to 0$, $a_n = (1+1/n)^n \\to e$, $a_n = (-1)^n$ diverges (oscillates).",
          "Tools for evaluating sequence limits: L'Hôpital's Rule (treat $n$ as a continuous variable $x$), Squeeze Theorem, and the fact that exponentials dominate polynomials which dominate logarithms: $\\ln n \\ll n^p \\ll a^n \\ll n! \\ll n^n$ for $a > 1$.",
          "A sequence is monotonic if it is always increasing or always decreasing. A bounded monotonic sequence always converges (Monotone Convergence Theorem).",
        ],
      },
      {
        title: "Series: partial sums and convergence",
        body: [
          "A series $\\sum_{n=1}^{\\infty} a_n$ is the limit of its partial sums: $S_N = \\sum_{n=1}^{N} a_n$. If $\\lim_{N\\to\\infty} S_N$ exists and is finite, the series converges.",
          "Key distinction: a sequence $\\{a_n\\}$ converging to $0$ is necessary for the series to converge, but not sufficient. $a_n = 1/n \\to 0$, yet $\\sum 1/n$ diverges.",
          "The harmonic series $\\sum 1/n$ diverges. This is one of the most important facts in the theory of series. It shows that terms going to zero isn't enough.",
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
      },
      {
        title: "Telescoping series",
        body: [
          "A telescoping series is one where most terms cancel in the partial sum.",
          "Example: $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)} = \\sum_{n=1}^{\\infty} \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right)$.",
          "The partial sum is $S_N = 1 - \\frac{1}{N+1}$. As $N \\to \\infty$, $S_N \\to 1$.",
          "To recognize telescoping: use partial fractions to decompose the general term. If consecutive terms cancel, you have a telescoping series.",
        ],
      },
      {
        title: "The Divergence Test (nth-term test)",
        body: [
          "If $\\lim_{n\\to\\infty} a_n \\neq 0$, then $\\sum a_n$ diverges. Period.",
          "This should always be your first check. It's quick and catches obvious divergence.",
          "If $\\lim_{n\\to\\infty} a_n = 0$, the test is inconclusive. You need another test. (Remember: $\\sum 1/n$ has $a_n \\to 0$ but diverges.)",
        ],
      },
      {
        title: "p-series and the harmonic series",
        body: [
          "A p-series is $\\sum_{n=1}^{\\infty} \\frac{1}{n^p}$.",
          "Converges if $p > 1$ and diverges if $p \\leq 1$.",
          "$p=1$: harmonic series $\\sum 1/n$ (diverges). $p=2$: $\\sum 1/n^2 = \\pi^2/6$ (converges). $p=1/2$: $\\sum 1/\\sqrt{n}$ (diverges).",
          "p-series are the benchmark for comparison tests. When you see $1/n^p$-like terms, think p-series.",
        ],
      },
      {
        title: "The Integral Test",
        body: [
          "If $f(x)$ is positive, continuous, and decreasing for $x \\geq N$, and $a_n = f(n)$, then $\\sum_{n=N}^{\\infty} a_n$ and $\\int_N^{\\infty} f(x)\\,dx$ either both converge or both diverge.",
          "The integral test does not give the sum of the series, only whether it converges.",
          "Example: test $\\sum 1/n^2$. Compare with $\\int_1^{\\infty} 1/x^2\\,dx = 1$. The integral converges, so the series converges.",
          "This is how we prove the p-series convergence criteria: $\\int_1^{\\infty} x^{-p}\\,dx$ converges iff $p > 1$.",
        ],
      },
      {
        title: "Comparison and Limit Comparison Tests",
        body: [
          "Direct comparison: if $0 \\leq a_n \\leq b_n$ for all $n$ and $\\sum b_n$ converges, then $\\sum a_n$ converges. If $\\sum a_n$ diverges, then $\\sum b_n$ diverges.",
          "Limit comparison: if $\\lim_{n\\to\\infty} a_n / b_n = L$ where $0 < L < \\infty$, then $\\sum a_n$ and $\\sum b_n$ either both converge or both diverge.",
          "Strategy: compare your series to a known p-series or geometric series. Pick $b_n$ by keeping only the dominant terms.",
          "Example: test $\\sum \\frac{n}{n^3+1}$. For large $n$, this behaves like $\\frac{n}{n^3} = \\frac{1}{n^2}$. Limit comparison with $\\sum 1/n^2$ (converges) confirms convergence.",
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
      },
      {
        title: "Alternating Series Test",
        body: [
          "An alternating series has the form $\\sum (-1)^n a_n$ where $a_n > 0$.",
          "It converges if: (1) $a_n$ is eventually decreasing and (2) $\\lim_{n\\to\\infty} a_n = 0$.",
          "Example: $\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n} = 1 - 1/2 + 1/3 - 1/4 + \\cdots = \\ln 2$. (The alternating harmonic series.)",
          "Alternating series estimation: the error after summing $N$ terms is at most $|a_{N+1}|$. This gives a built-in error bound.",
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
      },
      {
        title: "Power series",
        body: [
          "A power series centered at $a$ is $\\sum_{n=0}^{\\infty} c_n(x-a)^n$. It converges on some interval centered at $a$.",
          "The radius of convergence $R$ determines where it converges: $|x-a| < R$ (converges), $|x-a| > R$ (diverges). At $|x-a| = R$ (the endpoints), you must check separately.",
          "Find $R$ using the ratio test: $R = \\lim_{n\\to\\infty} \\left|\\frac{c_n}{c_{n+1}}\\right|$ (or the root test).",
          "Inside the radius, power series behave like polynomials: you can differentiate and integrate them term by term.",
          "Example: the geometric series $\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n$ for $|x| < 1$ is a power series with $R = 1$.",
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
      },
      {
        title: "Taylor remainder and error bounds",
        body: [
          "The $n$th degree Taylor polynomial $T_n(x)$ approximates $f(x)$. The error is $R_n(x) = f(x) - T_n(x)$.",
          "Taylor's inequality: $|R_n(x)| \\leq \\frac{M}{(n+1)!}|x-a|^{n+1}$ where $M$ is an upper bound for $|f^{(n+1)}(t)|$ on the interval between $a$ and $x$.",
          "For alternating series, the error after $n$ terms is bounded by the first omitted term: $|R_n| \\leq |a_{n+1}|$.",
          "This is critical for applications: you can determine how many terms you need for a desired accuracy.",
        ],
      },
      {
        title: "Building new series from known ones",
        body: [
          "Substitution: replace $x$ in a known series. E.g., $e^{-x^2} = \\sum \\frac{(-x^2)^n}{n!} = \\sum \\frac{(-1)^n x^{2n}}{n!}$.",
          "Differentiation: $\\frac{d}{dx}\\left[\\frac{1}{1-x}\\right] = \\frac{1}{(1-x)^2} = \\sum_{n=1}^{\\infty} nx^{n-1}$.",
          "Integration: $\\int_0^x \\frac{1}{1+t^2}\\,dt = \\arctan x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{2n+1}$.",
          "These techniques let you derive new series without computing derivatives from scratch.",
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
    examples: [
      {
        title: "Geometric series",
        steps: [
          "Find the sum of $\\sum_{n=0}^{\\infty} \\frac{3}{2^n}$.",
          "This is geometric with $a = 3$ and $r = 1/2$.",
          "Since $|r| = 1/2 < 1$, it converges. Sum $= \\frac{3}{1 - 1/2} = 6$.",
        ],
      },
      {
        title: "Telescoping series",
        steps: [
          "Find the sum of $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)}$.",
          "Partial fractions: $\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$.",
          "Partial sum: $S_N = (1 - 1/2) + (1/2 - 1/3) + \\cdots + (1/N - 1/(N+1)) = 1 - \\frac{1}{N+1}$.",
          "As $N \\to \\infty$: sum $= 1$.",
        ],
      },
      {
        title: "Ratio test with factorials",
        steps: [
          "Test $\\sum_{n=1}^{\\infty} \\frac{n!}{3^n}$.",
          "$\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{(n+1)!}{3^{n+1}} \\cdot \\frac{3^n}{n!} = \\frac{n+1}{3}$.",
          "$\\lim_{n\\to\\infty} \\frac{n+1}{3} = \\infty > 1$. The series diverges.",
        ],
      },
      {
        title: "Limit comparison",
        steps: [
          "Test $\\sum_{n=1}^{\\infty} \\frac{2n+1}{n^3+n}$.",
          "For large $n$: $\\frac{2n+1}{n^3+n} \\approx \\frac{2n}{n^3} = \\frac{2}{n^2}$.",
          "Limit comparison with $b_n = 1/n^2$: $\\lim \\frac{a_n}{b_n} = \\lim \\frac{(2n+1)n^2}{n^3+n} = \\lim \\frac{2n^3+n^2}{n^3+n} = 2$.",
          "Since $0 < 2 < \\infty$ and $\\sum 1/n^2$ converges, so does the original series.",
        ],
      },
      {
        title: "Deriving a Taylor series",
        steps: [
          "Find the Maclaurin series for $f(x) = e^{-x^2}$.",
          "Start with the known series: $e^u = \\sum_{n=0}^{\\infty} \\frac{u^n}{n!}$.",
          "Substitute $u = -x^2$: $e^{-x^2} = \\sum_{n=0}^{\\infty} \\frac{(-x^2)^n}{n!} = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{n!}$.",
          "This converges for all $x$ (same as $e^u$).",
        ],
      },
      {
        title: "Error bound with alternating series",
        steps: [
          "Approximate $\\cos(0.1)$ using the first 3 nonzero terms of its Maclaurin series. Bound the error.",
          "$\\cos(0.1) \\approx 1 - \\frac{(0.1)^2}{2!} + \\frac{(0.1)^4}{4!} = 1 - 0.005 + 0.0000041\\overline{6} \\approx 0.995004$.",
          "This is an alternating series. The error is at most the next term: $\\frac{(0.1)^6}{6!} = \\frac{10^{-6}}{720} \\approx 1.4 \\times 10^{-9}$.",
          "So our approximation is accurate to about 9 decimal places with just 3 terms!",
        ],
      },
    ],
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
          "A DE relates a function $y(x)$ to its derivatives. The order of a DE is the highest derivative that appears.",
          "First-order: involves $y'$ (but not $y''$). Example: $y' = 2xy$.",
          "Second-order: involves $y''$. Example: $y'' + 4y = 0$ (simple harmonic motion).",
          "A solution is a function $y(x)$ that satisfies the equation for all $x$ in some interval.",
          "The general solution contains arbitrary constants (one constant for first-order, two for second-order). An initial value problem (IVP) provides conditions to determine these constants.",
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
      },
      {
        title: "Exponential growth and decay",
        body: [
          "The DE $\\frac{dy}{dt} = ky$ is separable with solution $y(t) = y_0 e^{kt}$ where $y_0 = y(0)$.",
          "If $k > 0$: exponential growth (populations, compound interest, viral spread).",
          "If $k < 0$: exponential decay (radioactive decay, cooling, drug elimination).",
          "Half-life: the time for the quantity to halve. If $y = y_0 e^{kt}$, the half-life is $t_{1/2} = \\frac{\\ln 2}{|k|}$.",
          "Doubling time: the time for the quantity to double. Doubling time $= \\frac{\\ln 2}{k}$ for $k > 0$.",
        ],
      },
      {
        title: "Newton's Law of Cooling",
        body: [
          "The temperature of an object changes at a rate proportional to the difference between its temperature and the ambient temperature: $\\frac{dT}{dt} = -k(T - T_{\\text{env}})$.",
          "This is separable. Solution: $T(t) = T_{\\text{env}} + (T_0 - T_{\\text{env}})e^{-kt}$ where $T_0$ is the initial temperature.",
          "As $t \\to \\infty$, $T(t) \\to T_{\\text{env}}$. The object approaches room temperature exponentially.",
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
      },
      {
        title: "Bernoulli equations",
        body: [
          "A Bernoulli equation has the form $\\frac{dy}{dx} + P(x)y = Q(x)y^n$ where $n \\neq 0, 1$.",
          "Trick: substitute $v = y^{1-n}$, then $\\frac{dv}{dx} = (1-n)y^{-n}\\frac{dy}{dx}$.",
          "After substitution, the equation becomes linear in $v$: $\\frac{dv}{dx} + (1-n)P(x)v = (1-n)Q(x)$.",
          "Solve the linear equation for $v$, then convert back to $y$.",
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
      },
      {
        title: "Non-homogeneous equations and particular solutions",
        body: [
          "Form: $ay'' + by' + cy = g(x)$ where $g(x) \\neq 0$.",
          "The general solution is $y = y_h + y_p$ where $y_h$ is the homogeneous solution (solve with $g=0$) and $y_p$ is any particular solution.",
          "Method of undetermined coefficients: guess the form of $y_p$ based on $g(x)$.",
          "If $g(x) = e^{kx}$, try $y_p = Ae^{kx}$. If $g(x) = \\sin(kx)$ or $\\cos(kx)$, try $y_p = A\\cos(kx) + B\\sin(kx)$. If $g(x)$ is a polynomial of degree $n$, try a polynomial of degree $n$.",
          "If your guess duplicates a term in $y_h$, multiply by $x$ (or $x^2$ if needed).",
          "Variation of parameters is a more general method that works for any $g(x)$ but involves more computation.",
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
      },
      {
        title: "Initial value problems (IVPs)",
        body: [
          "An IVP provides the DE plus enough initial conditions to determine all constants.",
          "First-order: one condition, typically $y(x_0) = y_0$.",
          "Second-order: two conditions, typically $y(x_0) = y_0$ and $y'(x_0) = v_0$.",
          "Procedure: solve the general solution first, then plug in the initial conditions and solve for the constants.",
          "The Existence and Uniqueness Theorem: under mild conditions, a first-order IVP has exactly one solution through any given point.",
        ],
      },
    ],
    examples: [
      {
        title: "Separable equation",
        steps: [
          "Solve $\\frac{dy}{dx} = \\frac{x}{y}$ with $y(0) = 2$.",
          "Separate: $y\\,dy = x\\,dx$. Integrate: $\\frac{y^2}{2} = \\frac{x^2}{2} + C$.",
          "Apply $y(0) = 2$: $\\frac{4}{2} = 0 + C$, so $C = 2$.",
          "Solution: $y^2 = x^2 + 4$, or $y = \\sqrt{x^2+4}$ (taking the positive root since $y(0)=2 > 0$).",
        ],
      },
      {
        title: "Exponential decay",
        steps: [
          "A substance decays at a rate proportional to its amount. If 100g decays to 80g in 3 hours, find $y(t)$.",
          "DE: $y' = ky$, solution: $y = 100e^{kt}$.",
          "Use $y(3) = 80$: $80 = 100e^{3k}$, so $e^{3k} = 0.8$, thus $k = \\frac{\\ln(0.8)}{3} \\approx -0.0744$.",
          "Final answer: $y(t) = 100e^{-(0.0744)t}$. Half-life $\\approx \\frac{\\ln 2}{0.0744} \\approx 9.3$ hours.",
        ],
      },
      {
        title: "Linear first-order with integrating factor",
        steps: [
          "Solve $\\frac{dy}{dx} + 2y = 4e^{-x}$.",
          "Integrating factor: $\\mu = e^{\\int 2\\,dx} = e^{2x}$.",
          "Multiply: $(e^{2x}y)' = 4e^{-x} \\cdot e^{2x} = 4e^{x}$.",
          "Integrate: $e^{2x}y = 4e^{x} + C$.",
          "Solve: $y = 4e^{-x} + Ce^{-2x}$.",
        ],
      },
      {
        title: "Second-order with distinct real roots",
        steps: [
          "Solve $y'' - 5y' + 6y = 0$.",
          "Characteristic equation: $r^2 - 5r + 6 = (r-2)(r-3) = 0$. Roots: $r = 2, 3$.",
          "General solution: $y = C_1 e^{2x} + C_2 e^{3x}$.",
        ],
      },
      {
        title: "Second-order with complex roots (oscillation)",
        steps: [
          "Solve $y'' + 4y = 0$.",
          "Characteristic equation: $r^2 + 4 = 0$, so $r = \\pm 2i$.",
          "Here $\\alpha = 0$ and $\\beta = 2$.",
          "General solution: $y = C_1 \\cos(2x) + C_2 \\sin(2x)$. This is pure oscillation.",
        ],
      },
      {
        title: "Non-homogeneous: undetermined coefficients",
        steps: [
          "Solve $y'' - 3y' + 2y = 4e^{5x}$.",
          "Homogeneous solution: $r^2-3r+2 = (r-1)(r-2) = 0$, so $y_h = C_1 e^x + C_2 e^{2x}$.",
          "Guess $y_p = Ae^{5x}$. Then $y_p'' - 3y_p' + 2y_p = 25Ae^{5x} - 15Ae^{5x} + 2Ae^{5x} = 12Ae^{5x} = 4e^{5x}$.",
          "So $A = 1/3$. General solution: $y = C_1 e^x + C_2 e^{2x} + \\frac{1}{3}e^{5x}$.",
        ],
      },
      {
        title: "Logistic growth",
        steps: [
          "A population satisfies $\\frac{dP}{dt} = 0.5P(1 - P/1000)$ with $P(0) = 100$.",
          "Here $r = 0.5$ and $K = 1000$. $A = \\frac{K-P_0}{P_0} = \\frac{900}{100} = 9$.",
          "Solution: $P(t) = \\frac{1000}{1 + 9e^{-0.5t}}$.",
          "As $t \\to \\infty$, $P \\to 1000$. Fastest growth at $P = 500$ (the inflection point).",
        ],
      },
    ],
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
];
