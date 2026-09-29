import { AuthProvider } from "@/components/auth-provider";
import { AdminGate } from "@/components/admin-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  );
}
