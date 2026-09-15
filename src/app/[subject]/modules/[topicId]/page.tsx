import { notFound, redirect } from "next/navigation";
import { SubjectModulePage } from "@/components/subject-module-page";
import type { ModuleContent } from "@/lib/modules";
import type { Problem, Topic } from "@/lib/shared-types";
import { getFileSystemContentBundle, loadSubjectIndex, requireSubjectConfig } from "@/lib/content/loader";
import { getLegacyTopicRedirect } from "@/lib/content/legacy-topic-redirects";
import { getSectionHref } from "@/lib/subject-urls";

type Props = { params: Promise<{ subject: string; topicId: string }> };

export default async function SubjectModulePageRoute({ params }: Props) {
  const { subject: slug, topicId } = await params;

  const legacy = await getLegacyTopicRedirect(slug, topicId);
  if (legacy) {
    redirect(getSectionHref(slug, legacy.chapterId, legacy.section));
  }
  let subjectLabel: string;
  try {
    const subject = await requireSubjectConfig(slug);
    subjectLabel = subject.label;
  } catch {
    notFound();
  }

  // Only THIS chapter's prose crosses to the client. Handing the page every
  // chapter of the subject put all of them in the RSC payload — the reader of
  // one 11k-word chapter was downloading the other eleven too, which at
  // textbook depth is megabytes of text they never see.
  let modules: ModuleContent[] = [];
  let topics: Topic[] = [];
  let topicProblems: Problem[] = [];
  try {
    const { getLegacyModuleContentForTopic } = await import("@/lib/content/adapters");
    const lessonModule = await getLegacyModuleContentForTopic(slug, topicId);
    if (lessonModule) modules = [lessonModule];
    // Titles and order only, for the chapter number and the prev/next links.
    // The subject index carries exactly the Topic fields those need, with none
    // of the chapter bodies.
    const index = await loadSubjectIndex(slug);
    topics = [...index.topics].sort((a, b) => a.order - b.order);
    // Problems for this topic so the print button can offer a "Text + Questions"
    // worksheet and render a print-only list of prompts.
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
