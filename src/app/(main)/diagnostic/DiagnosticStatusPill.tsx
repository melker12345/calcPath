export function DiagnosticStatusPill({ status }: { status: string }) {
  const label = status.replace("-", " ");
  const className =
    status === "strong"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
      : status === "ready"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
        : status === "needs-review"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
          : status === "weak"
            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
            : "bg-zinc-100 text-zinc-500 dark:bg-[var(--surface-2)] dark:text-[var(--text-muted)]";

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${className}`}>
      {label}
    </span>
  );
}