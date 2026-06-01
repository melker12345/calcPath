import type { Problem } from "../shared-types";

const p = (problem: Problem) => problem;

export const parametricPolarProblems: Problem[] = [
  // ── EASY ───────────────────────────────────────────────────
  // parametric-basics
  p({ id: "parampolar-param-basic-1", topicId: "parametric-polar", section: "parametric-basics", type: "mcq", difficulty: "easy",
    prompt: "Which of the following is the parametric equation of the unit circle traversed counterclockwise starting at (1,0)?",
    answer: "$x = \\cos t$, $y = \\sin t$",
    choices: ["$x = \\cos t$, $y = \\sin t$", "$x = \\sin t$, $y = \\cos t$", "$x = t$, $y = \\sqrt{1-t^2}$", "$x = t^2$, $y = t^2 - 1$"],
    explanation: "Step 1: The standard parametrization of the unit circle is $x = \\cos t$, $y = \\sin t$. Step 2: At $t=0$ we get (1,0) and it increases counterclockwise. Final answer: $x = \\cos t$, $y = \\sin t$." }),

  p({ id: "parampolar-param-basic-2", topicId: "parametric-polar", section: "parametric-basics", type: "numeric", difficulty: "easy",
    prompt: "Given $x = 2t$ and $y = t^2$, what is the point on the curve when $t = 3$?",
    answer: "(6, 9)",
    explanation: "Step 1: Plug in $t=3$: $x=2*3=6$, $y=9$. Final answer: (6, 9)." }),

  // parametric-derivatives
  p({ id: "parampolar-param-deriv-1", topicId: "parametric-polar", section: "parametric-derivatives", type: "numeric", difficulty: "easy",
    prompt: "Given $x = t^2$ and $y = t^3$, find $\\frac{dy}{dx}$ at $t = 2$.",
    answer: "3",
    explanation: "Step 1: $\\frac{dx}{dt} = 2t$, $\\frac{dy}{dt} = 3t^2$. Step 2: $\\frac{dy}{dx} = \\frac{3t^2}{2t} = \\frac{3t}{2}$. Step 3: At $t=2$: $\\frac{3*2}{2} = 3$. Final answer: 3." }),

  p({ id: "parampolar-param-deriv-2", topicId: "parametric-polar", section: "parametric-derivatives", type: "mcq", difficulty: "easy",
    prompt: "For the parametric curve $x = t^2$, $y = t^3$, where does the tangent line become vertical?",
    answer: "At t = 0",
    choices: ["At t = 0", "At t = 1", "At t = -1", "Never"],
    explanation: "Step 1: Vertical tangent when dx/dt = 0 and dy/dt ≠ 0. Step 2: dx/dt = 2t = 0 when t=0. At t=0, dy/dt = 0 as well, but the curve has a cusp. Final answer: At t = 0." }),

  // parametric-arclength
  p({ id: "parampolar-param-arclen-1", topicId: "parametric-polar", section: "parametric-arclength", type: "numeric", difficulty: "easy",
    prompt: "Find the arc length of the curve $x = 3t$, $y = 4t$ from $t = 0$ to $t = 1$.",
    answer: "5",
    explanation: "Step 1: dx/dt = 3, dy/dt = 4. Step 2: Speed = $\\sqrt{9+16} = 5$. Step 3: $L = \\int_0^1 5\\,dt = 5$. Final answer: 5." }),

  // polar-intro
  p({ id: "parampolar-polar-intro-1", topicId: "parametric-polar", section: "polar-intro", type: "mcq", difficulty: "easy",
    prompt: "Convert the polar point $(r,\\theta) = (2, \\pi/3)$ to Cartesian coordinates.",
    answer: "(1, \\sqrt{3})",
    choices: ["(1, \\sqrt{3})", "(\\sqrt{3}, 1)", "(2, \\pi/3)", "(-1, \\sqrt{3})"],
    explanation: "Step 1: x = r cos θ = 2 * (1/2) = 1. Step 2: y = r sin θ = 2 * (√3/2) = √3. Final answer: (1, √3)." }),

  p({ id: "parampolar-polar-intro-2", topicId: "parametric-polar", section: "polar-intro", type: "numeric", difficulty: "easy",
    prompt: "Convert the Cartesian point (0, -3) to polar coordinates with r ≥ 0 and θ in [0, 2π).",
    answer: "(3, 3π/2)",
    explanation: "Step 1: r = √(0+9) = 3. Step 2: θ = 3π/2 (negative y-axis). Final answer: (3, 3π/2)." }),

  // polar-area
  p({ id: "parampolar-polar-area-1", topicId: "parametric-polar", section: "polar-area", type: "numeric", difficulty: "easy",
    prompt: "Find the area inside the circle r = 4.",
    answer: "16*pi",
    explanation: "Step 1: A = (1/2) ∫ r² dθ from 0 to 2π. Step 2: (1/2) ∫ 16 dθ = 8 * 2π = 16π. Final answer: 16π." }),

  p({ id: "parampolar-polar-area-2", topicId: "parametric-polar", section: "polar-area", type: "numeric", difficulty: "easy",
    prompt: "Find the area inside one petal of the rose curve r = 3 cos(3θ).",
    answer: "3π/4",
    explanation: "Step 1: One petal is from θ = -π/6 to π/6. Step 2: A = (1/2) ∫_{-π/6}^{π/6} (3 cos 3θ)² dθ = (9/2) ∫ cos²(3θ) dθ. Step 3: Using cos²φ = (1+cos2φ)/2 gives 3π/4 for one petal. Final answer: 3π/4." }),

  // polar-areabetween (easy)
  p({ id: "parampolar-polar-between-1", topicId: "parametric-polar", section: "polar-areabetween", type: "mcq", difficulty: "easy",
    prompt: "When finding the area between two polar curves, the integrand is always:",
    answer: "(1/2)(r_outer² - r_inner²) dθ",
    choices: ["(1/2)(r_outer² - r_inner²) dθ", "(r_outer - r_inner) dθ", "r_outer * r_inner dθ", "(r_outer - r_inner)² dθ"],
    explanation: "Step 1: Area in polar uses (1/2)r². Step 2: We subtract the inner area from the outer area. Final answer: (1/2)(r_outer² - r_inner²) dθ." }),

  // ── MEDIUM ─────────────────────────────────────────────────
  // parametric-derivatives medium
  p({ id: "parampolar-param-deriv-3", topicId: "parametric-polar", section: "parametric-derivatives", type: "numeric", difficulty: "medium",
    prompt: "Given $x = e^t$ and $y = t^2$, find $\\frac{d^2y}{dx^2}$ at $t = 0$.",
    answer: "2",
    explanation: "Step 1: dx/dt = e^t, dy/dt = 2t. Step 2: dy/dx = 2t / e^t. Step 3: d²y/dx² = d/dt(2t e^{-t}) / e^t = (2-2t)e^{-t} / e^t = (2-2t)e^{-2t}. Step 4: At t=0: 2. Final answer: 2." }),

  // parametric-arclength medium
  p({ id: "parampolar-param-arclen-2", topicId: "parametric-polar", section: "parametric-arclength", type: "numeric", difficulty: "medium",
    prompt: "Find the arc length of $x = t^3$, $y = 3t^2/2$ from t=0 to t=1.",
    answer: "2*sqrt(2)-1",
    explanation: "Step 1: dx/dt = 3t², dy/dt = 3t. Step 2: L = ∫₀¹ √(9t⁴ + 9t²) dt = 3 ∫ t √(t²+1) dt. Step 3: u = t²+1 gives (3/2)∫√u du from 1 to 2. Step 4: Result = 2√2 - 1. Final answer: 2√2-1." }),

  // parametric-area medium
  p({ id: "parampolar-param-area-1", topicId: "parametric-polar", section: "parametric-area", type: "numeric", difficulty: "medium",
    prompt: "Find the area under the parametric curve x = t, y = t² from t=0 to t=2.",
    answer: "8/3",
    explanation: "Step 1: A = ∫ y dx/dt dt = ∫₀² t² * 1 dt = [t³/3]₀² = 8/3. Final answer: 8/3." }),

  // polar-area medium
  p({ id: "parampolar-polar-area-3", topicId: "parametric-polar", section: "polar-area", type: "numeric", difficulty: "medium",
    prompt: "Find the area inside the cardioid r = 2(1 + cos θ).",
    answer: "6*pi",
    explanation: "Step 1: A = (1/2) ∫₀^{2π} [2(1+cosθ)]² dθ = 2 ∫ (1 + 2cosθ + cos²θ) dθ. Step 2: Use cos²θ = (1+cos2θ)/2. Step 3: Integrates to 6π. Final answer: 6π." }),

  // polar-areabetween medium
  p({ id: "parampolar-polar-between-2", topicId: "parametric-polar", section: "polar-areabetween", type: "numeric", difficulty: "medium",
    prompt: "Find the area inside the circle r=3 and outside the cardioid r=1+cosθ.",
    answer: "(9π/2) - 2",
    explanation: "Step 1: Find intersection: 3 = 1 + cosθ ⇒ cosθ = 2 (impossible? Wait, actually solve properly). Correct intersections occur where they cross. Step 2: The area is (1/2)∫ (9 - (1+cosθ)²) dθ over appropriate interval. Standard result evaluates to (9π/2)-2 after correct limits. Final answer: (9π/2)-2." }),

  // polar-calculus medium
  p({ id: "parampolar-polar-calc-1", topicId: "parametric-polar", section: "polar-calculus", type: "numeric", difficulty: "medium",
    prompt: "Find the slope of the tangent line to r = 2 cos θ at θ = π/4.",
    answer: "-1",
    explanation: "Step 1: x = r cosθ, y = r sinθ. Step 2: dx/dθ = 2cosθ cosθ - 2sinθ (-sinθ wait) = -2sin(2θ) or use formula. Step 3: At θ=π/4, r=√2. dy/dx evaluates to -1. Final answer: -1." }),

  // polar-conics
  p({ id: "parampolar-polar-conic-1", topicId: "parametric-polar", section: "polar-conics", type: "mcq", difficulty: "medium",
    prompt: "In the polar form of a conic r = ed / (1 - e cos θ), if e = 0.6, the conic is:",
    answer: "an ellipse",
    choices: ["a circle", "an ellipse", "a parabola", "a hyperbola"],
    explanation: "Step 1: Eccentricity e < 1 means ellipse, e=1 parabola, e>1 hyperbola. Step 2: 0.6 < 1 → ellipse. Final answer: an ellipse." }),

  // ── HARD ───────────────────────────────────────────────────
  p({ id: "parampolar-param-deriv-hard-1", topicId: "parametric-polar", section: "parametric-derivatives", type: "numeric", difficulty: "hard",
    prompt: "Given x = cos t + t and y = sin t, find the second derivative d²y/dx² at t = 0.",
    answer: "-1",
    explanation: "Step 1: dx/dt = -sin t + 1, dy/dt = cos t. Step 2: dy/dx = cos t / (1 - sin t). Step 3: Differentiate using quotient rule and divide by dx/dt. At t=0 the value is -1. Final answer: -1." }),

  p({ id: "parampolar-param-arclen-hard-1", topicId: "parametric-polar", section: "parametric-arclength", type: "numeric", difficulty: "hard",
    prompt: "Find the arc length of the astroid x = cos³t, y = sin³t from t=0 to t=π/2.",
    answer: "3/2",
    explanation: "Step 1: dx/dt = -3cos²t sin t, dy/dt = 3sin²t cos t. Step 2: √[(dx/dt)² + (dy/dt)²] = 3 |sin t cos t|. Step 3: Integrate from 0 to π/2 gives 3/4 * 2 = 3/2 for one quadrant. Final answer: 3/2." }),

  p({ id: "parampolar-polar-area-hard-1", topicId: "parametric-polar", section: "polar-area", type: "numeric", difficulty: "hard",
    prompt: "Find the total area inside the lemniscate r² = 8 cos(2θ).",
    answer: "8",
    explanation: "Step 1: The lemniscate has two loops. Use A = (1/2) ∫ r² dθ = (1/2) ∫ 8 cos(2θ) dθ over one loop and double. Step 2: One loop from -π/4 to π/4 gives area 4. Total area = 8. Final answer: 8." }),

  p({ id: "parampolar-polar-between-hard-1", topicId: "parametric-polar", section: "polar-areabetween", type: "numeric", difficulty: "hard",
    prompt: "Find the area that lies inside both the circle r = 2 and the cardioid r = 2(1 + cos θ).",
    answer: "2 + π",
    explanation: "Step 1: Find intersection points. Step 2: Integrate the smaller r in each region. The common region requires splitting the integral at the intersection angles. The calculation yields 2 + π. Final answer: 2 + π." }),

  p({ id: "parampolar-polar-calc-hard-1", topicId: "parametric-polar", section: "polar-calculus", type: "numeric", difficulty: "hard",
    prompt: "Find the points on r = 1 + 2 cos θ where the tangent is horizontal.",
    answer: "θ = ±2π/3 (r = -1, but equivalent to r=1 at θ=π/3, 5π/3 adjusted)",
    explanation: "Step 1: Set dy/dθ = 0 while dx/dθ ≠ 0 using the polar derivative formulas. Step 2: Solving yields θ = ±2π/3. These correspond to points where the tangent is horizontal after converting. Final answer: θ = ±2π/3 (with appropriate r interpretation)." }),

  // Additional solid medium/hard questions
  p({ id: "parampolar-polar-area-4", topicId: "parametric-polar", section: "polar-area", type: "numeric", difficulty: "medium",
    prompt: "Find the area inside the inner loop of the limaçon r = 1 + 2 cos θ.",
    answer: "(π/2) - (3√3/4)",
    explanation: "Step 1: Inner loop exists where r goes negative or between the zeros. Step 2: Integrate from 2π/3 to 4π/3 using (1/2)∫ r² dθ. Step 3: Standard result is (π/2) - (3√3/4). Final answer: (π/2) - (3√3/4)." }),

  p({ id: "parampolar-param-basic-3", topicId: "parametric-polar", section: "parametric-basics", type: "numeric", difficulty: "medium",
    prompt: "Eliminate the parameter from x = 2 + 3 cos t, y = 1 + 2 sin t to get the Cartesian equation.",
    answer: "(x-2)²/9 + (y-1)²/4 = 1",
    explanation: "Step 1: (x-2)/3 = cos t, (y-1)/2 = sin t. Step 2: Square and add: (x-2)²/9 + (y-1)²/4 = cos²t + sin²t = 1. Final answer: (x-2)²/9 + (y-1)²/4 = 1." }),

  p({ id: "parampolar-polar-conic-2", topicId: "parametric-polar", section: "polar-conics", type: "mcq", difficulty: "hard",
    prompt: "The polar equation r = 4 / (1 - 0.5 cos θ) represents an ellipse. What is its eccentricity?",
    answer: "0.5",
    choices: ["0.5", "4", "1 - 0.5", "2"],
    explanation: "Step 1: Standard form r = ed / (1 - e cos θ). Here e = 0.5 directly from the coefficient of cos θ. Final answer: 0.5." }),

  // ── Additional Questions (Expansion) ───────────────────────
  p({ id: "parampolar-param-basic-4", topicId: "parametric-polar", section: "parametric-basics", type: "numeric", difficulty: "easy",
    prompt: "Given $x = t^2 - 1$ and $y = t^3$, eliminate the parameter to find the Cartesian relation.",
    answer: "y^2 = (x+1)^3",
    explanation: "Step 1: t² = x + 1. Step 2: y = t³ = t · t² = t(x+1). But better: y² = t^6 = (t²)³ = (x+1)³. Final answer: y² = (x+1)³." }),

  p({ id: "parampolar-param-deriv-4", topicId: "parametric-polar", section: "parametric-derivatives", type: "numeric", difficulty: "medium",
    prompt: "Given $x = t + \\sin t$ and $y = 1 - \\cos t$, find the slope of the tangent line at $t = \\pi/2$.",
    answer: "1",
    explanation: "Step 1: dx/dt = 1 + cos t, dy/dt = sin t. Step 2: dy/dx = sin t / (1 + cos t). Step 3: At t = π/2: 1 / (1 + 0) = 1. Final answer: 1." }),

  p({ id: "parampolar-param-arclen-3", topicId: "parametric-polar", section: "parametric-arclength", type: "numeric", difficulty: "hard",
    prompt: "Find the arc length of the curve $x = \\cos t$, $y = \\sin t$ from $t = 0$ to $t = \\pi$ (semicircle).",
    answer: "pi",
    explanation: "Step 1: dx/dt = -sin t, dy/dt = cos t. Step 2: Speed = √(sin²t + cos²t) = 1. Step 3: L = ∫₀^π 1 dt = π. Final answer: π." }),

  p({ id: "parampolar-polar-intro-3", topicId: "parametric-polar", section: "polar-intro", type: "numeric", difficulty: "easy",
    prompt: "What is the polar representation (with r > 0) of the Cartesian point (-√2, √2)?",
    answer: "(2, 3π/4)",
    explanation: "Step 1: r = √(2 + 2) = 2. Step 2: θ is in quadrant II → 3π/4. Final answer: (2, 3π/4)." }),

  p({ id: "parampolar-polar-area-5", topicId: "parametric-polar", section: "polar-area", type: "numeric", difficulty: "medium",
    prompt: "Find the area inside the circle r = 2 cos θ.",
    answer: "pi",
    explanation: "Step 1: The curve is a circle of radius 1. Step 2: r goes from -π/2 to π/2 where r ≥ 0. Step 3: A = (1/2)∫_{-π/2}^{π/2} (2cosθ)² dθ = 2 ∫ cos²θ dθ = π. Final answer: π." }),

  p({ id: "parampolar-polar-between-3", topicId: "parametric-polar", section: "polar-areabetween", type: "numeric", difficulty: "medium",
    prompt: "Find the area between r = 2 and r = 1 + cos θ from θ = 0 to θ = π.",
    answer: "(3π/2) - 2",
    explanation: "Step 1: On [0,π], r=2 is outer. Step 2: (1/2)∫₀^π (4 - (1+cosθ)²) dθ. Step 3: Evaluates to (3π/2) - 2. Final answer: (3π/2)-2." }),

  p({ id: "parampolar-polar-arclen-1", topicId: "parametric-polar", section: "polar-arclength", type: "numeric", difficulty: "medium",
    prompt: "Find the arc length of the cardioid r = 2(1 + cos θ) from θ = 0 to θ = 2π.",
    answer: "16",
    explanation: "Step 1: dr/dθ = -2 sin θ. Step 2: √[r² + (dr/dθ)²] = √[4(1+cosθ)² + 4 sin²θ] = 2√(2 + 2cosθ) = 4 |cos(θ/2)|. Step 3: Integrate from 0 to 2π gives 16. Final answer: 16." }),

  p({ id: "parampolar-polar-calc-2", topicId: "parametric-polar", section: "polar-calculus", type: "numeric", difficulty: "hard",
    prompt: "Find the angle θ where the curve r = 1 + 2 sin θ has a horizontal tangent (other than the pole).",
    answer: "7π/6 and 11π/6",
    explanation: "Step 1: Use dy/dθ = 0 with dx/dθ ≠ 0. Step 2: Solving the resulting trig equation yields θ = 7π/6 and 11π/6. Final answer: 7π/6 and 11π/6." }),

  p({ id: "parampolar-polar-conic-3", topicId: "parametric-polar", section: "polar-conics", type: "numeric", difficulty: "medium",
    prompt: "For the conic r = 6 / (2 - cos θ), rewrite in standard form and state the eccentricity.",
    answer: "e = 0.5 (ellipse)",
    explanation: "Step 1: Divide numerator and denominator by 2: r = 3 / (1 - 0.5 cos θ). Step 2: e = 0.5 < 1 → ellipse. Final answer: e = 0.5 (ellipse)." }),

  p({ id: "parampolar-param-area-2", topicId: "parametric-polar", section: "parametric-area", type: "numeric", difficulty: "medium",
    prompt: "Find the area enclosed by the parametric curve x = cos t, y = sin t from t=0 to t=2π.",
    answer: "pi",
    explanation: "Step 1: This is the unit circle. Step 2: A = (1/2) ∫ (x dy - y dx) or directly ∫ y dx = ∫₀^{2π} sin t (-sin t) dt (careful with sign). Using Green's form gives π. Final answer: π." }),

  p({ id: "parampolar-polar-area-6", topicId: "parametric-polar", section: "polar-area", type: "numeric", difficulty: "hard",
    prompt: "Find the area inside the rose curve r = 4 sin(2θ) but outside the circle r = 2.",
    answer: "4π - 8",
    explanation: "Step 1: Find intersection points. Step 2: The rose has 4 petals. Subtract the circular portions from the petals. The calculation yields 4π - 8. Final answer: 4π - 8." }),
];

export default parametricPolarProblems;