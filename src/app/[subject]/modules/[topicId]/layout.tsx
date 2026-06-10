import type { Metadata } from "next";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = {
  params: Promise<{ subject: string; topicId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug, topicId } = await params;
  let title = slug;
  let subjectLabel = slug;
  try {
    const idx = await loadSubjectIndex(slug);
    subjectLabel = idx.label;
    const topic = idx.topics.find((t) => t.id === topicId);
    title = topic ? `${idx.label} — ${topic.title}` : idx.label;
  } catch {
    // minimal fallback
  }
  return {
    title: `${title} | CalcPath`,
    description: `Step-by-step explanation and practice for ${topicId} in ${subjectLabel}.`,
    alternates: { canonical: `https://calc-path.com/${slug}/modules/${topicId}` },
  };
}

export default function TopicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}