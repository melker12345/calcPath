import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Experimental banner - isolated UI chrome */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-200 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-amber-900 dark:bg-amber-900 dark:text-amber-100">EXPERIMENTAL</span>
            <span className="font-medium">/x/ — Fully Dynamic Content + Generic UI (data from content/ only)</span>
          </div>
          <Link href="/" className="underline hover:no-underline">Exit to main app →</Link>
        </div>
      </div>
      <div className={`mx-auto max-w-6xl ${subjectHeadingFont.variable} ${subjectBodyFont.variable}`}>
        {children}
      </div>
      <footer className="mt-12 border-t border-[var(--border)] py-6 text-center text-xs text-zinc-500">
        This area is isolated. It demonstrates browse → explanation (MDX data) → practice flow using <code>getFileSystemContentBundle</code> + generic components. No legacy per-subject code.
      </footer>
    </div>
  );
}
