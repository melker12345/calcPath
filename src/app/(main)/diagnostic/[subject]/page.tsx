import { notFound } from "next/navigation";
import { DiagnosticSession } from "../DiagnosticSession";
import { sampleDiagnosticQuestions } from "@/lib/assessment/diagnostic-sampling";
import { loadDiagnosticFile } from "@/lib/content/diagnostic-loader";
import { requireSubjectConfig } from "@/lib/content/loader";

// The sample is seeded with Math.random() per request; opt out of the
// full-route cache so "Retake diagnostic" gets a fresh question set.
export const dynamic = "force-dynamic";

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
  // No explicit seed: the sampler falls back to unseeded shuffling, and with
  // force-dynamic every request draws a fresh set.
  const session = sampleDiagnosticQuestions(diagnostic.questions, diagnostic.sampleSize);

  return (
    <DiagnosticSession
      targetSubject={subject}
      subjectLabel={config.label}
      prerequisites={diagnostic.prerequisites}
      questions={session.questions}
    />
  );
}