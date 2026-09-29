import { notFound } from "next/navigation";
import { SubjectPracticePage } from "@/components/subject-practice-page";
import { loadSubjectFromContent, requireSubjectConfig } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export default async function PracticeIndex({ params }: Props) {
  const { subject: slug } = await params;

  let subject;
  try {
    subject = await requireSubjectConfig(slug);
  } catch {
    notFound();
  }

  // Topics + questions only (no module.mdx); the page lists chapters to practise.
  const data = await loadSubjectFromContent(slug, { includeMdxModules: false }).catch(() => null);

  return (
    <SubjectPracticePage
      subjectSlug={slug}
      subjectLabel={subject.label}
      topics={data?.topics ?? []}
      problems={data?.problems ?? []}
    />
  );
}
