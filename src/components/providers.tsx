"use client";

import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";
import { SearchProvider } from "@/components/search-command";
import { SimpleThemeProvider } from "@/components/simple-theme-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ProgressProvider>
      <SimpleThemeProvider>
        <SearchProvider>
          {children}
        </SearchProvider>
      </SimpleThemeProvider>
    </ProgressProvider>
  </AuthProvider>
);
