import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConditionalSiteFooter } from "@/components/conditional-site-footer";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subjectConfigs = await getAvailableSubjectConfigs();
  const navSubjects = subjectConfigs.map((s) => ({
    slug: s.slug,
    label: s.label,
    icon: s.icon,
    category: s.category,
    order: s.order,
  }));

  return (
    <div className="flex min-h-screen flex-col theme-bg theme-text">
      <SiteHeader subjects={navSubjects} />
      <main className="flex-1">{children}</main>
      <ConditionalSiteFooter>
        <SiteFooter />
      </ConditionalSiteFooter>
    </div>
  );
}