// Simple loading state for /x/ dynamic routes (appears during server data fetch for bundles)
export default function ExperimentalLoading() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 h-4 w-48 rounded bg-[var(--surface-2)]" />
      <div className="mb-8">
        <div className="h-8 w-64 rounded bg-[var(--surface-2)]" />
        <div className="mt-3 h-4 w-3/4 max-w-md rounded bg-[var(--surface-2)]" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border theme-border p-4">
            <div className="h-5 w-1/2 rounded bg-[var(--surface-2)]" />
            <div className="mt-2 h-4 w-3/4 rounded bg-[var(--surface-2)]" />
            <div className="mt-3 flex gap-2">
              <div className="h-8 w-28 rounded-lg bg-[var(--surface-2)]" />
              <div className="h-8 w-24 rounded-lg bg-[var(--surface-2)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
