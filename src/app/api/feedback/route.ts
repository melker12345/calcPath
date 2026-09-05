import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveFeedbackTargetMeta } from "@/lib/server/feedback-target-meta";

const VALID_KINDS = ["bug", "feature", "general", "vote"] as const;
type Kind = (typeof VALID_KINDS)[number];
const VALID_STATUSES = ["open", "fixed", "trash"] as const;
type FeedbackStatus = (typeof VALID_STATUSES)[number];

const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

/**
 * Opaque proof-of-creation token for anonymous vote rows. The POST response
 * hands it to the client that created the row; PATCH requires it back before
 * an anonymous caller may edit that row's note. HMAC over the row id with a
 * server-side secret, so knowing a row id alone is not enough to edit it.
 */
function makeEditToken(rowId: string): string | null {
  const secret =
    process.env.FEEDBACK_EDIT_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`feedback-edit:${rowId}`).digest("base64url");
}

function verifyEditToken(rowId: string, token: unknown): boolean {
  if (typeof token !== "string" || token.length === 0) return false;
  const expected = makeEditToken(rowId);
  if (!expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

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

  // Only ever attribute a row to a user id verified from the bearer token.
  // A client-supplied body.user_id is ignored: trusting it would let anyone
  // pre-seed rows attributed to a victim's id (and, for votes, collapse the
  // victim's next genuine vote into a cancellation). Anonymous rows get null.
  const verifiedUserId = await getAuthUserId(request);
  const userId = verifiedUserId;

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

        return NextResponse.json({
          ok: true,
          id: existing.id,
          vote: nextVote,
          edit_token: makeEditToken(existing.id),
        });
      }

      // No existing row: fall through to insert below with vote=clicked.
      row.vote = clickedVote;
    } else {
      // Anonymous: every click is its own row, no cancellation possible.
      row.vote = body.vote;
    }
  } else {
    row.message = (body.message as string).trim().slice(0, 5000);
    // Reports/feature requests may carry a target too (e.g. the practice
    // question the "Report issue" form was opened on) — keep it so the admin
    // panel can show exactly which problem the report is about.
    if (typeof body.target_type === "string" && body.target_type) {
      row.target_type = body.target_type.slice(0, 50);
    }
    if (typeof body.target_id === "string" && body.target_id) {
      row.target_id = body.target_id.slice(0, 200);
    }
    // Structured report context (what the user typed, expected answer, hint
    // use…) sent by the practice UI so "Answer seems wrong" reports are
    // reproducible. Must be a plain object and reasonably small.
    const context = body.context;
    if (
      context &&
      typeof context === "object" &&
      !Array.isArray(context) &&
      JSON.stringify(context).length <= 4000
    ) {
      row.context = context;
    }
  }

  let { data: inserted, error } = await supabase
    .from("feedback")
    .insert(row)
    .select("id, vote")
    .single();

  // A live DB that predates the `context` column would reject the whole row —
  // in that case keep the report and drop only the context.
  if (error && row.context !== undefined && /context/i.test(error.message ?? "")) {
    delete row.context;
    ({ data: inserted, error } = await supabase
      .from("feedback")
      .insert(row)
      .select("id, vote")
      .single());
  }

  if (error) {
    // Detail (including schema problems like a missing table) stays in the
    // server logs only — clients get a generic message.
    console.error("Feedback insert error:", error.message, error.details, error.hint);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id: inserted?.id ?? null,
    vote: inserted?.vote ?? null,
    // Lets the (possibly anonymous) creator attach a note to this row later.
    edit_token: kind === "vote" && inserted?.id ? makeEditToken(inserted.id) : null,
  });
}

/**
 * Attach (or replace) a note on an existing vote row. Ownership-gated: the
 * requester must present the edit_token that POST returned when the row was
 * created (anonymous flow), or be signed in as the row's user_id.
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.status !== undefined) {
    const adminEmails = getAdminEmails();
    if (adminEmails.length === 0) {
      return NextResponse.json({ error: "No admin configured" }, { status: 403 });
    }

    const authUser = await getAuthUser(request);
    if (!authUser?.email || !adminEmails.includes(authUser.email.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const status = body.status as FeedbackStatus;
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === "string" && id.length > 0)
      : typeof body.id === "string" && body.id.length > 0
        ? [body.id]
        : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "id or ids are required" }, { status: 400 });
    }
    if (ids.length > 500) {
      return NextResponse.json({ error: "Too many feedback rows in one update" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("feedback")
      .update({ status })
      .in("id", ids);

    if (error) {
      console.error("Feedback status update error:", error.message);
      return NextResponse.json({ error: "Failed to update feedback status" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status, ids });
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

  // Ownership enforcement. Two ways to prove the row is yours:
  //  1. edit_token — the HMAC proof handed out by POST to whoever created the
  //     row (works for anonymous votes, which have no user identity), or
  //  2. a bearer token whose verified user id matches the row's user_id.
  // Knowing a row id alone is NOT enough to edit it.
  const hasValidEditToken = verifyEditToken(id, body.edit_token);
  const userId = hasValidEditToken ? null : await getAuthUserId(request);
  if (!hasValidEditToken && !userId) {
    return NextResponse.json(
      { error: "You are not allowed to edit this vote." },
      { status: 403 },
    );
  }

  const supabase = createAdminClient();
  let update = supabase
    .from("feedback")
    .update({ message: message.slice(0, 1000) })
    .eq("id", id)
    .eq("kind", "vote");
  if (!hasValidEditToken && userId) {
    update = update.eq("user_id", userId);
  }
  const { data, error } = await update.select("id");

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

function getAdminEmails() {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
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

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const limitRaw = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 1000)
    : 50;

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

  // Feedback is anonymous: we deliberately do NOT join submitter emails from the
  // profiles table. The inbox shows content only, never who sent it.
  // Each row is enriched with target_meta (subject/topic/question/prompt) so the
  // inbox can show exactly which question a report is about — resolved at read
  // time, so rows submitted before this existed get it too.
  const feedback = await Promise.all(
    (data ?? []).map(async (row) => ({
      ...row,
      user_email: null,
      target_meta: await resolveFeedbackTargetMeta(row.target_type, row.target_id),
    })),
  );

  return NextResponse.json({ feedback });
}
