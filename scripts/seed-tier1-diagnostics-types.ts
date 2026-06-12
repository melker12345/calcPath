import type {
  DiagnosticPrerequisite,
  DiagnosticQuestionFile,
} from "@/lib/content/schema";

export type QuestionSeed = Omit<DiagnosticQuestionFile, "id" | "prerequisiteId">;

export type PrereqSpec = DiagnosticPrerequisite & {
  slug: string;
  questions: QuestionSeed[];
};

export type SubjectSpec = {
  slug: string;
  idPrefix: string;
  prerequisites: PrereqSpec[];
};