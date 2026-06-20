"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import {
  createCloudBackup,
  downloadBackupReceipt,
  formatBackupReceipt,
  getSavedBackupPin,
  restoreCloudBackup,
  updateCloudBackup,
} from "@/lib/sync";

type Mode = "create" | "update" | "restore" | null;

export function SyncPanel() {
  const { progress, applySyncedProgress } = useProgress();
  const [mode, setMode] = useState<Mode>(null);
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [receipt, setReceipt] = useState<{ pin: string; password: string } | null>(null);

  useEffect(() => {
    setSavedPin(getSavedBackupPin());
  }, []);

  const handleCreate = async () => {
    if (password.length < 6) {
      setError("Choose a password with at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setReceipt(null);
    try {
      const result = await createCloudBackup(progress, password);
      setPin(result.pin);
      setSavedPin(result.pin);
      setReceipt(result);
      setSuccess("Backup created. Save your PIN and password — we cannot recover them.");
      setMode("create");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create backup");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const activePin = savedPin ?? pin.replace(/\D/g, "");
    if (activePin.length !== 6) {
      setError("Enter your 6-digit PIN.");
      return;
    }
    if (!password) {
      setError("Enter your backup password.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const outcome = await updateCloudBackup(activePin, password, progress);
      if (outcome.upToDate && outcome.added === 0) {
        setSuccess(
          outcome.kept > 0
            ? `Cloud already had everything (plus ${outcome.kept} question${outcome.kept === 1 ? "" : "s"} not on this device). Nothing to push.`
            : "Cloud backup is already up to date.",
        );
      } else {
        const parts = [`Pushed ${outcome.added} new question${outcome.added === 1 ? "" : "s"} to the cloud.`];
        if (outcome.kept > 0) {
          parts.push(`Kept ${outcome.kept} the cloud already had — nothing was overwritten.`);
        }
        setSuccess(parts.join(" "));
      }
      setMode("update");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update backup");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const normalized = pin.replace(/\D/g, "");
    if (normalized.length !== 6) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { state, isTemplate, added, kept } = await restoreCloudBackup(normalized, progress);
      applySyncedProgress(state);
      const label = isTemplate ? "Recovery template merged." : "Progress restored.";
      const parts = [label, `Added ${added} question${added === 1 ? "" : "s"} from the cloud.`];
      if (kept > 0) {
        parts.push(`Kept ${kept} this device already had — nothing was lost.`);
      }
      setSuccess(parts.join(" "));
      setPin("");
      setPassword("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to restore backup");
    } finally {
      setLoading(false);
    }
  };

  const formatPinDisplay = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    if (digits.length <= 3) return digits;
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* How it works */}
      <details className="md:col-span-2 group">
        <summary className="cursor-pointer list-none flex items-center gap-1.5 text-sm theme-text-muted hover:theme-text transition-colors w-fit">
          <span className="inline-block transition-transform group-open:rotate-90">▶</span>
          How does cloud backup work?
        </summary>
        <div className="mt-3 rounded-lg border theme-border bg-[var(--surface-2)] px-4 py-3 text-sm theme-text-secondary space-y-2">
          <p>Your progress lives on this device. Backup uploads it to the cloud so you can pull it down on any other device — no account needed.</p>
          <p><span className="font-medium theme-text">PIN</span> — a 6-digit code that identifies your backup slot. Anyone with the PIN can restore from it, so keep it somewhere safe.</p>
          <p><span className="font-medium theme-text">Password</span> — proves you own the backup slot. Required to create it and to push updates. Not needed to restore.</p>
          <p className="theme-text-muted">No email, no account, no tracking. The backup is anonymous.</p>
        </div>
      </details>

      {/* Backup card */}
      <div className="rounded-xl border theme-border theme-card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold theme-text">Backup to cloud</h2>
          <p className="mt-1 text-sm theme-text-muted">
            Get a 6-digit PIN + password. No email or account needed.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest theme-text-muted">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-lg border theme-border bg-[var(--surface-2)] theme-text placeholder:text-[var(--text-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
            autoComplete="new-password"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-primary w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-opacity"
        >
          {loading && mode === "create" ? "Creating…" : "Create cloud backup"}
        </button>

        {savedPin && (
          <div className="border-t theme-border pt-4 space-y-2">
            <p className="text-xs theme-text-muted">
              Saved PIN: <span className="font-mono font-semibold theme-text">{formatPinDisplay(savedPin)}</span>
            </p>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="btn-secondary w-full rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              {loading && mode === "update" ? "Updating…" : "Update cloud backup"}
            </button>
          </div>
        )}

        {mode === "create" && receipt && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Your credentials
            </p>
            <p className="font-mono text-2xl font-bold tracking-[6px] text-emerald-900 dark:text-emerald-200 select-all">
              {formatPinDisplay(receipt.pin)}
            </p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              Password: <span className="font-mono select-all">{receipt.password}</span>
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{success}</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => navigator.clipboard?.writeText(formatBackupReceipt(receipt.pin, receipt.password))}
                className="text-xs underline theme-text-muted hover:theme-text transition-colors"
              >
                Copy to clipboard
              </button>
              <button
                onClick={() => downloadBackupReceipt(receipt.pin, receipt.password)}
                className="text-xs underline theme-text-muted hover:theme-text transition-colors"
              >
                Download recovery file
              </button>
            </div>
          </div>
        )}

        {mode === "update" && success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
        )}

        {error && mode !== "restore" && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Restore card */}
      <div className="rounded-xl border theme-border theme-card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold theme-text">Restore from cloud</h2>
          <p className="mt-1 text-sm theme-text-muted">
            Enter your 6-digit PIN to merge cloud progress onto this device. Nothing already completed here gets lost.
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={formatPinDisplay(pin)}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="582 910"
            inputMode="numeric"
            className="w-full rounded-lg border theme-border bg-[var(--surface-2)] theme-text placeholder:text-[var(--text-muted)] px-4 py-3 font-mono tracking-widest text-xl text-center outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
            maxLength={7}
          />
          <button
            onClick={handleRestore}
            disabled={loading || pin.replace(/\D/g, "").length < 6}
            className="btn-primary w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            {loading ? "Restoring…" : "Restore"}
          </button>
        </div>

        {error && mode === "restore" && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {success && mode !== "create" && mode !== "update" && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
        )}

        <p className="text-xs theme-text-muted">
          Public recovery templates (111111, 222222, …) work here too.
        </p>
      </div>
    </div>
  );
}
