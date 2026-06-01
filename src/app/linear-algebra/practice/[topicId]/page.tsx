import { getFileSystemContentBundle } from "@/lib/content/loader";
import dynamic from "next/dynamic";
import type { Topic, Problem } from "@/lib/shared-types";

type Props = {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ focus?: string }>;
};

const PracticeClient = dynamic(
  () => import("./PracticeClient"),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="text-sm text-stone-500">Loading practice…</div>
      </div>
    ),
  }
);

export default async function LinearAlgebraPracticeTopicPage({ params, searchParams }: Props) {
  const { topicId } = await params;
  const sp = await (searchParams ?? Promise.resolve({}));
  const focusId = sp.focus ?? null;

  let topic: Topic | null = null;
  let topicProblems: Problem[] = [];

  try {
    const bundle = await getFileSystemContentBundle("linear-algebra");
    topic = bundle.topics.find((t) => t.id === topicId) ?? null;
    topicProblems = bundle.problems.filter((p) => p.topicId === topicId);
  } catch (err) {
    console.error("Failed to load LA practice data from new system", err);
  }

  return (
    <PracticeClient
      topicId={topicId}
      topic={topic}
      topicProblems={topicProblems}
      focusId={focusId}
    />
  );
}
