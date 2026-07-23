import { SiteHeader } from "@/components/site-header";
import type { NavSubject } from "@/lib/subjects";
import { subjectThemeClass, type SubjectTheme } from "@/lib/themes";

export async function CourseLayout({
  children,
  navSubjects,
  theme,
}: {
  children: React.ReactNode;
  navSubjects: NavSubject[];
  /** Optional subject metaphor theme (graph paper / chalkboard / blueprint, ...).
      Applied as a .subject-theme-<id> class whose generated CSS (see
      src/lib/themes.ts + root layout) projects the palette onto the token vars
      for this subtree — with light AND dark variants, so themed pages follow
      the site light/dark toggle. */
  theme?: SubjectTheme | null;
}) {
  const { SiteFooter } = await import("@/components/site-footer");
  const themeClass = theme ? ` ${subjectThemeClass(theme.slug)}` : "";

  return (
    <div className={`flex min-h-screen flex-col theme-bg theme-text${themeClass}`}>
      <SiteHeader subjects={navSubjects} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
