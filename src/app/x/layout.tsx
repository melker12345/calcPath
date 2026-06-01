import type { Metadata } from "next";
import Link from "next/link";
import { CourseLayout } from "@/components/course-layout";
import { subjectBodyFont, subjectHeadingFont } from "@/lib/subject-fonts";

export const metadata: Metadata = {
  title: "Dynamic Content Area | CalcPath",
  description: "The evolving UI for the new dynamic content system. All content is loaded from content/ (JSON + MDX) using generic components. This is the forward-looking, primary development path — it will become the main experience.",
  robots: { index: false, follow: false },
};

export default function DynamicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${subjectHeadingFont.variable} ${subjectBodyFont.variable}`}>
      <CourseLayout>
        {/* Forward-looking dynamic content system.
            All content from content/ (JSON + MDX) via generic components.
            This is the primary active development path and will become the main UI. */}
        <div className="w-full border-b theme-border px-4 py-1.5">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-[11px] sm:text-xs theme-text-muted">
            <div className="flex items-center gap-2">
              <span className="rounded border theme-border px-1.5 py-px font-mono text-[9px] font-medium tracking-[0.5px] theme-text/80">IN DEVELOPMENT</span>
              <span className="font-medium">New Dynamic Content System — this is where new content is developed and will become the main experience.</span>
            </div>
            <Link href="/" className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-secondary)] underline hover:no-underline transition-colors text-[10px]">Back to main app →</Link>
          </div>
        </div>

        {/* Page content flows here (generic viewers, topic browsers etc. live in children) */}
        {children}
      </CourseLayout>
    </div>
  );
}
