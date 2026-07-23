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

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_RE.test(ua)) return NextResponse.json({ ok: true });

  const payload = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = str(payload.event, 60);
  if (!event) return NextResponse.json({ ok: false }, { status: 400 });

  const row = {
    event,
    visitor_id: str(payload.visitor_id, 64),
    session_id: str(payload.session_id, 64),
    path: str(payload.path, 512),
    referrer: str(payload.referrer, 512),
    duration_ms: dur(payload.duration_ms),
    meta:
      payload.meta && typeof payload.meta === "object" ? payload.meta : null,
  };

  try {
    const supabase = createAdminClient();
    await supabase.from("analytics_events").insert(row);
  } catch {
    // Analytics is best-effort; never surface failures to the client.
  }

  return NextResponse.json({ ok: true });
}
