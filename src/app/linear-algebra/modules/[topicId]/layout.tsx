import type { Metadata } from "next";
import type { ModuleContent } from "@/lib/modules/types";
import * as linalgModules from "@/lib/modules/linear-algebra";

const legacyModules: ModuleContent[] = (Object.values(linalgModules) as any[]).filter(
  (v): v is ModuleContent => !!v && typeof v === "object" && typeof v.topicId === "string"
);

type Props = {
  params: Promise<{ topicId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  const mod = legacyModules.find((m) => m.topicId === topicId);

  // Topics from new content system (loadSubjectIndex) for correct `id`s (bypasses inert shim).
  let topic: any = null;
  try {
    const { loadSubjectIndex } = await import("@/lib/content/loader");
    const idx = await loadSubjectIndex("linear-algebra");
    topic = idx.topics?.find((t: any) => t.id === topicId) ?? null;
  } catch {
    // fallback (guard will fail gracefully)
  }

  if (!mod || !topic) {
    return { title: "Module Not Found | CalcPath" };
  }

  return {
    title: `${topic.title} — Free Linear Algebra Lesson | CalcPath`,
    description: `${topic.description} Free step-by-step module with worked examples and practice problems.`,
  };
}

export default function ModuleTopicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
