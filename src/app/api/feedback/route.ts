import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_KINDS = ["bug", "feature", "general", "vote"] as const;
type Kind = (typeof VALID_KINDS)[number];

const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / RATE_WINDOW_MS)}`;

  // Clean old entries periodically
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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const kind = body.kind as Kind;
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json(
      { error: "Invalid kind. Must be one of: bug, feature, general, vote" },
      { status: 400 },
    );
  }

  if (kind === "vote") {
    const vote = body.vote as number;
    if (vote !== 1 && vote !== -1) {
      return NextResponse.json({ error: "vote must be 1 or -1" }, { status: 400 });
    }
    if (!body.target_type || !body.target_id) {
      return NextResponse.json(
        { error: "target_type and target_id are required for votes" },
        { status: 400 },
      );
    }
  } else {
    const message = (body.message as string)?.trim();
    if (!message || message.length < 3) {
      return NextResponse.json(
        { error: "Message must be at least 3 characters" },
        { status: 400 },
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 },
      );
    }
  }

  const supabase = createAdminClient();

  const row: Record<string, unknown> = {
    kind,
    user_id: (body.user_id as string) || null,
    page_url: (body.page_url as string)?.slice(0, 500) || null,
  };

  if (kind === "vote") {
    row.vote = body.vote;
    row.target_type = (body.target_type as string).slice(0, 50);
    row.target_id = (body.target_id as string).slice(0, 200);
  } else {
    row.message = (body.message as string).trim().slice(0, 5000);
  }

  const { error } = await supabase.from("feedback").insert(row);

  if (error) {
    console.error("Feedback insert error:", error.message, error.details, error.hint);
    const isTableMissing = error.message?.includes("relation") && error.message?.includes("does not exist");
    return NextResponse.json(
      {
        error: isTableMissing
          ? "Feedback table not found. Run the schema migration in Supabase SQL editor."
          : "Failed to save feedback",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
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

export async function GET(request: Request) {
  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    return NextResponse.json({ error: "No admin configured" }, { status: 403 });
  }

  const email = await getAuthEmail(request);
  if (!email || !adminEmails.includes(email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);

  const supabase = createAdminClient();

  let query = supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Feedback fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }

  const userIds = [...new Set((data ?? []).map((row) => row.user_id).filter(Boolean))] as string[];
  let emailByUserId = new Map<string, string | null>();

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id,email")
      .in("id", userIds);

    if (profilesError) {
      console.error("Feedback profile fetch error:", profilesError.message);
    } else {
      emailByUserId = new Map(
        (profiles ?? []).map((profile) => [profile.id as string, (profile.email as string | null) ?? null]),
      );
    }
  }

  const feedback = (data ?? []).map((row) => ({
    ...row,
    user_email: row.user_id ? emailByUserId.get(row.user_id) ?? null : null,
  }));

  return NextResponse.json({ feedback });
}
