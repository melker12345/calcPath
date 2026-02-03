"use client";

import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ProgressProvider>{children}</ProgressProvider>
  </AuthProvider>
);
