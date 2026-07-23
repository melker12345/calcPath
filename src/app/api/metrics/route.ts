import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

function getAdminEmails() {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function getAuthEmail(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const client = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await client.auth.getUser(token);
  return data.user?.email ?? null;
}

function sinceFor(range: string): string {
  const now = Date.now();
  if (range === "7d") return new Date(now - 7 * 86_400_000).toISOString();
  if (range === "30d") return new Date(now - 30 * 86_400_000).toISOString();
  return new Date("2000-01-01T00:00:00.000Z").toISOString(); // all-time
}

export async function GET(request: Request) {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return NextResponse.json({ error: "No admin configured" }, { status: 403 });
  }
  const email = await getAuthEmail(request);
  if (!email || !adminEmails.includes(email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rangeParam = new URL(request.url).searchParams.get("range") ?? "all";
  const range = ["all", "7d", "30d"].includes(rangeParam) ? rangeParam : "all";
  const since = sinceFor(range);
  const supabase = createAdminClient();

  const [summary, daily, topPaths] = await Promise.all([
    supabase.rpc("analytics_summary", { since }),
    supabase.rpc("analytics_daily", { since }),
    supabase.rpc("analytics_top_paths", { since, max_rows: 12 }),
  ]);

  const err = summary.error || daily.error || topPaths.error;
  if (err) {
    console.error("Metrics query error:", err.message);
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }

  return NextResponse.json({
    range,
    summary:
      summary.data?.[0] ?? {
        visitors: 0,
        sessions: 0,
        pageviews: 0,
        avg_session_ms: 0,
      },
    daily: daily.data ?? [],
    topPaths: topPaths.data ?? [],
  });
}
