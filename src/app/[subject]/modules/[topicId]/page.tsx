import { notFound } from "next/navigation";
import { SubjectModulePage } from "@/components/subject-module-page";
import type { ModuleContent } from "@/lib/modules";
import type { Topic } from "@/lib/shared-types";
import { getSubject } from "@/lib/subjects";
import { loadSubjectIndex, getFileSystemContentBundle } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string; topicId: string }> };

export default async function SubjectModulePageRoute({ params }: Props) {
  const { subject: slug, topicId } = await params;
  let subject = getSubject(slug);
  if (!subject) {
    // Support auto-discovered subjects for the guard (loader success = content exists).
    try {
      const idx = await loadSubjectIndex(slug);
      subject = { label: idx.label, slug: idx.slug } as any;
    } catch {
      notFound();
    }
  }

  let modules: ModuleContent[] = [];
  let topics: Topic[] = [];
  let topicProblems: any[] = [];
  try {
    const { getLegacyModulesAndTopicsForSubject } = await import("@/lib/content/adapters");
    const data = await getLegacyModulesAndTopicsForSubject(slug);
    if (data) {
      modules = data.modules;
      topics = data.topics;
    }
    // Load problems for this topic so the (restored) print button can offer "Text + Questions" worksheet
    // and render a clean print-only list of prompts (works for all subjects, not just legacy calculus).
    const bundle = await getFileSystemContentBundle(slug);
    topicProblems = bundle.problems.filter((p: any) => p.topicId === topicId);
  } catch {
    // will show not found in component; print gracefully falls back to text-only
  }

  return (
    <SubjectModulePage
      subjectSlug={slug}
      subjectLabel={(subject as any).label}
      modules={modules}
      topics={topics}
      problems={topicProblems}
      faqs={{}} // generic; per-topic faqs can be added later if needed
    />
  );
}
