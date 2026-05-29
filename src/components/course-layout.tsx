import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col theme-bg theme-text">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
