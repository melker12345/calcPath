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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border theme-border theme-card p-6">
        <h2 className="text-xl font-semibold mb-2 theme-text">Backup to cloud</h2>
        <p className="text-sm theme-text-secondary mb-4">
          Upload your local progress and get a memorable 6-digit PIN plus password. No email or account.
        </p>

        <label className="block text-xs uppercase tracking-widest theme-text-muted mb-1">
          Backup password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="w-full rounded-lg border theme-border bg-[var(--surface-2)] theme-text placeholder:text-[var(--text-muted)] px-3 py-2 mb-3"
          autoComplete="new-password"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading && mode === "create" ? "Creating..." : "Create cloud backup"}
        </button>

        {savedPin && (
          <div className="mt-4 border-t theme-border pt-4">
            <p className="text-sm theme-text-secondary mb-2">
              Update existing backup (PIN {formatPinDisplay(savedPin)})
            </p>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {loading && mode === "update" ? "Updating..." : "Update cloud backup"}
            </button>
          </div>
        )}

        {mode === "create" && receipt && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
              Your credentials
            </div>
            <div className="font-mono text-3xl font-bold tracking-[6px] text-emerald-900 dark:text-emerald-200 select-all">
              {formatPinDisplay(receipt.pin)}
            </div>
            <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
              Password: <span className="font-mono select-all">{receipt.password}</span>
            </p>
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">{success}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(formatBackupReceipt(receipt.pin, receipt.password))}
                className="text-xs underline theme-text-muted hover:theme-text"
              >
                Copy to clipboard
              </button>
              <button
                onClick={() => downloadBackupReceipt(receipt.pin, receipt.password)}
                className="text-xs underline theme-text-muted hover:theme-text"
              >
                Download recovery file
              </button>
            </div>
          </div>
        )}

        {mode === "update" && success && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
        )}
      </div>

      <div className="rounded-2xl border theme-border theme-card p-6">
        <h2 className="text-xl font-semibold mb-2 theme-text">Restore from cloud</h2>
        <p className="text-sm theme-text-secondary mb-4">
          Enter a 6-digit PIN to download progress. It merges with whatever is on this
          device — nothing already completed here gets lost. Public recovery templates
          (111111, 222222, …) work here too.
        </p>
        <div className="flex gap-2">
          <input
            value={formatPinDisplay(pin)}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="582 910"
            inputMode="numeric"
            className="flex-1 rounded-lg border theme-border bg-[var(--surface-2)] theme-text placeholder:text-[var(--text-muted)] px-3 py-2 font-mono tracking-widest text-lg"
            maxLength={7}
          />
          <button
            onClick={handleRestore}
            disabled={loading || pin.replace(/\D/g, "").length < 6}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Restoring..." : "Restore"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && mode !== "create" && mode !== "update" && (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
        )}
      </div>
    </div>
  );
}
