import type { Metadata } from "next";
import { CourseLayout } from "@/components/course-layout";
import { subjectBodyFont, subjectHeadingFont } from "@/lib/subject-fonts";
import { getAvailableSubjectConfigs, loadSubjectIndex } from "@/lib/content/loader";
import { getThemeForSubject } from "@/lib/themes";

type Props = {
  params: Promise<{ subject: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  let label = slug;
  let desc = `Learn ${label} for free.`;
  let keywords: string[] | undefined;

  try {
    const idx = await loadSubjectIndex(slug);
    label = idx.label;
    desc = idx.shortDescription;
    keywords = idx.keywords;
  } catch {
    // subject not found — minimal metadata
  }

  // IMPORTANT: no `alternates`/`openGraph` here. Layout metadata is inherited
  // verbatim by every child route (practice/[topicId], test/*, …), so a
  // canonical set here would make all of them claim /{slug} as canonical while
  // the sitemap advertises the deep URLs — Google then drops the deep pages as
  // duplicates. Canonical + openGraph live on each page/leaf-layout instead
  // (see ./page.tsx, ./modules/[topicId]/layout.tsx, ./practice/[topicId]).
  const meta: Metadata = {
    title: {
      default: `Learn ${label} — Free University Course | CalcPath`,
      template: "%s | CalcPath",
    },
    description: desc,
  };
  if (keywords && keywords.length > 0) {
    meta.keywords = keywords;
  }
  return meta;
}

export default async function SubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = await params;
  // Metaphor theme restored from master (graph paper / chalkboard / blueprint);
  // null for subjects without one → default site look.
  const theme = getThemeForSubject(slug);

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
      <CourseLayout navSubjects={navSubjects} theme={theme}>
        {children}
      </CourseLayout>
    </div>
  );
}