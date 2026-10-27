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
  // Pages below set absolute titles and their own canonical/Open Graph via
  // pageMetadata; this is only the fallback.
  return {
    title: { default: `Problem Sets — ${label} | CalcPath`, template: "%s | CalcPath" },
    description: `Printable ${label.toLowerCase()} problem sets, with full worked solutions.`,
  };
}

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
