import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  blobIsSupersetOf,
  compareCloudBlobs,
  deserializeCloudToProgress,
  mergeCloudBlobs,
  serializeProgressToCloud,
  type CloudProgressBlob,
} from "@/lib/cloud-progress";
import { hashPassword, verifyPassword } from "@/lib/password-hash";
import { normalizeProgressState, type ProgressState } from "@/lib/progress";

/*
  Required Supabase table (run in SQL editor):

  CREATE TABLE progress_backups (
    pin text PRIMARY KEY,
    password_hash text NOT NULL,
    blob jsonb NOT NULL,
    is_template boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    last_accessed timestamptz DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS progress_backups_template_idx
    ON progress_backups (is_template) WHERE is_template = true;

  -- RLS: disable public access; API uses service role only.
  ALTER TABLE progress_backups ENABLE ROW LEVEL SECURITY;
*/

const PIN_LENGTH = 6;
const MIN_PASSWORD_LEN = 6;
const MAX_PIN_RETRIES = 20;

const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const pinAttemptLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / RATE_WINDOW_MS)}`;
  if (rateLimit.size > 2000) {
    const cutoff = Math.floor(now / RATE_WINDOW_MS);
    for (const k of rateLimit.keys()) {
      if (!k.endsWith(`:${cutoff}`)) rateLimit.delete(k);
    }
  }
  const count = rateLimit.get(key) ?? 0;
  if (count >= MAX_PER_WINDOW) return true;
  rateLimit.set(key, count + 1);
  return false;
}

function recordPinFailure(pin: string): boolean {
  const now = Date.now();
  const entry = pinAttemptLimit.get(pin);
  if (!entry || now > entry.resetAt) {
    pinAttemptLimit.set(pin, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count >= 10;
}

function clearPinFailures(pin: string) {
  pinAttemptLimit.delete(pin);
}

function generatePin(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

function parseState(body: unknown): ProgressState | null {
  if (typeof body !== "object" || body === null || !("state" in body)) return null;
  const state = (body as { state: unknown }).state;
  if (!state || typeof state !== "object") return null;
  return normalizeProgressState(state as Partial<ProgressState>);
}

function parsePassword(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("password" in body)) return null;
  const password = (body as { password: unknown }).password;
  return typeof password === "string" ? password : null;
}

function parsePin(value: string | null): string | null {
  if (!value) return null;
  const pin = value.replace(/\D/g, "");
  if (pin.length !== PIN_LENGTH) return null;
  return pin;
}

type BackupRow = {
  pin: string;
  password_hash: string;
  blob: CloudProgressBlob;
  is_template: boolean;
  updated_at: string;
};

/** POST — create a new cloud backup, returns a 6-digit PIN. */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = parsePassword(body);
  if (!password || password.length < MIN_PASSWORD_LEN) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` },
      { status: 400 },
    );
  }

  const state = parseState(body);
  if (!state) {
    return NextResponse.json({ error: "state (progress) is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const blob = serializeProgressToCloud(state);
  const passwordHash = hashPassword(password);

  let pin = "";
  let attempts = 0;
  while (attempts < MAX_PIN_RETRIES) {
    pin = generatePin();
    const { data: taken } = await supabase
      .from("progress_backups")
      .select("pin")
      .eq("pin", pin)
      .maybeSingle();
    if (!taken) break;
    attempts++;
  }

  if (!pin || attempts >= MAX_PIN_RETRIES) {
    return NextResponse.json({ error: "Failed to generate unique PIN" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("progress_backups").insert({
    pin,
    password_hash: passwordHash,
    blob,
    is_template: false,
    created_at: now,
    updated_at: now,
    last_accessed: now,
  });

  if (error) {
    console.error("Backup insert error:", error);
    return NextResponse.json({ error: "Failed to store backup" }, { status: 500 });
  }

  return NextResponse.json({ pin, password });
}

/** GET — restore progress by PIN (read-only, no password required). */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const pin = parsePin(searchParams.get("pin"));
  if (!pin) {
    return NextResponse.json({ error: "Valid 6-digit PIN required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("progress_backups")
    .select("blob, is_template")
    .eq("pin", pin)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  await supabase
    .from("progress_backups")
    .update({ last_accessed: new Date().toISOString() })
    .eq("pin", pin);

  const blob = data.blob as CloudProgressBlob;
  const state = deserializeCloudToProgress(blob);
  return NextResponse.json({
    state,
    // Raw blob lets the client merge with local progress instead of blindly
    // replacing it, so pulling an older backup can never wipe newer local work.
    blob,
    isTemplate: Boolean(data.is_template),
  });
}

/** PUT — update an existing backup (requires PIN + password). */
export async function PUT(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const pin = parsePin("pin" in body ? String((body as { pin: unknown }).pin) : null);
  const password = parsePassword(body);
  const state = parseState(body);

  if (!pin) {
    return NextResponse.json({ error: "Valid 6-digit PIN required" }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }
  if (!state) {
    return NextResponse.json({ error: "state (progress) is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("progress_backups")
    .select("password_hash, blob, is_template, updated_at")
    .eq("pin", pin)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  const backup = row as BackupRow;
  if (backup.is_template) {
    return NextResponse.json({ error: "Template backups cannot be modified" }, { status: 403 });
  }

  if (!verifyPassword(password, backup.password_hash)) {
    if (recordPinFailure(pin)) {
      return NextResponse.json(
        { error: "Too many failed attempts for this PIN. Try again in 15 minutes." },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  clearPinFailures(pin);

  // Convergent merge: the cloud blob only ever grows. Even if the client pushes
  // an empty or stale state (e.g. a fresh browser after restore), nothing that
  // was already backed up can be lost. This replaces the old destructive
  // "diff >= N overwrites" guard.
  const storedBlob = backup.blob as CloudProgressBlob;
  const incomingBlob = serializeProgressToCloud(state);
  const mergedBlob = mergeCloudBlobs(incomingBlob, storedBlob);
  const comparison = compareCloudBlobs(incomingBlob, storedBlob);

  const now = new Date().toISOString();

  // Nothing new to store — skip the write entirely (cheap spam protection).
  if (blobIsSupersetOf(mergedBlob, storedBlob)) {
    await supabase
      .from("progress_backups")
      .update({ last_accessed: now })
      .eq("pin", pin);
    return NextResponse.json({
      ok: true,
      upToDate: true,
      addedToCloud: 0,
      keptFromCloud: comparison.dbOnlyCorrect,
      direction: comparison.direction,
      updatedAt: backup.updated_at,
    });
  }

  const { error: updateError } = await supabase
    .from("progress_backups")
    .update({ blob: mergedBlob, updated_at: now, last_accessed: now })
    .eq("pin", pin);

  if (updateError) {
    console.error("Backup update error:", updateError);
    return NextResponse.json({ error: "Failed to update backup" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    upToDate: false,
    addedToCloud: comparison.localOnlyCorrect,
    keptFromCloud: comparison.dbOnlyCorrect,
    direction: comparison.direction,
    updatedAt: now,
  });
}