import Link from "next/link";
import { notFound } from "next/navigation";
import { getFileSystemContentBundle } from "@/lib/content/loader";
import { GenericPracticeExperience } from "@/components/generic-practice-experience";

interface Props {
  params: Promise<{ subject: string; topicId: string }>;
}

/**
 * Generic dynamic practice page under experimental /x/.
 * Server component loads *only* from FileSystemContentBundle (new data).
 * Then delegates entirely to <GenericPracticeExperience> which proves the reusable UI.
 *
 * This + the module viewer + browse page complete the "browse → explanation → practice" loop using purely new content.
 */
export default async function DynamicPracticePage({ params }: Props) {
  const { subject: subjectSlug, topicId } = await params;

  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch {
    notFound();
  }

  const topic = bundle.topics.find((t) => t.id === topicId);
  const topicProblems = bundle.problems.filter((p) => p.topicId === topicId);

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="theme-text-secondary">Topic “{topicId}” not found in the data for {subjectSlug}.</p>
        <Link href={`/x/${subjectSlug}`} className="mt-4 block text-sm text-[var(--accent)] hover:underline">← Browse topics</Link>
      </div>
    );
  }

  if (topicProblems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-xl font-semibold theme-text">{topic.title}</h1>
        <p className="mt-2 theme-text-secondary">This topic has no practice questions in the current <code>content/</code> data yet.</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href={`/x/${subjectSlug}/modules/${topicId}`} className="text-[var(--accent)] hover:underline">View the explanation instead →</Link>
          <Link href={`/x/${subjectSlug}`} className="theme-text-muted hover:text-[var(--accent)]">← Back to all topics</Link>
        </div>
      </div>
    );
  }

  return (
    <GenericPracticeExperience
      topic={topic}
      problems={bundle.problems} // pass full; component filters safely
      subjectSlug={subjectSlug}
      subjectLabel={bundle.config.label}
      subjectIcon={bundle.config.icon}
    />
  );
}
