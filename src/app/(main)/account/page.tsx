"use client";

import { useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { SectionCard } from "@/components/section-card";

/**
 * Local progress tools. Progress lives in this browser only; the file export is
 * how it moves to another device.
 */
export default function AccountPage() {
  const { progress, resetProgress, applySyncedProgress } = useProgress();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const topicsWithProgress = Object.keys(progress.topicStats || {}).length;
  const problemsSolved = (progress.completedProblemIds || []).length;
  const totalAttempts = (progress.attempts || []).length;

  const handleExportJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calcpath-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ text: "Progress exported.", ok: true });
    } catch (e: unknown) {
      setMessage({ text: "Export failed: " + (e instanceof Error ? e.message : "unknown error"), ok: false });
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        applySyncedProgress(JSON.parse((ev.target?.result as string) || ""));
        setMessage({ text: "Progress imported.", ok: true });
      } catch (err: unknown) {
        setMessage({ text: "Import failed: " + (err instanceof Error ? err.message : "invalid JSON file"), ok: false });
      }
    };
    reader.onerror = () => setMessage({ text: "Failed to read the file.", ok: false });
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 border-b theme-border pb-5">
        <h1 className="font-serif text-3xl font-semibold tracking-tight theme-text">Progress data</h1>
        <p className="mt-2 text-base leading-7 theme-text-secondary">
          Progress is saved in this browser. Export it as a file to keep a copy or move it to another device.
        </p>
      </div>

      <SectionCard title="Summary">
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[
            { value: topicsWithProgress, label: "Chapters touched" },
            { value: problemsSolved, label: "Problems solved" },
            { value: totalAttempts, label: "Attempts" },
          ].map((stat) => (
            <div key={stat.label} className="border theme-border px-3 py-4">
              <dd className="text-2xl font-semibold tabular-nums theme-text">{stat.value}</dd>
              <dt className="mt-1 text-xs theme-text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </SectionCard>

      <div className="mt-6">
        <SectionCard title="Export and import">
          <p className="mb-4 text-sm theme-text-secondary">
            Import replaces the progress in this browser with the file&apos;s contents.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportJSON} className="btn-secondary">Export progress (JSON)</button>
            <label className="btn-secondary inline-flex cursor-pointer items-center">
              Import from JSON
              <input type="file" accept="application/json,.json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
          {message && (
            <p role="status" className={`mt-2 text-sm ${message.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {message.text}
            </p>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Reset">
          <p className="mb-4 text-sm theme-text-secondary">Reset erases all progress in this browser. There is no undo.</p>
          <div className="flex flex-wrap items-center gap-2">
            {confirmingReset ? (
              <>
                <button
                  className="border border-red-400 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400"
                  onClick={() => {
                    resetProgress();
                    setConfirmingReset(false);
                  }}
                >
                  Yes, erase everything
                </button>
                <button className="btn-secondary" onClick={() => setConfirmingReset(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn-secondary" onClick={() => setConfirmingReset(true)}>Reset progress</button>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
