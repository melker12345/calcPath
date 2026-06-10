import type { Metadata } from "next";
import { ProgressProvider } from "@/components/progress-provider";
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
    title: `Practice ${label} Problems | CalcPath`,
    description: `Interactive ${label} problems with step-by-step solutions.`,
  };
}

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  // AuthProvider removed (auth stripped globally); ProgressProvider kept for local progress.
  // This isolates the useProgress / MathInput graph and ensures validation/submit work for new subjects.
  return (
    <ProgressProvider>{children}</ProgressProvider>
  );
}
