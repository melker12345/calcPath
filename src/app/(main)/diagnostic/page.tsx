import Link from "next/link";
import { listSubjectsWithDiagnostics } from "@/lib/content/diagnostic-loader";

export default async function DiagnosticPickerPage() {
  const subjects = await listSubjectsWithDiagnostics();

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-center bg-white px-5 py-8 dark:bg-[var(--bg)] sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-[var(--border)] sm:px-8 sm:py-10 sm:shadow-lg dark:sm:shadow-none">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500 dark:text-[var(--accent)]">
          Diagnostics
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-[var(--text-primary)] sm:text-4xl">
          Check your readiness before you dive in.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-[var(--text-muted)]">
          Short prerequisite checks help you find gaps before starting a subject. They use the same answer tools as practice and do not affect your module progress.
        </p>

        <div className="mt-8 space-y-3">
          <p className="text-sm font-semibold text-zinc-900 dark:text-[var(--text-primary)]">
            Subject prerequisite checks
          </p>
          {subjects.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-[var(--text-muted)]">
              No subject diagnostics are available yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {subjects.map((subject) => (
                <Link
                  key={subject.slug}
                  href={`/diagnostic/${subject.slug}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)] dark:hover:bg-[var(--surface-2)]"
                >
                  <h2 className="font-bold text-zinc-900 dark:text-[var(--text-primary)]">{subject.label}</h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-[var(--text-muted)]">
                    Prerequisite readiness check
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}