export type ProblemType = "numeric" | "mcq";

export type Problem = {
  id: string;
  topicId: string;
  prompt: string;
  type: ProblemType;
  answer: string;
  choices?: string[];
  hint: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  level: "intro" | "intermediate" | "advanced";
  paidOnly: boolean;
  steps: Array<{ topicId: string; targetProblems: number }>;
};

export const topics: Topic[] = [
  {
    id: "limits",
    title: "Limits & Continuity",
    description: "Build intuition for approaching values and continuity.",
    order: 1,
    estimatedMinutes: 90,
  },
  {
    id: "derivatives",
    title: "Derivatives",
    description: "Compute derivatives and interpret rates of change.",
    order: 2,
    estimatedMinutes: 120,
  },
  {
    id: "applications",
    title: "Applications of Derivatives",
    description: "Optimization, related rates, and motion.",
    order: 3,
    estimatedMinutes: 110,
  },
  {
    id: "integrals",
    title: "Integrals",
    description: "Understand accumulation and compute integrals.",
    order: 4,
    estimatedMinutes: 120,
  },
  {
    id: "series",
    title: "Series & Sequences",
    description: "Analyze convergence and common series tests.",
    order: 5,
    estimatedMinutes: 120,
  },
  {
    id: "differential-equations",
    title: "Differential Equations",
    description: "Solve basic differential equations and interpret models.",
    order: 6,
    estimatedMinutes: 90,
  },
];

const range = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

const makeProblem = (problem: Problem) => problem;

const limitsProblems = range(20).map((index) => {
  const a = index + 1;
  const id = `limits-${index + 1}`;
  const prompt =
    index % 2 === 0
      ? `Compute: $\\lim_{x\\to ${a}} \\frac{x^2 - ${a ** 2}}{x-${a}}$`
      : `Evaluate: $\\lim_{x\\to 0} \\frac{\\sin(${a}x)}{x}$`;
  const answer = index % 2 === 0 ? `${2 * a}` : `${a}`;
  return makeProblem({
    id,
    topicId: "limits",
    prompt,
    type: "numeric",
    answer,
    hint: "Factor or use a small-angle identity.",
    explanation:
      index % 2 === 0
        ? "Factor the numerator as $(x-a)(x+a)$, then cancel."
        : "Use $\\lim_{x\\to 0} \\frac{\\sin(kx)}{x} = k$.",
    difficulty: index < 8 ? "easy" : index < 15 ? "medium" : "hard",
  });
});

const derivativeProblems = range(20).map((index) => {
  const power = index + 2;
  const coefficient = index % 3 === 0 ? 3 : index % 3 === 1 ? 5 : 2;
  const id = `derivatives-${index + 1}`;
  const prompt =
    index % 4 === 0
      ? `Find $\\frac{d}{dx}$ of $${coefficient}x^${power}$`
      : index % 4 === 1
        ? `Find $\\frac{d}{dx}$ of $e^{${index + 1}x}$`
        : index % 4 === 2
          ? `Find $\\frac{d}{dx}$ of $\\ln(x^${power})$`
          : `Find $\\frac{d}{dx}$ of $\\sin(${index + 1}x)$`;
  const answer =
    index % 4 === 0
      ? `${coefficient * power}x^${power - 1}`
      : index % 4 === 1
        ? `${index + 1}e^${index + 1}x`
        : index % 4 === 2
          ? `${power}/x`
          : `${index + 1}cos(${index + 1}x)`;
  return makeProblem({
    id,
    topicId: "derivatives",
    prompt,
    type: "numeric",
    answer,
    hint: "Apply the power rule, chain rule, or log rule.",
    explanation:
      index % 4 === 0
        ? "Use the power rule and multiply by the coefficient."
        : index % 4 === 1
          ? "Derivative of $e^{kx}$ is $ke^{kx}$."
          : index % 4 === 2
            ? "$\\ln(x^n) = n\\ln x$, then differentiate."
            : "Derivative of $\\sin(kx)$ is $k\\cos(kx)$.",
    difficulty: index < 8 ? "easy" : index < 15 ? "medium" : "hard",
  });
});

const applicationProblems = range(20).map((index) => {
  const id = `applications-${index + 1}`;
  const speed = 2 + index;
  const time = 1 + (index % 5);
  const prompt =
    index % 2 === 0
      ? `A particle moves with $v(t) = ${speed}t$. Find the distance traveled from $t=0$ to $t=${time}$.`
      : `A rectangle has perimeter 20. Express area as a function of width $w$ and find $w$ that maximizes area.`;
  const answer =
    index % 2 === 0
      ? `${0.5 * speed * time ** 2}`
      : "w=5";
  return makeProblem({
    id,
    topicId: "applications",
    prompt,
    type: "numeric",
    answer,
    hint: "Integrate velocity or use symmetry for max area.",
    explanation:
      index % 2 === 0
        ? "Distance is the integral of velocity: $\\int_0^t v(t) dt$."
        : "A square maximizes area for fixed perimeter.",
    difficulty: index < 8 ? "easy" : index < 15 ? "medium" : "hard",
  });
});

const integralProblems = range(20).map((index) => {
  const id = `integrals-${index + 1}`;
  const power = index + 1;
  const prompt =
    index % 3 === 0
      ? `Compute $\\int x^${power} dx$`
      : index % 3 === 1
        ? `Compute $\\int ${power}e^{${power}x} dx$`
        : `Compute $\\int \\cos(${power}x) dx$`;
  const answer =
    index % 3 === 0
      ? `x^${power + 1}/${power + 1} + C`
      : index % 3 === 1
        ? `e^${power}x + C`
        : `sin(${power}x)/${power} + C`;
  return makeProblem({
    id,
    topicId: "integrals",
    prompt,
    type: "numeric",
    answer,
    hint: "Reverse the derivative rules.",
    explanation:
      index % 3 === 0
        ? "Use the power rule for integrals."
        : index % 3 === 1
          ? "Let u = exponent, integral of e^{u} is e^{u}."
          : "Integral of cos(kx) is sin(kx)/k.",
    difficulty: index < 8 ? "easy" : index < 15 ? "medium" : "hard",
  });
});

const seriesProblems = range(20).map((index) => {
  const id = `series-${index + 1}`;
  const ratio = (index % 5) + 2;
  const prompt =
    index % 2 === 0
      ? `Determine if the geometric series $\\sum \\left(\\frac{1}{${ratio}}\\right)^n$ converges.`
      : `Find the sum of $\\sum_{n=0}^{\\infty} \\left(\\frac{1}{${ratio}}\\right)^n$`;
  const answer = index % 2 === 0 ? "converges" : `${ratio / (ratio - 1)}`;
  return makeProblem({
    id,
    topicId: "series",
    prompt,
    type: index % 2 === 0 ? "mcq" : "numeric",
    answer,
    choices:
      index % 2 === 0
        ? ["converges", "diverges"]
        : undefined,
    hint: "Geometric series converges when $|r| < 1$.",
    explanation:
      index % 2 === 0
        ? "Common ratio is $1/${ratio}$, which is $< 1$."
        : "Sum is $\\frac{1}{1-r}$.",
    difficulty: index < 8 ? "easy" : index < 15 ? "medium" : "hard",
  });
});

const differentialEquationProblems = range(20).map((index) => {
  const id = `differential-equations-${index + 1}`;
  const k = index + 1;
  const prompt =
    index % 2 === 0
      ? `Solve $\\frac{dy}{dx} = ${k}y$`
      : `Solve $\\frac{dy}{dx} = ${k}x$`;
  const answer = index % 2 === 0 ? `y=Ce^${k}x` : `y=${k}/2 x^2 + C`;
  return makeProblem({
    id,
    topicId: "differential-equations",
    prompt,
    type: "numeric",
    answer,
    hint: "Separate variables or integrate directly.",
    explanation:
      index % 2 === 0
        ? "Separate variables: $\\frac{dy}{y} = ${k} dx$, integrate."
        : "Integrate $${k}x$ with respect to $x$.",
    difficulty: index < 8 ? "easy" : index < 15 ? "medium" : "hard",
  });
});

export const problems: Problem[] = [
  ...limitsProblems,
  ...derivativeProblems,
  ...applicationProblems,
  ...integralProblems,
  ...seriesProblems,
  ...differentialEquationProblems,
];

export const learningPaths: LearningPath[] = [
  {
    id: "calc-foundations",
    title: "Calculus Foundations",
    description: "Build core skills with limits, derivatives, and integrals.",
    level: "intro",
    paidOnly: false,
    steps: [
      { topicId: "limits", targetProblems: 12 },
      { topicId: "derivatives", targetProblems: 15 },
      { topicId: "integrals", targetProblems: 15 },
    ],
  },
  {
    id: "calc-applications",
    title: "Real-World Calculus",
    description: "Master applications like optimization and modeling.",
    level: "intermediate",
    paidOnly: true,
    steps: [
      { topicId: "applications", targetProblems: 16 },
      { topicId: "differential-equations", targetProblems: 14 },
    ],
  },
  {
    id: "calc-advanced",
    title: "Advanced Topics",
    description: "Dive into series and advanced techniques.",
    level: "advanced",
    paidOnly: true,
    steps: [
      { topicId: "series", targetProblems: 18 },
      { topicId: "integrals", targetProblems: 12 },
    ],
  },
];
