import type { Metadata } from "next";
import { modules as legacyModules } from "@/lib/statistics-modules";
import { topics as legacyTopics } from "@/lib/statistics-content";

type Props = {
  params: Promise<{ topicId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  let mod = legacyModules.find((m) => m.topicId === topicId);
  let topic = legacyTopics.find((t) => t.id === topicId);

  // Evolutionary: source topic metadata from new content/ system when available.
  // (Uses loader directly; adapter not needed for titles/descriptions.)
  // Also ensures the existence guard passes for new topics (legacyModules is now inert stub).
  // Reversible: remove the try block.
  try {
    const { getFileSystemContentBundle } = await import("@/lib/content/loader");
    const bundle = await getFileSystemContentBundle("statistics");
    const fromNew = bundle.topics.find((t) => t.id === topicId);
    if (fromNew) {
      topic = fromNew;
      if (!mod) {
        mod = { topicId } as any; // existence proxy only; page supplies real ModuleContent via adapter
      }
    }
  } catch {
    // fallback to legacy* shims
  }

  if (!mod || !topic) {
    return { title: "Module Not Found | CalcPath" };
  }

  return {
    title: `${topic.title} — Free Statistics Lesson | CalcPath`,
    description: `${topic.description} Free step-by-step module with worked examples and practice problems.`,
  };
}

export default function ModuleTopicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
