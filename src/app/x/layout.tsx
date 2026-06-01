import type { Metadata } from "next";
import Link from "next/link";
import { CourseLayout } from "@/components/course-layout";
import { subjectBodyFont, subjectHeadingFont } from "@/lib/subject-fonts";

export const metadata: Metadata = {
  title: "Experimental Dynamic Area | CalcPath",
  description: "Experimental data-driven routes and generic UI for dynamic content (proof of concept using only JSON+MDX from content/). Isolated from main app.",
  robots: { index: false, follow: false },
};

export default function ExperimentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${subjectHeadingFont.variable} ${subjectBodyFont.variable}`}>
      <CourseLayout>
        {/* Experimental banner — subtle, professional, integrated below SiteHeader.
            Signals isolation without looking like a warning. Uses only theme tokens / design system for full dark mode + consistency with rest of app. */}
        <div className="w-full border-b theme-border bg-[var(--surface-2)] px-4 py-2">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs sm:text-sm theme-text-muted">
            <div className="flex items-center gap-2">
              <span className="rounded border theme-border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[1px] theme-text">EXPERIMENTAL</span>
              <span className="font-medium">/x/ — Fully dynamic content + generic UI (sourced only from content/ JSON + MDX)</span>
            </div>
            <Link href="/" className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-secondary)] underline hover:no-underline transition-colors">Exit experimental →</Link>
          </div>
        </div>

        {/* Page content flows here (CourseContentsPage-style containers, module viewers etc. live in children) */}
        {children}
      </CourseLayout>
    </div>
  );
}
