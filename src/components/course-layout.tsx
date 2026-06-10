import { SiteHeader } from "@/components/site-header";

export async function CourseLayout({ children }: { children: React.ReactNode }) {
  const { SiteFooter } = await import("@/components/site-footer");
  return (
    <div className="flex min-h-screen flex-col theme-bg theme-text">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
