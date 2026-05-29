"use client";

import { SearchProvider } from "@/components/search-command";
import { ThemeProvider } from "next-themes";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider 
    attribute="class" 
    defaultTheme="light" 
    enableSystem={false}
    storageKey="calcpath-theme"
  >
    <SearchProvider>
      {children}
    </SearchProvider>
  </ThemeProvider>
);
