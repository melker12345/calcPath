import type { Metadata } from "next";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  let label = slug;
  try {
    const idx = await loadSubjectIndex(slug);
    label = idx.label;
  } catch {
    // minimal fallback
  }
  return {
    title: `Topic Test — ${label} | CalcPath`,
    description: `Timed topic test for ${label}.`,
  };
}

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}