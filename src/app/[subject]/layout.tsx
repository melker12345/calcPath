import type { Metadata } from "next";
import { CourseLayout } from "@/components/course-layout";
import { subjectBodyFont, subjectHeadingFont } from "@/lib/subject-fonts";
import { getAvailableSubjectConfigs, loadSubjectIndex } from "@/lib/content/loader";

type Props = {
  params: Promise<{ subject: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  let label = slug;
  let desc = `Learn ${label} for free.`;
  let keywords: string[] | undefined;
  let ogTitle: string | undefined;
  let ogDesc: string | undefined;
  const canonical = `https://calc-path.com/${slug}`;

  try {
    const idx = await loadSubjectIndex(slug);
    label = idx.label;
    desc = idx.shortDescription;
    keywords = idx.keywords;
    ogTitle = idx.ogTitle;
    ogDesc = idx.ogDescription;
  } catch {
    // subject not found — minimal metadata
  }

  const meta: Metadata = {
    title: {
      default: `Learn ${label} — Free University Course | CalcPath`,
      template: "%s | CalcPath",
    },
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: ogTitle || `Learn ${label} — Free | CalcPath`,
      description: ogDesc || desc,
      url: canonical,
    },
  };
  if (keywords && keywords.length > 0) {
    meta.keywords = keywords;
  }
  return meta;
}

export default async function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subjectConfigs = await getAvailableSubjectConfigs();
  const navSubjects = subjectConfigs.map((s) => ({
    slug: s.slug,
    label: s.label,
    icon: s.icon,
    category: s.category,
    order: s.order,
  }));

  return (
    <div className={`${subjectHeadingFont.variable} ${subjectBodyFont.variable}`}>
      <CourseLayout navSubjects={navSubjects}>{children}</CourseLayout>
    </div>
  );
}