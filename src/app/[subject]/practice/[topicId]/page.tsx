import Link from "next/link";
import { notFound } from "next/navigation";
import { getFileSystemContentBundle } from "@/lib/content/loader";
import { GenericPracticeExperience } from "@/components/generic-practice-experience";
import { PracticeErrorBoundary } from "@/components/practice/PracticeErrorBoundary";

interface Props {
  params: Promise<{ subject: string; topicId: string }>;
  searchParams: Promise<{ section?: string }>;
}

export default async function DynamicPracticePage({ params, searchParams }: Props) {
  const { subject: subjectSlug, topicId } = await params;
  const { section: sectionFilter } = await searchParams;

  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch {
    notFound();
  }

  const topic = bundle.topics.find((t) => t.id === topicId);
  let topicProblems = bundle.problems.filter((p) => p.topicId === topicId);
  if (sectionFilter) {
    topicProblems = topicProblems.filter((p) => p.section === sectionFilter);
  }

  if (!topic) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border theme-border bg-[var(--surface-2)] p-6">
          <p className="theme-text-secondary">Topic “{topicId}” not found in the data for {subjectSlug}.</p>
          <Link href={`/${subjectSlug}`} className="mt-4 inline-block text-[var(--accent)] hover:underline">← Browse topics</Link>
        </div>
      </main>
    );
  }

  if (topicProblems.length === 0) {
    const label = bundle.config.label;
    return (
      <main className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border theme-border bg-[var(--surface-2)] p-6">
          <div className="mb-3 inline-flex items-center rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium tracking-wider theme-text-muted">
            PRACTICE — {subjectSlug.toUpperCase()}
          </div>
          <h1 className="text-2xl font-semibold theme-text">{topic.title}</h1>
          <p className="mt-3 text-base theme-text-secondary">
            No practice questions are available for this topic yet.
          </p>
          <p className="mt-2 text-sm theme-text-muted">
            This is an intentional “not yet” state while we expand practice for this topic. The full explanation is ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href={`/${subjectSlug}/modules/${topicId}`} className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2 font-medium text-white transition hover:opacity-90 active:scale-[0.985]">
              View the explanation →
            </Link>
            <Link href={`/${subjectSlug}`} className="inline-flex items-center justify-center rounded-lg border theme-border px-5 py-2 font-medium theme-text-muted transition hover:bg-[var(--surface)] hover:text-[var(--accent)]">
              ← Back to {label}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Compute next topic in subject order for the "go to next after complete" button in mastered state.
  // Always uses full topic order (even if ?section= filtered the current problems).
  const orderedTopics = [...bundle.topics].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const currentIdx = orderedTopics.findIndex((t) => t.id === topicId);
  const nextTopic = currentIdx >= 0 && currentIdx < orderedTopics.length - 1 ? orderedTopics[currentIdx + 1] : null;

  // Use the generic experience (supports MathInput, usePracticeSession, hints, etc. purely from bundle data)
  return (
    <PracticeErrorBoundary subjectSlug={subjectSlug} topicId={topicId}>
      <GenericPracticeExperience
        subjectSlug={subjectSlug}
        topic={topic}
        problems={topicProblems}
        subjectLabel={bundle.config.label}
        nextTopic={nextTopic ? { id: nextTopic.id, title: nextTopic.title } : undefined}
      />
    </PracticeErrorBoundary>
  );
}
