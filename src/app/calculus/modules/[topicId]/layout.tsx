import type { Metadata } from "next";
import { modules } from "@/lib/modules";
import { topics } from "@/lib/calculus-content";

type Props = {
  params: Promise<{ topicId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  const mod = modules.find((m) => m.topicId === topicId);
  const topic = topics.find((t) => t.id === topicId);

  if (!mod || !topic) {
    return { title: "Module Not Found | CalcPath" };
  }

  const title = `${topic.title} — Free Calculus Lesson | CalcPath`;
  const description = `${topic.description} Free step-by-step module with worked examples, common mistakes, and practice problems.`;

  return {
    title,
    description,
    openGraph: {
      title: `${topic.title} | CalcPath`,
      description,
      url: `https://calc-path.com/calculus/modules/${topicId}`,
    },
  };
}

export default function ModuleTopicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
