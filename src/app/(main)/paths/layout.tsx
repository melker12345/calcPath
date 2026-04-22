import { AppStateProviders } from "@/components/scoped-providers";

export default function PathsLayout({ children }: { children: React.ReactNode }) {
  return <AppStateProviders>{children}</AppStateProviders>;
}
