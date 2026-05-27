export type DiagnosticSkillGroup = "foundations" | "calculus";
export type DiagnosticStatus = "strong" | "ready" | "needs-review" | "weak" | "not-tested";

export type DiagnosticSkill = {
  id: string;
  label: string;
  group: DiagnosticSkillGroup;
  description: string;
  reviewHref?: string;
};

export type DiagnosticQuestion = {
  id: string;
  skillId: string;
  subject: DiagnosticSkillGroup;
  topicId?: string;
  prompt: string;
  type: "numeric" | "mcq";
  answer: string;
  choices?: string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export const diagnosticSkills: DiagnosticSkill[] = [
  {
    id: "function-notation",
    label: "Function notation",
    group: "foundations",
    description: "Evaluate and interpret expressions like f(2), f(x + 1), and function outputs.",
    reviewHref: "/calculus/modules/limits",
  },
  {
    id: "algebra-manipulation",
    label: "Algebra manipulation",
    group: "foundations",
    description: "Simplify expressions, factor common patterns, and cancel valid factors.",
    reviewHref: "/calculus/modules/limits",
  },
  {
    id: "graph-reading",
    label: "Graph reading",
    group: "foundations",
    description: "Read values, trends, holes, and approaching behavior from graphs or tables.",
    reviewHref: "/calculus/modules/limits",
  },
  {
    id: "exponents-logs",
    label: "Exponents and logs",
    group: "foundations",
    description: "Use exponent and logarithm rules that appear throughout calculus.",
    reviewHref: "/calculus/modules/differential-equations",
  },
  {
    id: "limits-intuition",
    label: "Limits intuition",
    group: "calculus",
    description: "Understand what a function approaches, even when the function value is missing.",
    reviewHref: "/calculus/modules/limits",
  },
  {
    id: "continuity",
    label: "Continuity",
    group: "calculus",
    description: "Decide when a function is continuous and identify removable breaks.",
    reviewHref: "/calculus/modules/limits",
  },
];

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "diag-fn-1",
    skillId: "function-notation",
    subject: "foundations",
    prompt: "If $f(x)=2x+3$, what is $f(4)$?",
    type: "numeric",
    answer: "11",
    explanation: "Substitute $x=4$: $f(4)=2(4)+3=11$.",
    difficulty: "easy",
  },
  {
    id: "diag-fn-2",
    skillId: "function-notation",
    subject: "foundations",
    prompt: "If $g(x)=x^2-1$, what is $g(3)$?",
    type: "numeric",
    answer: "8",
    explanation: "$g(3)=3^2-1=8$.",
    difficulty: "easy",
  },
  {
    id: "diag-algebra-1",
    skillId: "algebra-manipulation",
    subject: "foundations",
    prompt: "Simplify $\\frac{x^2-9}{x-3}$ for $x\\ne 3$.",
    type: "numeric",
    answer: "x+3",
    explanation: "Factor $x^2-9$ as $(x-3)(x+3)$, then cancel $x-3$.",
    difficulty: "medium",
  },
  {
    id: "diag-algebra-2",
    skillId: "algebra-manipulation",
    subject: "foundations",
    prompt: "Factor $x^2+5x+6$.",
    type: "mcq",
    answer: "$(x+2)(x+3)$",
    choices: ["$(x+1)(x+6)$", "$(x+2)(x+3)$", "$(x-2)(x-3)$", "$x(x+5)+6$"],
    explanation: "The numbers $2$ and $3$ multiply to $6$ and add to $5$.",
    difficulty: "medium",
  },
  {
    id: "diag-graph-1",
    skillId: "graph-reading",
    subject: "foundations",
    prompt: "A table shows $f(x)$ values near $5$ as $x$ approaches $2$. What is the likely limit?",
    type: "numeric",
    answer: "5",
    explanation: "The outputs approach $5$ from both sides, so the limit is likely $5$.",
    difficulty: "easy",
  },
  {
    id: "diag-graph-2",
    skillId: "graph-reading",
    subject: "foundations",
    prompt: "If the left side approaches $4$ and the right side approaches $7$, does the two-sided limit exist?",
    type: "mcq",
    answer: "No",
    choices: ["Yes", "No", "Only if f(a)=4", "Only if f(a)=7"],
    explanation: "A two-sided limit exists only when both one-sided limits agree.",
    difficulty: "easy",
  },
  {
    id: "diag-exp-1",
    skillId: "exponents-logs",
    subject: "foundations",
    prompt: "Simplify $e^{a+b}$.",
    type: "mcq",
    answer: "$e^a e^b$",
    choices: ["$e^a+e^b$", "$e^a e^b$", "$e^{ab}$", "$a+b$"],
    explanation: "Exponents add when multiplying like bases: $e^{a+b}=e^a e^b$.",
    difficulty: "medium",
  },
  {
    id: "diag-exp-2",
    skillId: "exponents-logs",
    subject: "foundations",
    prompt: "What is $\\ln(e^3)$?",
    type: "numeric",
    answer: "3",
    explanation: "$\\ln$ and $e$ are inverse operations, so $\\ln(e^3)=3$.",
    difficulty: "easy",
  },
  {
    id: "diag-limits-1",
    skillId: "limits-intuition",
    subject: "calculus",
    topicId: "limits",
    prompt: "Compute $\\lim_{x\\to 3}(2x+1)$.",
    type: "numeric",
    answer: "7",
    explanation: "This function is continuous, so substitute $x=3$: $2(3)+1=7$.",
    difficulty: "easy",
  },
  {
    id: "diag-limits-2",
    skillId: "limits-intuition",
    subject: "calculus",
    topicId: "limits",
    prompt: "Compute $\\lim_{x\\to 3}\\frac{x^2-9}{x-3}$.",
    type: "numeric",
    answer: "6",
    explanation: "Simplify to $x+3$ for $x\\ne 3$, then substitute $x=3$ to get $6$.",
    difficulty: "medium",
  },
  {
    id: "diag-cont-1",
    skillId: "continuity",
    subject: "calculus",
    topicId: "limits",
    prompt: "For $f$ to be continuous at $x=a$, which statement must be true?",
    type: "mcq",
    answer: "$\\lim_{x\\to a} f(x)=f(a)$",
    choices: [
      "f(a) must be zero",
      "$\\lim_{x\\to a} f(x)=f(a)$",
      "The left limit can differ from the right limit",
      "f(a) does not need to exist",
    ],
    explanation: "Continuity requires the limit to exist and equal the actual function value.",
    difficulty: "easy",
  },
  {
    id: "diag-cont-2",
    skillId: "continuity",
    subject: "calculus",
    topicId: "limits",
    prompt: "A function has a hole at $x=2$, but the graph approaches $5$ from both sides. Is it continuous at $x=2$?",
    type: "mcq",
    answer: "No",
    choices: ["Yes", "No", "Only if the limit is 0", "Only if the graph is increasing"],
    explanation: "A hole means the function value is missing or mismatched, so it is not continuous there.",
    difficulty: "easy",
  },
];

export const limitsReadinessQuestionIds = [
  "diag-fn-1",
  "diag-algebra-1",
  "diag-graph-1",
  "diag-limits-1",
  "diag-cont-1",
];
