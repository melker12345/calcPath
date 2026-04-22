"use client";

import { SearchProvider } from "@/components/search-command";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <SearchProvider>
    {children}
  </SearchProvider>
);
