"use client";

import Link from "next/link";
import type { SubjectTheme } from "@/lib/themes";

export function ThemedFooter({
  theme,
  subjectSlug,
}: {
  theme: SubjectTheme;
  subjectSlug: string;
}) {
  const c = theme.colors;
  const prefix = `/${subjectSlug}`;

  return (
    <footer style={{ borderTop: `1px solid ${c.border}` }} className="pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 sm:py-8">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold"
            style={{ background: c.logoBg, color: c.logoText }}
          >
            {theme.icon}
          </div>
          <span className="font-bold" style={{ color: c.text }}>CalcPath</span>
        </div>
        <p className="text-sm" style={{ color: c.textMuted }}>© 2026 CalcPath</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <Link href="/pricing" className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>Pricing</Link>
          <Link href={`${prefix}/modules`} className="text-sm transition hover:opacity-70" style={{ color: c.textMuted }}>Modules</Link>
        </div>
      </div>
    </footer>
  );
}
