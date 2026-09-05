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
  const canonical = `https://calc-path.com/${slug}/modules/${topicId}`;
  const description = `Step-by-step explanation and practice for ${topicId} in ${subjectLabel}.`;
  return {
    // No manual "| CalcPath" suffix — the parent [subject] layout's title
    // template ("%s | CalcPath") appends it.
    title,
    description,
    alternates: { canonical },
    // Full openGraph block: metadata shallow-merge means a partial override
    // would drop the root's images/siteName/type/locale entirely.
    openGraph: {
      title: `${title} | CalcPath`,
      description,
      url: canonical,
      siteName: "CalcPath",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "CalcPath — Learn math step by step",
        },
      ],
      type: "website",
      locale: "en_US",
    },
  };
}

export default function TopicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}