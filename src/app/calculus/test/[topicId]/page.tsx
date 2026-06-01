import { getFileSystemContentBundle } from "@/lib/content/loader";
import dynamic from "next/dynamic";
import type { Topic } from "@/lib/shared-types";
import type { TestQuestion } from "@/lib/test-questions";
import { getTestQuestionsForTopic } from "@/lib/test-questions";

type Props = {
  params: Promise<{ topicId: string }>;
};

const TestClient = dynamic(
  () => import("./TestClient"),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="text-sm text-zinc-500">Loading test…</div>
      </div>
    ),
  }
);

export default async function TopicTestPage({ params }: Props) {
  const { topicId } = await params;

  let topic: Topic | null = null;
  try {
    const bundle = await getFileSystemContentBundle("calculus");
    topic = bundle.topics.find((t) => t.id === topicId) ?? null;
  } catch (err) {
    console.error("Failed to load test topic from new system", err);
  }

  const allTestQuestions: TestQuestion[] = getTestQuestionsForTopic(topicId);

  return (
    <TestClient
      topicId={topicId}
      topic={topic}
      allTestQuestions={allTestQuestions}
    />
  );
}
