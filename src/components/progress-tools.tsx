"use client";

import { useState } from "react";
import { useProgress } from "@/lib/use-progress";

// Plain bordered button; the shared button class still carries rounded corners.
const button = "border theme-border bg-[var(--surface)] px-4 py-2 text-sm theme-text";

/**
 * Export / import / reset for the progress stored in this browser. Rendered at
 * the bottom of the progress overview.
 */
export function ProgressTools() {
  const { progress, resetProgress, importProgress } = useProgress();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleExport = () => {
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importProgress(JSON.parse((ev.target?.result as string) || ""));
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
    <section className="mt-10 border-t theme-border pt-6">
      <h2 className="text-lg font-semibold theme-text">Progress data</h2>
      <p className="mt-1 text-sm theme-text-secondary">
        Progress is saved in this browser only. Export it as a file to keep a copy or move it to
        another device; import replaces what is saved here.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleExport} className={button}>
          Export progress (JSON)
        </button>
        <label className={`${button} inline-flex cursor-pointer items-center`}>
          Import from JSON
          <input type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
        </label>
        {confirmingReset ? (
          <>
            <button
              type="button"
              className="border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400"
              onClick={() => {
                resetProgress();
                setConfirmingReset(false);
                setMessage({ text: "Progress erased.", ok: true });
              }}
            >
              Yes, erase everything
            </button>
            <button type="button" className={button} onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className={button} onClick={() => setConfirmingReset(true)}>
            Reset progress
          </button>
        )}
      </div>
      {confirmingReset && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          This erases all progress saved in this browser. There is no undo.
        </p>
      )}
      {message && (
        <p role="status" className={`mt-2 text-sm ${message.ok ? "theme-text-secondary" : "text-red-600 dark:text-red-400"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
