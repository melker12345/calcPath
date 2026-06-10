import { AppStateProviders } from "@/components/scoped-providers";

// Account layout (URL kept as /account for compatibility).
// Now serves as the anon "Profile & Save" page: always provides ProgressProvider
// (auth already stripped in scoped-providers). No sign-in gate anywhere.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AppStateProviders>{children}</AppStateProviders>;
}
