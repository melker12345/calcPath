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
        {/* Experimental banner — tasteful, integrated below SiteHeader so the /x/ area feels like a real subject with an explicit data-driven label.
            Uses amber for clear "experimental" identity without clashing with theme tokens or dark mode. */}
        <div className="w-full border-b border-amber-200 bg-amber-50/95 px-4 py-2 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200 dark:backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-200 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-amber-900 dark:bg-amber-900 dark:text-amber-100">EXPERIMENTAL</span>
              <span className="font-medium">/x/ — Fully dynamic content + generic UI (sourced only from content/ JSON + MDX)</span>
            </div>
            <Link href="/" className="shrink-0 underline hover:no-underline">Exit experimental →</Link>
          </div>
        </div>

        {/* Page content flows here (CourseContentsPage-style containers, module viewers etc. live in children) */}
        {children}
      </CourseLayout>
    </div>
  );
}
