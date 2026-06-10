import type { Metadata } from "next";
import { getSubject } from "@/lib/subjects";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const s = getSubject(slug);
  let label = s?.label || slug;
  let modDesc = s?.modulesDescription || `Free step-by-step ${label} lessons.`;
  if (!s) {
    try {
      const idx = await loadSubjectIndex(slug);
      label = idx.label;
      modDesc = idx.modulesDescription;
    } catch {}
  }
  return {
    title: `${label} Modules — Free Lessons & Examples | CalcPath`,
    description: modDesc,
  };
}

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
