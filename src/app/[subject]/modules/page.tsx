import { notFound } from "next/navigation";
import { CourseContentsPage } from "@/components/course-contents-page";
import { getSubject } from "@/lib/subjects";
import { getFileSystemContentBundle, loadSubjectIndex } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export default async function SubjectModulesPage({ params }: Props) {
  const { subject: slug } = await params;
  let subject = getSubject(slug);
  if (!subject) {
    // Auto-discovered subject support (loader check for index.json succeeds => valid).
    try {
      const idx = await loadSubjectIndex(slug);
      subject = {
        slug: idx.slug,
        label: idx.label,
        shortDescription: idx.shortDescription,
        modulesDescription: idx.modulesDescription,
        icon: idx.icon,
        order: idx.order,
        hasTests: idx.hasTests,
        topics: [],
        problems: [],
        modules: [],
      } as any;
    } catch {
      notFound();
    }
  }

  let displayTopics = (subject as any).topics || [];
  try {
    const bundle = await getFileSystemContentBundle(slug);
    if (bundle.topics.length) displayTopics = bundle.topics;
  } catch {}

  return (
    <CourseContentsPage
      title={(subject as any).label}
      description={(subject as any).modulesDescription}
      subjectSlug={(subject as any).slug}
      topics={displayTopics}
      modules={(subject as any).modules}
    />
  );
}
