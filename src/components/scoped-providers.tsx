"use client";

import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";

export function AuthBoundary({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export function ProgressBoundary({ children }: { children: React.ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

export function AppStateProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </AuthProvider>
  );
}
