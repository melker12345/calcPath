"use client";

import type { SubjectTheme } from "@/lib/themes";
import { ThemedHeader } from "@/components/themed-header";
import { ThemedFooter } from "@/components/themed-footer";
import { useSimpleTheme } from "@/components/simple-theme-provider";

export function ThemedLayout({
  theme,
  subjectSlug,
  children,
}: {
  theme: SubjectTheme;
  subjectSlug: string;
  children: React.ReactNode;
}) {
  const { isSimple } = useSimpleTheme();

  return (
    <div
      className="flex min-h-screen flex-col"
      style={isSimple ? { backgroundColor: "#fff" } : theme.backgroundCSS}
    >
      <ThemedHeader theme={theme} subjectSlug={subjectSlug} />
      <main className="flex-1">{children}</main>
      <ThemedFooter theme={theme} subjectSlug={subjectSlug} />
    </div>
  );
}
