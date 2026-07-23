import { AppStateProviders } from "@/components/scoped-providers";

export default function DiagnosticLayout({ children }: { children: React.ReactNode }) {
  return <AppStateProviders>{children}</AppStateProviders>;
}
