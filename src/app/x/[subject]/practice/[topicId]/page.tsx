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
      <div className="mx-auto max-w-3xl p-8">
        Topic “{topicId}” not found in the data for {subjectSlug}.
        <a href={`/x/${subjectSlug}`} className="mt-4 block underline">Browse topics</a>
      </div>
    );
  }

  if (topicProblems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-xl font-semibold">{topic.title}</h1>
        <p className="mt-2">This topic has no practice questions in the current content/ data yet.</p>
        <a href={`/x/${subjectSlug}/modules/${topicId}`} className="mt-3 inline-block text-blue-700 underline">View the explanation instead →</a>
        <a href={`/x/${subjectSlug}`} className="mt-2 block underline">Back to all topics</a>
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
