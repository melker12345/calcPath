export function ModuleSectionNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  return (
    <nav className="fixed left-0 top-20 hidden max-h-[calc(100vh-6rem)] w-64 overflow-y-auto border-r theme-border theme-surface-2 px-5 py-2 xl:block" aria-label="Table of contents">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
        Contents
      </p>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-2 text-sm leading-5">
            <span className="w-5 shrink-0 tabular-nums theme-text-muted">
              {index + 1}.
            </span>
            <a href={`#${item.id}`} className="text-blue-800 hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
