import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  Required Supabase table (run in SQL editor):

  CREATE TABLE sync_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    data jsonb NOT NULL,
    hash text,
    created_at timestamptz DEFAULT now(),
    last_accessed timestamptz DEFAULT now(),
    access_count int DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS sync_snapshots_code_idx ON sync_snapshots(code);
  CREATE INDEX IF NOT EXISTS sync_snapshots_created_at_idx ON sync_snapshots(created_at);

  -- RLS (allow anon read by code, insert):
  ALTER TABLE sync_snapshots ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Allow public select by code" ON sync_snapshots FOR SELECT USING (true);
  CREATE POLICY "Allow public insert" ON sync_snapshots FOR INSERT WITH CHECK (true);

  (Each manual save creates a new row + fresh code. Code is valid for 1 week from created_at.
   Cleanup can be manual or via cron/edge function deleting where created_at < now() - 7d)
*/


const CODE_LENGTH = 5;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_RETRIES = 10;
const TTL_DAYS = 7;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / RATE_WINDOW_MS)}`;
  if (rateLimit.size > 1000) {
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

type AdminClient = ReturnType<typeof createAdminClient>;

async function cleanupOld(supabase: AdminClient) {
  const cutoff = new Date(Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('sync_snapshots')
    .delete()
    .lt('created_at', cutoff);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const state =
    typeof body === "object" && body !== null && "state" in body
      ? (body as { state: unknown }).state
      : undefined;
  if (!state || typeof state !== 'object') {
    return NextResponse.json({ error: "state (progress snapshot) is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  await cleanupOld(supabase).catch(() => {});

  let code = '';
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    code = generateCode();
    const { data: taken } = await supabase
      .from('sync_snapshots')
      .select('code')
      .eq('code', code)
      .maybeSingle();
    if (!taken) break;
    attempts++;
  }
  if (!code || attempts >= MAX_RETRIES) {
    return NextResponse.json({ error: "Failed to generate unique code" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from('sync_snapshots').insert({
    code,
    data: state,
    created_at: now,
    last_accessed: now,
    access_count: 0,
  });

  if (error) {
    console.error("Sync snapshot insert error:", error);
    return NextResponse.json({ error: "Failed to store snapshot" }, { status: 500 });
  }

  return NextResponse.json({ code });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.toUpperCase().trim();

  if (!code || code.length !== CODE_LENGTH) {
    return NextResponse.json({ error: "Valid code required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  await cleanupOld(supabase).catch(() => {});

  const { data, error } = await supabase
    .from('sync_snapshots')
    .select('data, created_at')
    .eq('code', code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Snapshot not found or expired" }, { status: 404 });
  }

  const created = new Date(data.created_at);
  const ageDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays > TTL_DAYS) {
    return NextResponse.json({ error: "Snapshot expired" }, { status: 404 });
  }

  await supabase
    .from('sync_snapshots')
    .update({ last_accessed: new Date().toISOString() })
    .eq('code', code);

  return NextResponse.json({ state: data.data });
}
