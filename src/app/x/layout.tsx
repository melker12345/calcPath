import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="min-h-screen theme-bg">
      {/* Experimental banner - subtle, design-system aligned, less intrusive but clearly marked */}
      <div className="border-b theme-border bg-[var(--surface-2)] px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.5px] text-[var(--accent)]">EXPERIMENTAL</span>
            <span>/x/ — Dynamic content preview (JSON + MDX from <code className="font-mono text-[10px]">content/</code> only)</span>
          </div>
          <Link href="/" className="text-[var(--accent)] hover:underline">Exit experimental →</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl">{children}</div>
      <footer className="mt-12 border-t theme-border py-6 text-center text-xs theme-text-muted">
        Isolated experimental area. Proves full browse → explanation (light MDX) → practice flow using only <code>getFileSystemContentBundle</code> + shared generic components. No legacy subject code.
      </footer>
    </div>
  );
}
