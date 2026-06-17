import type { ProgressState } from "./progress";

const BACKUP_PIN_KEY = "calc_backup_pin_v1";

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
): Promise<void> {
  const res = await fetch("/api/backup", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, password, state }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to update backup");
  }
}

export async function restoreCloudBackup(
  pin: string,
): Promise<{ state: ProgressState; isTemplate: boolean }> {
  const normalized = pin.replace(/\D/g, "");
  const res = await fetch(`/api/backup?pin=${encodeURIComponent(normalized)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Backup not found");
  }
  const data = (await res.json()) as {
    state: ProgressState;
    isTemplate?: boolean;
  };
  return { state: data.state, isTemplate: Boolean(data.isTemplate) };
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