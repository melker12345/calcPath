import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Drop obvious crawlers/bots so they don't inflate visitor counts.
const BOT_RE =
  /bot|crawler|spider|crawling|slurp|bingpreview|headlesschrome|lighthouse|pingdom|facebookexternalhit|embedly|whatsapp|telegrambot/i;

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.length ? v.slice(0, max) : null;
}

function dur(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
  return Math.min(Math.round(v), 1000 * 60 * 60 * 6);
}

// Legit tracking payloads are a few hundred bytes; meta is small key/value data.
const MAX_BODY_CHARS = 10_000;
const MAX_META_CHARS = 2_000;

// Same in-process limiter pattern as the other API routes (per-instance by design).
const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / RATE_WINDOW_MS)}`;
  if (rateLimit.size > 10_000) {
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

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_RE.test(ua)) return NextResponse.json({ ok: true });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    // Analytics is best-effort; drop silently so clients never retry loops.
    return NextResponse.json({ ok: true });
  }

  const text = await request.text().catch(() => null);
  if (!text || text.length > MAX_BODY_CHARS) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      payload = parsed as Record<string, unknown>;
    }
  } catch {
    payload = null;
  }
  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = str(payload.event, 60);
  if (!event) return NextResponse.json({ ok: false }, { status: 400 });

  // Bounded meta: plain object only, and small once serialized.
  let meta: Record<string, unknown> | null = null;
  if (
    payload.meta &&
    typeof payload.meta === "object" &&
    !Array.isArray(payload.meta) &&
    JSON.stringify(payload.meta).length <= MAX_META_CHARS
  ) {
    meta = payload.meta as Record<string, unknown>;
  }

  const row = {
    event,
    visitor_id: str(payload.visitor_id, 64),
    session_id: str(payload.session_id, 64),
    path: str(payload.path, 512),
    referrer: str(payload.referrer, 512),
    duration_ms: dur(payload.duration_ms),
    meta,
  };

  try {
    const supabase = createAdminClient();
    await supabase.from("analytics_events").insert(row);
  } catch {
    // Analytics is best-effort; never surface failures to the client.
  }

  return NextResponse.json({ ok: true });
}
