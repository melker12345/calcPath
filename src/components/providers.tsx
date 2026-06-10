"use client";

import { SearchProvider } from "@/components/search-command";
import { ThemeProvider } from "next-themes";

// Eagerly load migration diagnostics in development so that
// window.__dumpLegacyReport() / __explainMigrationCrash() are always available
// in the console, even before any legacy module has been touched.
if (process.env.NODE_ENV === "development") {
  import("@/lib/migration-diagnostics").catch(() => {});
}

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
