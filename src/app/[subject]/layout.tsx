import type { Metadata } from "next";
import { CourseLayout } from "@/components/course-layout";
import { subjectBodyFont, subjectHeadingFont } from "@/lib/subject-fonts";
import { getSubject } from "@/lib/subjects";
import { loadSubjectIndex } from "@/lib/content/loader";

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

  // Always prefer content/{slug}/index.json for metadata.
  // This makes rich SEO/OG/keywords fully data-driven: the original 3 subjects put their
  // formerly-hardcoded values into index.json; any new "just drop" subject can include
  // the same optional keys (keywords, ogTitle, ogDescription, courseDescription) for rich
  // metadata with zero code changes in layout or page.
  // Graceful fallback for subjects without index.json or without the rich keys.
  try {
    const idx = await loadSubjectIndex(slug);
    label = idx.label;
    desc = idx.shortDescription;
    keywords = idx.keywords;
    ogTitle = idx.ogTitle;
    ogDesc = idx.ogDescription;
  } catch {
    // Fallback to legacy subjects.ts entry (for subjects not yet in content/)
    const subject = getSubject(slug);
    if (subject) {
      label = subject.label;
      desc = subject.shortDescription;
    }
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
  // Apply the shared subject fonts for all dynamic subjects (same as the original three)
  return (
    <div className={`${subjectHeadingFont.variable} ${subjectBodyFont.variable}`}>
      <CourseLayout>{children}</CourseLayout>
    </div>
  );
}
