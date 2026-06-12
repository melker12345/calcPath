import type {
  DiagnosticFile,
  DiagnosticPrerequisite,
  DiagnosticQuestionFile,
} from "@/lib/content/schema";
import type { SubjectSpec } from "./seed-tier1-diagnostics-types";

export function buildDiagnostic(spec: SubjectSpec): DiagnosticFile {
  const prerequisites: DiagnosticPrerequisite[] = spec.prerequisites.map(
    ({ slug: _slug, questions: _questions, ...prereq }) => prereq,
  );

  const questions: DiagnosticQuestionFile[] = [];
  for (const prereq of spec.prerequisites) {
    prereq.questions.forEach((question, index) => {
      questions.push({
        ...question,
        id: `${spec.idPrefix}${prereq.slug}-${index + 1}`,
        prerequisiteId: prereq.id,
      });
    });
  }

  return {
    targetSubject: spec.slug,
    sampleSize: 24,
    prerequisites,
    questions,
  };
}