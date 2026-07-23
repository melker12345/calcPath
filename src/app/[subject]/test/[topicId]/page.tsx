import { getFileSystemContentBundle } from "@/lib/content/loader";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import type { Topic } from "@/lib/shared-types";
import type { TestQuestion } from "@/lib/test-questions";
import { getTestQuestionsForTopic } from "@/lib/test-questions";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = {
  params: Promise<{ subject: string; topicId: string }>;
};

const TestClient = dynamic(
  () => import("./TestClient"),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="text-sm text-zinc-500">Loading test…</div>
      </div>
    ),
  }
);

export default async function SubjectTestPage({ params }: Props) {
  const { subject: slug, topicId } = await params;

  let hasTests = false;
  try {
    const idx = await loadSubjectIndex(slug);
    hasTests = idx.hasTests ?? false;
  } catch {
    notFound();
  }
  if (!hasTests) {
    notFound();
  }

  let topic: Topic | null = null;
  try {
    const bundle = await getFileSystemContentBundle(slug);
    topic = bundle.topics.find((t) => t.id === topicId) ?? null;
  } catch (err) {
    console.error("Failed to load test topic", err);
  }

  if (!topic) {
    notFound();
  }

  const allTestQuestions: TestQuestion[] = getTestQuestionsForTopic(topicId);

  // If hasTests is true but no test questions exist for the topic (e.g. new subject or
  // calculus topic without pool yet), we pass [] to TestClient which renders a graceful
  // "No test questions available for this topic." message + link back (does not crash or 404 the topic).
  // notFound() would also be valid here per task, but message preserves UX parity for partial data.
  // topic tests currently only have data for subjects where test question pools exist in lib/test-questions.ts; new subjects can set hasTests:true in their content/*/index.json once data is provided.
  return (
    <TestClient
      subjectSlug={slug}
      topicId={topicId}
      topic={topic}
      allTestQuestions={allTestQuestions}
    />
  );
}
