/**
 * Shared types used across all subjects (Calculus, Linear Algebra, Statistics).
 * Every subject's content file and every question file imports from here.
 */

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
