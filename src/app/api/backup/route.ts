import { randomInt } from "crypto";
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

// Legit states stay well under this (~600KB at the hard caps normalizeProgressState
// applies); anything bigger is garbage or abuse.
const MAX_BODY_CHARS = 1_500_000;

const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

// Failed-attempt throttling (wrong passwords, PIN guessing). Keyed per
// PIN + IP so an attacker hammering a PIN can't lock the real owner out from
// their own IP; an extra per-IP key catches cross-PIN enumeration on GET.
// In-memory and per-instance by design (accepted deployment limitation).
const FAILURE_WINDOW_MS = 15 * 60_000;
const MAX_PASSWORD_FAILURES = 10;
const MAX_PIN_GUESS_FAILURES = 10;
const MAX_MISSES_PER_IP = 30;
const failureLimit = new Map<string, { count: number; resetAt: number }>();

function pruneFailures(now: number) {
  if (failureLimit.size <= 2000) return;
  for (const [k, v] of failureLimit) {
    if (now > v.resetAt) failureLimit.delete(k);
  }
}

function tooManyFailures(key: string, limit: number): boolean {
  const entry = failureLimit.get(key);
  return Boolean(entry) && Date.now() <= entry!.resetAt && entry!.count >= limit;
}

function recordFailure(key: string) {
  const now = Date.now();
  pruneFailures(now);
  const entry = failureLimit.get(key);
  if (!entry || now > entry.resetAt) {
    failureLimit.set(key, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

function clearFailures(key: string) {
  failureLimit.delete(key);
}

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

function generatePin(): string {
  // Cryptographically secure — Math.random() is predictable enough to make
  // 6-digit PINs guessable.
  return String(randomInt(100000, 1000000));
}

/** Parse a JSON body with a hard size cap. Returns `undefined` when oversized. */
async function readJsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) return undefined;
  return JSON.parse(text);
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
    body = await readJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body === undefined) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
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

  // Deliberately do not echo the plaintext password back — the client already
  // holds it and it has no business travelling in a response body.
  return NextResponse.json({ pin });
}

/**
 * GET — restore progress by PIN (read-only, no password required: the client
 * restore flow only asks for the PIN, and progress data is low-sensitivity).
 * Compensating control: hard per-PIN+IP and per-IP throttles on missed
 * lookups, so a 6-digit space can't be enumerated from one instance.
 */
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

  if (
    tooManyFailures(`get:${pin}:${ip}`, MAX_PIN_GUESS_FAILURES) ||
    tooManyFailures(`miss:${ip}`, MAX_MISSES_PER_IP)
  ) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("progress_backups")
    .select("blob, is_template")
    .eq("pin", pin)
    .maybeSingle();

  if (error || !data) {
    recordFailure(`get:${pin}:${ip}`);
    recordFailure(`miss:${ip}`);
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  clearFailures(`get:${pin}:${ip}`);

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
    body = await readJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body === undefined) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
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

  const failureKey = `pw:${pin}:${ip}`;
  if (tooManyFailures(failureKey, MAX_PASSWORD_FAILURES)) {
    return NextResponse.json(
      { error: "Too many failed attempts for this PIN. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const supabase = createAdminClient();
  const incomingBlob = serializeProgressToCloud(state);
  let passwordChecked = false;

  // Read-merge-write with an optimistic-concurrency guard: the UPDATE only
  // applies while updated_at still matches what we read, so two concurrent
  // PUTs can't silently drop each other's merge. On conflict, re-read and
  // re-merge (small bounded retry).
  const MAX_WRITE_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_WRITE_RETRIES; attempt++) {
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

    if (!passwordChecked) {
      if (!verifyPassword(password, backup.password_hash)) {
        recordFailure(failureKey);
        if (tooManyFailures(failureKey, MAX_PASSWORD_FAILURES)) {
          return NextResponse.json(
            { error: "Too many failed attempts for this PIN. Try again in 15 minutes." },
            { status: 429 },
          );
        }
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
      }
      clearFailures(failureKey);
      passwordChecked = true;
    }

    // Convergent merge: the cloud blob only ever grows. Even if the client
    // pushes an empty or stale state (e.g. a fresh browser after restore),
    // nothing that was already backed up can be lost.
    const storedBlob = backup.blob as CloudProgressBlob;
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

    const { data: updatedRows, error: updateError } = await supabase
      .from("progress_backups")
      .update({ blob: mergedBlob, updated_at: now, last_accessed: now })
      .eq("pin", pin)
      .eq("updated_at", backup.updated_at)
      .select("pin");

    if (updateError) {
      console.error("Backup update error:", updateError);
      return NextResponse.json({ error: "Failed to update backup" }, { status: 500 });
    }

    // Guard tripped: someone else wrote between our read and write. Loop and
    // merge against the fresh row.
    if (!updatedRows || updatedRows.length === 0) continue;

    return NextResponse.json({
      ok: true,
      upToDate: false,
      addedToCloud: comparison.localOnlyCorrect,
      keptFromCloud: comparison.dbOnlyCorrect,
      direction: comparison.direction,
      updatedAt: now,
    });
  }

  return NextResponse.json(
    { error: "Backup is being updated by another device. Try again." },
    { status: 409 },
  );
}