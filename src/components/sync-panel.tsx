"use client";

import { useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { generateSyncCode, importSyncCode } from "@/lib/sync";

export function SyncPanel() {
  const { progress, applySyncedProgress } = useProgress();
  const [mode, setMode] = useState<"generate" | "import" | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { code: newCode } = await generateSyncCode(progress);
      setCode(newCode);
      setSuccess("Progress saved. Your code is linked to this snapshot for the next 1 week.");
      setMode("generate");
    } catch (e: any) {
      setError(e.message || "Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const imported = await importSyncCode(code.trim().toUpperCase());
      applySyncedProgress(imported);
      setSuccess("Progress imported successfully!");
      setCode("");
    } catch (e: any) {
      setError(e.message || "Failed to import code. Check it and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Generate */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold mb-2">Send progress to another device</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Saves your current progress to the server. We give you a short code linked to that snapshot. The code works for 1 week.
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate sync code"}
        </button>

        {mode === "generate" && code && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">Your code</div>
            <div className="font-mono text-4xl font-bold tracking-[8px] text-emerald-900 dark:text-emerald-200 select-all">{code}</div>
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">{success}</p>
            <button onClick={() => navigator.clipboard?.writeText(code)} className="mt-3 text-xs underline">Copy code</button>
          </div>
        )}
      </div>

      {/* Import */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold mb-2">Receive progress from another device</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Enter the code from the other device. Your current local progress will be replaced.
        </p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0,5))}
            placeholder="ABC12"
            className="flex-1 rounded-lg border px-3 py-2 font-mono tracking-widest text-lg dark:bg-zinc-900"
            maxLength={5}
          />
          <button
            onClick={handleImport}
            disabled={loading || code.length < 5}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-emerald-600">{success}</p>}
      </div>
    </div>
  );
}
