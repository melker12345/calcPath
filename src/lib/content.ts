import { limitsProblems } from "./calculus-questions/limits";
import { derivativeProblems } from "./calculus-questions/derivatives";
import { applicationProblems } from "./calculus-questions/applications";
import { integralProblems } from "./calculus-questions/integrals";
import { seriesProblems } from "./calculus-questions/series";
import { differentialEquationProblems } from "./calculus-questions/differential-equations";
import { appIntProblems } from "./calculus-questions/applications-of-integration";
import { multivariableProblems } from "./calculus-questions/multivariable";

export type ProblemType = "numeric" | "mcq";

export type Problem = {
  id: string;
  topicId: string;
  section: string;
  prompt: string;
  type: ProblemType;
  answer: string;
  choices?: string[];
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
  {
    id: "applications-of-integration",
    title: "Applications of Integration",
    description: "Areas, volumes, arc length, and parametric curves.",
    order: 7,
    estimatedMinutes: 110,
  },
  {
    id: "multivariable",
    title: "Multivariable & Vector Calculus",
    description: "Partial derivatives, multiple integrals, and vector fields.",
    order: 8,
    estimatedMinutes: 150,
  },
];

export const problems: Problem[] = [
  ...limitsProblems,
  ...derivativeProblems,
  ...applicationProblems,
  ...integralProblems,
  ...seriesProblems,
  ...differentialEquationProblems,
  ...appIntProblems,
  ...multivariableProblems,
];

export const learningPaths: LearningPath[] = [
  {
    id: "calc-foundations",
    title: "Calculus Foundations",
    description: "Build core skills with limits, derivatives, and integrals.",
    level: "intro",
    steps: [
      { topicId: "limits", targetProblems: 20 },
      { topicId: "derivatives", targetProblems: 25 },
      { topicId: "integrals", targetProblems: 25 },
    ],
  },
  {
    id: "calc-applications",
    title: "Real-World Calculus",
    description: "Master applications like optimization and modeling.",
    level: "intermediate",
    steps: [
      { topicId: "applications", targetProblems: 25 },
      { topicId: "differential-equations", targetProblems: 20 },
    ],
  },
  {
    id: "calc-advanced",
    title: "Advanced Topics",
    description: "Dive into series and advanced techniques.",
    level: "advanced",
    steps: [
      { topicId: "series", targetProblems: 25 },
      { topicId: "integrals", targetProblems: 20 },
    ],
  },
];
