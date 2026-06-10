"use client";

import { ProgressProvider } from "@/components/progress-provider";
import { createContext, useContext } from "react";
import type { Topic, Problem } from "@/lib/shared-types";

export function AuthBoundary({ children }: { children: React.ReactNode }) {
  // No-op: auth removed; passthrough for compatibility with existing layout wrappers.
  return <>{children}</>;
}

export function ProgressBoundary({ children }: { children: React.ReactNode }) {
  // AuthProvider wrapper removed (auth stripped); ProgressProvider kept.
  return <ProgressProvider>{children}</ProgressProvider>;
}

export function AppStateProviders({ children }: { children: React.ReactNode }) {
  // AuthProvider wrapper removed (auth stripped); ProgressProvider kept.
  return <ProgressProvider>{children}</ProgressProvider>;
}

// ============================================
// Dual-system adapter for real LA pages to consume FileSystemContentBundle optionally.
// Used by linear-algebra/practice/layout.tsx (server loads via flag) + practice page.
// No new files created. Provides topics/problems from new data when enabled; legacy fallback in page.
// The get* helpers remain from legacy (compatible with both data sources for LA).
// ============================================

export type LinalgContentData = {
  topics: Topic[];
  problems: Problem[];
};

const LinalgContentContext = createContext<LinalgContentData | null>(null);

/**
 * Thin provider wrapper. Server layout passes FS bundle data (or null for legacy).
 * Enables real /linear-algebra/practice/* pages to opt-in to new data behind env flag.
 */
export function LinalgContentProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data?: LinalgContentData | null;
}) {
  return (
    <LinalgContentContext.Provider value={data ?? null}>
      {children}
    </LinalgContentContext.Provider>
  );
}

/** Hook for real LA practice page (and future) to source topics/problems optionally from FS. */
export function useLinalgContent(): LinalgContentData | null {
  return useContext(LinalgContentContext);
}
