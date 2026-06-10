import type { Metadata } from "next";
import { getSubject } from "@/lib/subjects";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const s = getSubject(slug);
  let label = s?.label || slug;
  if (!s) {
    try {
      const idx = await loadSubjectIndex(slug);
      label = idx.label;
    } catch {}
  }
  return {
    title: `Topic Test — ${label} | CalcPath`,
    description: `Timed topic test for ${label}.`,
  };
}

export default function TestLayout({ children }: { children: React.ReactNode }) {
  // Providers supplied inside the dynamic client (same pattern as concrete calc test + practice).
  return <>{children}</>;
}
