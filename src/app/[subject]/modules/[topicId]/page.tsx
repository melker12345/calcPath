import { notFound } from "next/navigation";
import { SubjectModulePage } from "@/components/subject-module-page";
import type { ModuleContent } from "@/lib/modules";
import type { Problem, Topic } from "@/lib/shared-types";
import { getFileSystemContentBundle, requireSubjectConfig } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string; topicId: string }> };

export default async function SubjectModulePageRoute({ params }: Props) {
  const { subject: slug, topicId } = await params;
  let subjectLabel: string;
  try {
    const subject = await requireSubjectConfig(slug);
    subjectLabel = subject.label;
  } catch {
    notFound();
  }

  let modules: ModuleContent[] = [];
  let topics: Topic[] = [];
  let topicProblems: Problem[] = [];
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
    topicProblems = bundle.problems.filter((p) => p.topicId === topicId);
  } catch {
    // will show not found in component; print gracefully falls back to text-only
  }

  return (
    <SubjectModulePage
      subjectSlug={slug}
      subjectLabel={subjectLabel}
      modules={modules}
      topics={topics}
      problems={topicProblems}
      faqs={{}} // generic; per-topic faqs can be added later if needed
    />
  );
}
