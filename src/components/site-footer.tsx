import Link from "next/link";

const links = [
  { href: "/subjects", label: "Subjects" },
  { href: "/problem-sets", label: "Problem sets" },
  { href: "/dashboard", label: "Progress" },
  { href: "/feedback", label: "Feedback" },
  { href: "/about", label: "About" },
] as const;

/** One line of links and the wordmark. The subjects live in the header. */
export function SiteFooter() {
  return (
    <footer className="border-t theme-border pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="theme-text-muted">
          <Link prefetch={false} href="/" className="font-serif text-base font-semibold theme-text">
            CalcPath
          </Link>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          Free university mathematics
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
          {links.map((l) => (
            <Link prefetch={false} key={l.href} href={l.href} className="theme-text-secondary hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
