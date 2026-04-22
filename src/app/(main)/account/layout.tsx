import { AppStateProviders } from "@/components/scoped-providers";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AppStateProviders>{children}</AppStateProviders>;
}
