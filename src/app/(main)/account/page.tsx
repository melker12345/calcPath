"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { AdminFeedbackShortcut } from "@/components/admin-feedback-shortcut";
import { SectionCard } from "@/components/section-card";
import { SyncPanel } from "@/components/sync-panel";

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
    } catch (e: any) {
      setJsonMessage("Export failed: " + (e?.message || "unknown error"));
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
      } catch (err: any) {
        setJsonMessage("Import failed: " + (err?.message || "Invalid JSON file"));
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
      <div className="mb-6 border-b border-stone-300 pb-5">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Your Profile &amp; Progress Save</h1>
        <p className="mt-2 text-base leading-7 text-stone-700">
          No account required. All progress is saved locally on this device. Use the tools below for manual save/export to move to another device.
        </p>
      </div>

      {/* Hero / Primary: Manual Save - this is the prominent "manual save button" surface */}
      <SectionCard
        title="Manual Save / Sync to another device"
        description="Generate a short code to send your progress snapshot to another device, or import one. No sign-in ever needed."
      >
        <SyncPanel />
      </SectionCard>

      {/* Quick stats summary using useProgress */}
      <div className="mt-6">
        <SectionCard title="Your Progress Snapshot">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-stone-950">{topicsWithProgress}</div>
              <div className="text-xs uppercase tracking-widest text-stone-500">Topics touched</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-stone-950">{problemsMastered}</div>
              <div className="text-xs uppercase tracking-widest text-stone-500">Problems mastered</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-stone-950">{totalAttempts}</div>
              <div className="text-xs uppercase tracking-widest text-stone-500">Total attempts</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-stone-950">{currentStreak}</div>
              <div className="text-xs uppercase tracking-widest text-stone-500">Current streak (days)</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Stats are computed from your local progress. Practice more to increase these numbers.
          </p>
        </SectionCard>
      </div>

      {/* Additional data tools: reset, links, and new JSON backup/restore (in addition to code sync) */}
      <div className="mt-6 grid gap-4 sm:gap-6 md:grid-cols-2">
        <SectionCard title="Backup &amp; Restore (JSON)">
          <p className="text-sm text-zinc-600 mb-4">
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

        <SectionCard title="Other tools &amp; reset">
          <p className="text-sm text-zinc-600 mb-4">
            Reset erases all local progress permanently (no undo). Use /sync for the dedicated sync UI.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/sync" className="btn-secondary inline-flex">Dedicated sync page</Link>
            <Link href="/diagnostic" className="btn-secondary inline-flex">Take the diagnostic</Link>
            <button className="btn-secondary" onClick={resetProgress}>
              Reset progress
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 sm:mt-6">
        <AdminFeedbackShortcut />
      </div>

      <div className="mt-8 text-xs text-stone-500">
        All data stays on this device by default. The manual save tools above (codes + JSON) let you transfer or backup without any account or sign-in.
      </div>
    </div>
  );
}
