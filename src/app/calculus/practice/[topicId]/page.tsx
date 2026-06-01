import { getFileSystemContentBundle } from "@/lib/content/loader";
import dynamic from "next/dynamic";
import type { Problem } from "@/lib/shared-types";
import type { Topic } from "@/lib/shared-types";

// Dynamic import with ssr:false for the rich practice client.
// This isolates the ProgressProvider / useProgress / MathInput / answer-check graph
// (plus any transitive modules) into a separate client chunk. It prevents the recurring
// Turbopack "topics is not defined" module-evaluation error that occurs when the progress
// system ends up in the same initial chunk as any remaining legacy shim references on
// real production routes. The feature set (full MathInput, progression via addAttempt,
// hints, solutions, ProgressDots, etc.) is 100% preserved — it just loads after hydration.
const PracticeTopicClient = dynamic(
  () => import("./PracticeTopicClient"),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="text-sm text-zinc-500">Loading practice session…</div>
      </div>
    ),
  }
);

type Props = {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ section?: string; focus?: string }>;
};

export default async function PracticeTopicPage({ params, searchParams }: Props) {
  const { topicId } = await params;
  const { section: sectionFilter, focus: focusId } = await searchParams;

  // Load from new data-driven system (the goal)
  let allProblems: Problem[] = [];
  let topic: Topic | undefined;

  try {
    const bundle = await getFileSystemContentBundle("calculus");
    allProblems = bundle.problems.filter((p) => p.topicId === topicId);
    topic = bundle.topics.find((t) => t.id === topicId);
  } catch (err) {
    console.error("Failed to load practice data from new system", err);
  }

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-zinc-600">Topic not found.</p>
        <a className="btn-secondary mt-4 inline-flex" href="/calculus">
          Back to Calculus
        </a>
      </div>
    );
  }

  const topicProblems = allProblems.filter((p) =>
    sectionFilter ? p.section === sectionFilter : true
  );

  if (sectionFilter && topicProblems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold">No questions for this section yet</h1>
        <p className="mt-2 text-zinc-600">We're still adding practice questions for this specific part of the chapter.</p>
        <a href={`/calculus/modules/${topicId}`} className="mt-4 inline-flex text-[var(--accent)] hover:underline">
          Practice the full {topic.title} chapter instead →
        </a>
      </div>
    );
  }

  return (
    <PracticeTopicClient
      topicId={topicId}
      topic={topic}
      topicProblems={topicProblems}
      sectionFilter={sectionFilter}
      focusId={focusId}
    />
  );
}
