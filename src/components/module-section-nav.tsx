/**
 * Table of contents for a module page.
 *
 * Numbers come from the page (4.1, 4.2, ...) so the sidebar reads like a book's
 * contents page and matches the section headings; unnumbered entries
 * (Introduction, Common Mistakes) simply omit theirs.
 */
export function ModuleSectionNav({
  items,
}: {
  items: { id: string; label: string; number?: string }[];
}) {
  return (
    <nav className="fixed left-0 top-20 hidden max-h-[calc(100vh-6rem)] w-64 overflow-y-auto border-r theme-border bg-[var(--surface-2)] px-5 py-2 xl:block dark:bg-[var(--surface-2)]" aria-label="Table of contents">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
        Contents
      </p>
      <ol className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2 text-sm leading-5">
            <span className="w-8 shrink-0 tabular-nums theme-text-muted">
              {item.number ?? ""}
            </span>
            <a href={`#${item.id}`} className="text-blue-800 hover:underline dark:text-[var(--accent)]">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
