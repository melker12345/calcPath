import { notFound } from "next/navigation";
import { DiagnosticSession } from "../DiagnosticSession";
import { sampleDiagnosticQuestions } from "@/lib/assessment/diagnostic-sampling";
import { loadDiagnosticFile } from "@/lib/content/diagnostic-loader";
import { requireSubjectConfig } from "@/lib/content/loader";

type PageProps = {
  params: Promise<{ subject: string }>;
};

export default async function SubjectDiagnosticPage({ params }: PageProps) {
  const { subject } = await params;

  let diagnostic;
  try {
    diagnostic = await loadDiagnosticFile(subject);
  } catch {
    notFound();
  }

  if (diagnostic.targetSubject !== subject) {
    notFound();
  }

  const config = await requireSubjectConfig(subject);
  const seed = Math.floor(Math.random() * 2 ** 31);
  const session = sampleDiagnosticQuestions(diagnostic.questions, diagnostic.sampleSize, seed);

  return (
    <DiagnosticSession
      targetSubject={subject}
      subjectLabel={config.label}
      prerequisites={diagnostic.prerequisites}
      questions={session.questions}
    />
  );
}