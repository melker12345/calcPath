import { AuthBoundary } from "@/components/scoped-providers";
import { AdminGate } from "@/components/admin-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthBoundary>
      <AdminGate>{children}</AdminGate>
    </AuthBoundary>
  );
}
