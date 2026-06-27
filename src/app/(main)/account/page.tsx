"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useProgress } from "@/components/progress-provider";
import { AdminFeedbackShortcut } from "@/components/admin-feedback-shortcut";
import { SectionCard } from "@/components/section-card";

// Lazy-load the sync panel: it pulls in cloud-progress + the 285KB question
// registry, which is only needed here. Keeps that weight out of the shared
// bundle loaded on every route.
const SyncPanel = dynamic(
  () => import("@/components/sync-panel").then((m) => m.SyncPanel),
  { ssr: false },
);

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const { progress, resetProgress, applySyncedProgress } = useProgress();
  const [jsonMessage, setJsonMessage] = useState("");

  // Derive simple stats (no topic list needed; use what's in progress)
  const topicsWithProgress = Object.keys(progress.topicStats || {}).length;
  const problemsMastered = (progress.completedProblemIds || []).length;
  const totalAttempts = (progress.attempts || []).length;
  const currentStreak = progress.streak?.current ?? 0;

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(progress, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `calc-progress-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setJsonMessage("Progress exported as JSON.");
      setTimeout(() => setJsonMessage(""), 2500);
    } catch (e: unknown) {
      setJsonMessage("Export failed: " + (e instanceof Error ? e.message : "unknown error"));
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = (ev.target?.result as string) || "";
        const parsed = JSON.parse(text);
        applySyncedProgress(parsed);
        setJsonMessage("Progress imported from JSON successfully!");
        setTimeout(() => setJsonMessage(""), 3000);
      } catch (err: unknown) {
        setJsonMessage("Import failed: " + (err instanceof Error ? err.message : "Invalid JSON file"));
      }
    };
    reader.onerror = () => {
      setJsonMessage("Failed to read the file.");
    };
    reader.readAsText(file);
    // allow re-select same file
    e.target.value = "";
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 border-b theme-border pb-5">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">Your Profile &amp; Progress Save</h1>
        <p className="mt-2 text-base leading-7 theme-text-secondary">
          No account required. All progress is saved locally on this device. Use the tools below for manual save/export to move to another device.
        </p>
      </div>

      {/* Hero / Primary: Manual Save - this is the prominent "manual save button" surface */}
      <SectionCard
        title="Cloud backup &amp; restore"
        description="Back up progress with a 6-digit PIN and password, update it as you go, or restore on another device. No sign-in ever needed."
      >
        <SyncPanel />
      </SectionCard>

      {/* Quick stats summary using useProgress */}
      <div className="mt-6">
        <SectionCard title="Your Progress Snapshot">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: topicsWithProgress, label: "Topics touched" },
              { value: problemsMastered, label: "Problems mastered" },
              { value: totalAttempts, label: "Total attempts" },
              { value: currentStreak, label: "Current streak (days)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border theme-border bg-[var(--surface-2)] px-3 py-4 text-center"
              >
                <div className="text-2xl font-semibold tabular-nums theme-text">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-widest theme-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs theme-text-muted">
            Stats are computed from your local progress. Practice more to increase these numbers.
          </p>
        </SectionCard>
      </div>

      {/* Additional data tools: reset, links, and new JSON backup/restore (in addition to code sync) */}
      <div className="mt-6 grid gap-4 sm:gap-6 md:grid-cols-2">
        <SectionCard title="Backup &amp; Restore (JSON)">
          <p className="text-sm theme-text-secondary mb-4">
            Download a full JSON backup of your current progress for manual safekeeping or moving to another browser/profile.
            Import will replace your local progress with the file&apos;s data.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportJSON} className="btn-secondary">
              Export progress (JSON)
            </button>
            <label className="btn-secondary cursor-pointer inline-flex items-center">
              Import from JSON
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
          {jsonMessage && (
            <p className="mt-2 text-sm text-emerald-600">{jsonMessage}</p>
          )}
        </SectionCard>

        <SectionCard title="Reset">
          <p className="text-sm theme-text-secondary mb-4">
            Reset erases all local progress permanently (no undo).
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={resetProgress}>
              Reset progress
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 sm:mt-6">
        <AdminFeedbackShortcut />
      </div>

      <div className="mt-8 text-xs theme-text-muted">
        All data stays on this device by default. The manual save tools above (codes + JSON) let you transfer or backup without any account or sign-in.
      </div>
    </div>
  );
}
