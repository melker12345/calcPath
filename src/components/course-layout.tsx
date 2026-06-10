import { SiteHeader } from "@/components/site-header";
import type { NavSubject } from "@/lib/subjects";

export async function CourseLayout({
  children,
  navSubjects,
}: {
  children: React.ReactNode;
  navSubjects: NavSubject[];
}) {
  const { SiteFooter } = await import("@/components/site-footer");
  return (
    <div className="flex min-h-screen flex-col theme-bg theme-text">
      <SiteHeader subjects={navSubjects} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}