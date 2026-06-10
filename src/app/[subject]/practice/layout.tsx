import type { Metadata } from "next";
import { ProgressProvider } from "@/components/progress-provider";
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
    title: `Practice ${label} Problems | CalcPath`,
    description: `Interactive ${label} problems with step-by-step solutions.`,
  };
}

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}