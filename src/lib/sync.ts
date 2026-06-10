import type { ProgressState } from './progress';

export async function generateSyncCode(state: ProgressState): Promise<{ code: string }> {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate sync code');
  }
  return res.json();
}

export async function importSyncCode(code: string): Promise<ProgressState> {
  const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Invalid or expired code');
  }
  const { state } = await res.json();
  return state;
}
