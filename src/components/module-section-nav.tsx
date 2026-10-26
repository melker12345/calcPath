import type { NavItem } from "@/lib/content/render-chapter";

/**
 * Table of contents for a chapter page. A Server Component: plain anchor
 * links to the section ids the body renders.
 *
 * Numbers come from the chapter (4.1, 4.2, …) so the list reads like a book's
 * contents page and matches the section headings; unnumbered entries
 * (Introduction, Common Mistakes) simply omit theirs.
 */
export function ModuleSectionNav({ items }: { items: NavItem[] }) {
  const list = (
    <ol className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex gap-2 text-sm leading-5">
          <span className="w-8 shrink-0 tabular-nums theme-text-muted">{item.number ?? ""}</span>
          <a
            href={`#${item.id}`}
            className="text-[var(--accent)] hover:underline"
            dangerouslySetInnerHTML={{ __html: item.labelHtml }}
          />
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <nav
        className="fixed left-0 top-20 hidden max-h-[calc(100vh-6rem)] w-64 overflow-y-auto border-r theme-border bg-[var(--surface-2)] px-5 py-2 xl:block"
        aria-label="Table of contents"
        data-no-print
      >
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
          Contents
        </p>
        {list}
      </nav>
      {/* Below the sidebar breakpoint the contents fold into the page as a
          native disclosure: no script, and closed by default so the chapter
          still opens on its title. */}
      <details
        className="mx-auto w-full max-w-[760px] px-4 pt-6 sm:px-6 xl:hidden"
        data-no-print
      >
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
          Contents
        </summary>
        <nav aria-label="Table of contents" className="mt-3 border theme-border px-4 py-3">
          {list}
        </nav>
      </details>
    </>
  );
}
