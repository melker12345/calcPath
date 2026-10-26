import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";

/**
 * The 404 page lives outside the (main) route group, so it draws the site
 * header and footer itself: a lost reader should still have the navigation.
 */
export default async function NotFound() {
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
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="font-serif text-3xl font-semibold">Page not found</h1>
          <p className="text-sm theme-text-muted">The page you requested does not exist.</p>
          <Link className="btn-primary" href="/">
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
