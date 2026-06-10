import type { Metadata } from "next";
import { getSubject } from "@/lib/subjects";

type Props = {
  params: Promise<{ subject: string; topicId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug, topicId } = await params;
  const s = getSubject(slug);
  let label = s?.label || slug;
  try {
    const { loadSubjectIndex } = await import("@/lib/content/loader");
    const idx = await loadSubjectIndex(slug);
    const t = idx.topics?.find((x: any) => x.id === topicId);
    if (t) label = `${idx.label} — ${t.title}`;
  } catch {}
  return {
    title: `${label} | CalcPath`,
    description: `Step-by-step explanation and practice for ${topicId} in ${s?.label || slug}.`,
    alternates: { canonical: `https://calc-path.com/${slug}/modules/${topicId}` },
  };
}

export default function TopicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
