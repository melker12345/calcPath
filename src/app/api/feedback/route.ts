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
    // Notes attached to votes are optional; if provided they must be reasonable.
    const note = body.message;
    if (note !== undefined && note !== null && typeof note !== "string") {
      return NextResponse.json({ error: "message must be a string" }, { status: 400 });
    }
    if (typeof note === "string" && note.length > 1000) {
      return NextResponse.json(
        { error: "Note is too long (max 1000 characters)" },
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

  // For votes, prefer the user_id verified from the bearer token (so people can't
  // spoof another user's id and cancel their vote). Falls back to the body id
  // (which is fine for anonymous users — they have nothing to verify against).
  const verifiedUserId = await getAuthUserId(request);
  const claimedUserId = (body.user_id as string) || null;
  const userId = verifiedUserId ?? claimedUserId;

  const row: Record<string, unknown> = {
    kind,
    user_id: userId,
    page_url: (body.page_url as string)?.slice(0, 500) || null,
  };

  if (kind === "vote") {
    row.target_type = (body.target_type as string).slice(0, 50);
    row.target_id = (body.target_id as string).slice(0, 200);

    // Signed-in user with a verified identity: enforce one row per (user, target)
    // and apply the cancellation rule — clicking the same thumb again, or the
    // opposite thumb, both transition the row to vote=0.
    if (verifiedUserId) {
      const { data: existing, error: lookupError } = await supabase
        .from("feedback")
        .select("id, vote")
        .eq("kind", "vote")
        .eq("user_id", verifiedUserId)
        .eq("target_type", row.target_type)
        .eq("target_id", row.target_id)
        .limit(1)
        .maybeSingle();

      if (lookupError) {
        console.error("Feedback vote lookup error:", lookupError.message);
        return NextResponse.json({ error: "Failed to save vote" }, { status: 500 });
      }

      const clickedVote = body.vote as 1 | -1;

      if (existing) {
        // Anything other than a fresh state (vote === 0 or null) collapses the
        // click to a cancellation. Note is preserved across vote toggles.
        const nextVote =
          existing.vote !== null && existing.vote !== 0 ? 0 : clickedVote;

        const { error: updateError } = await supabase
          .from("feedback")
          .update({ vote: nextVote })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Feedback vote update error:", updateError.message);
          return NextResponse.json({ error: "Failed to save vote" }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: existing.id, vote: nextVote });
      }

      // No existing row: fall through to insert below with vote=clicked.
      row.vote = clickedVote;
    } else {
      // Anonymous: every click is its own row, no cancellation possible.
      row.vote = body.vote;
    }
  } else {
    row.message = (body.message as string).trim().slice(0, 5000);
  }

  const { data: inserted, error } = await supabase
    .from("feedback")
    .insert(row)
    .select("id, vote")
    .single();

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

  return NextResponse.json({
    ok: true,
    id: inserted?.id ?? null,
    vote: inserted?.vote ?? null,
  });
}

/**
 * Attach (or replace) a note on an existing vote row. Auth-gated: the requester
 * must be signed in and own the row. Anonymous votes are immutable here; they
 * have no identity to gate against.
 */
export async function PATCH(request: Request) {
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

  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required to leave a note." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = body.id;
  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const message = (body.message as string | undefined)?.trim();
  if (!message || message.length < 1) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json(
      { error: "Note is too long (max 1000 characters)" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("feedback")
    .update({ message: message.slice(0, 1000) })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("kind", "vote")
    .select("id");

  if (error) {
    console.error("Feedback PATCH error:", error.message);
    return NextResponse.json({ error: "Failed to attach note" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Vote not found, or it isn't yours to edit." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

async function getAuthUser(
  request: Request,
): Promise<{ id: string; email: string | null } | null> {
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
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

async function getAuthEmail(request: Request): Promise<string | null> {
  return (await getAuthUser(request))?.email ?? null;
}

async function getAuthUserId(request: Request): Promise<string | null> {
  return (await getAuthUser(request))?.id ?? null;
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
