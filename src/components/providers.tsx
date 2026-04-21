"use client";

import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";
import { SearchProvider } from "@/components/search-command";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ProgressProvider>
      <SearchProvider>
        {children}
      </SearchProvider>
    </ProgressProvider>
  </AuthProvider>
);
