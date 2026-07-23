import type {
  DiagnosticFile,
  DiagnosticPrerequisite,
  DiagnosticQuestionFile,
} from "@/lib/content/schema";
import { expandExplanation } from "./expand-diagnostic-explanations";
import type { SubjectSpec } from "./seed-tier1-diagnostics-types";

export function buildDiagnostic(spec: SubjectSpec): DiagnosticFile {
  const prerequisites: DiagnosticPrerequisite[] = spec.prerequisites.map(
    ({ slug: _slug, questions: _questions, ...prereq }) => prereq,
  );

  const questions: DiagnosticQuestionFile[] = [];
  for (const prereq of spec.prerequisites) {
    prereq.questions.forEach((question, index) => {
      const built = {
        ...question,
        id: `${spec.idPrefix}${prereq.slug}-${index + 1}`,
        prerequisiteId: prereq.id,
      };
      const expanded = expandExplanation(built);
      questions.push(expanded ? { ...built, explanation: expanded } : built);
    });
  }

  return {
    targetSubject: spec.slug,
    sampleSize: 24,
    prerequisites,
    questions,
  };
}