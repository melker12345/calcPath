import type { ProgressState } from "./progress";
import {
  compareCloudBlobs,
  deserializeCloudToProgress,
  mergeCloudBlobs,
  serializeProgressToCloud,
  type CloudProgressBlob,
} from "./cloud-progress";

const BACKUP_PIN_KEY = "calc_backup_pin_v1";

export type SyncOutcome = {
  /** Correct answers this side gained from the other side during the merge. */
  added: number;
  /** Correct answers the other side gained from this side during the merge. */
  kept: number;
  direction: "local-ahead" | "db-ahead" | "diverged" | "same";
};

export function getSavedBackupPin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const pin = localStorage.getItem(BACKUP_PIN_KEY);
    return pin && /^\d{6}$/.test(pin) ? pin : null;
  } catch {
    return null;
  }
}

export function saveBackupPin(pin: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BACKUP_PIN_KEY, pin);
}

export function clearSavedBackupPin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BACKUP_PIN_KEY);
}

export async function createCloudBackup(
  state: ProgressState,
  password: string,
): Promise<{ pin: string; password: string }> {
  const res = await fetch("/api/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to create backup");
  }
  const data = (await res.json()) as { pin: string; password: string };
  saveBackupPin(data.pin);
  return data;
}

export async function updateCloudBackup(
  pin: string,
  password: string,
  state: ProgressState,
): Promise<SyncOutcome & { upToDate: boolean }> {
  const res = await fetch("/api/backup", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, password, state }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Failed to update backup");
  }
  const result = data as {
    addedToCloud?: number;
    keptFromCloud?: number;
    direction?: SyncOutcome["direction"];
    upToDate?: boolean;
  };
  return {
    added: result.addedToCloud ?? 0,
    kept: result.keptFromCloud ?? 0,
    direction: result.direction ?? "same",
    upToDate: Boolean(result.upToDate),
  };
}

/**
 * Restore a backup by PIN. When `localState` is provided, the cloud blob is
 * merged with local progress (completion only grows) instead of replacing it,
 * so pulling an older/template backup can never wipe newer local work.
 */
export async function restoreCloudBackup(
  pin: string,
  localState?: ProgressState,
): Promise<{ state: ProgressState; isTemplate: boolean } & SyncOutcome> {
  const normalized = pin.replace(/\D/g, "");
  const res = await fetch(`/api/backup?pin=${encodeURIComponent(normalized)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Backup not found");
  }
  const data = (await res.json()) as {
    state: ProgressState;
    blob?: CloudProgressBlob;
    isTemplate?: boolean;
  };
  const isTemplate = Boolean(data.isTemplate);

  // Without a local state, or if the server is on an older shape (no blob),
  // fall back to the plain replace behaviour.
  if (!localState || !data.blob) {
    return { state: data.state, isTemplate, added: 0, kept: 0, direction: "db-ahead" };
  }

  const localBlob = serializeProgressToCloud(localState);
  const cloudBlob = data.blob;
  const comparison = compareCloudBlobs(localBlob, cloudBlob);
  const mergedState = deserializeCloudToProgress(mergeCloudBlobs(localBlob, cloudBlob));

  return {
    state: mergedState,
    isTemplate,
    added: comparison.dbOnlyCorrect,
    kept: comparison.localOnlyCorrect,
    direction: comparison.direction,
  };
}

export function formatBackupReceipt(pin: string, password: string): string {
  const spaced = `${pin.slice(0, 3)} ${pin.slice(3)}`;
  return `Calc-Path Backup | PIN: ${spaced} | Password: ${password}`;
}

export function downloadBackupReceipt(pin: string, password: string) {
  const text = formatBackupReceipt(pin, password);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "calc-path-backup-code.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** @deprecated Use createCloudBackup — kept for any stale imports */
export async function generateSyncCode(state: ProgressState): Promise<{ code: string }> {
  throw new Error("Snapshot codes are retired. Use createCloudBackup with a password.");
}

/** @deprecated Use restoreCloudBackup */
export async function importSyncCode(_code: string): Promise<ProgressState> {
  throw new Error("Snapshot codes are retired. Use restoreCloudBackup with your PIN.");
}