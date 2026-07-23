import type { Metadata } from "next";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  let label = slug;
  let modDesc = `Free step-by-step ${label} lessons.`;
  try {
    const idx = await loadSubjectIndex(slug);
    label = idx.label;
    modDesc = idx.modulesDescription;
  } catch {
    // minimal fallback
  }
  return {
    title: `${label} Modules — Free Lessons & Examples | CalcPath`,
    description: modDesc,
  };
}

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}