import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildChapterSnapshot, buildQuestionSnapshot } from "@/lib/server/report-snapshot";
import {
  MESSAGE_MAX,
  REASONS_BY_KIND,
  type LearnerContext,
  type ReportKind,
  type ReportSnapshot,
  type ReportStatus,
} from "@/lib/reports";

/**
 * /api/feedback — the `reports` table.
 *
 *   POST  (public)  file a report; the server snapshots the content it points at
 *   GET   (admin)   list reports:  ?status=open|fixed|dismissed&kind=&subject=&limit=
 *   PATCH (admin)   set status:    { ids: string[], status }
 *
 * Admin = a Supabase session whose email is in ADMIN_EMAIL (comma separated).
 * Without Supabase env vars every method answers 503 rather than throwing, so
 * the build and the rest of the site never depend on them.
 */

const KINDS: ReportKind[] = ["question", "chapter", "site"];
const STATUSES: ReportStatus[] = ["open", "fixed", "dismissed"];
const SLUG_RE = /^[a-z0-9-]{1,100}$/;
const LEARNER_MAX_CHARS = 8000;
const PAGE_URL_MAX = 500;

// In-process limiter (per serverless instance by design; good enough for spam).
const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / RATE_WINDOW_MS)}`;
  if (rateLimit.size > 10_000) {
    const cutoff = Math.floor(now / RATE_WINDOW_MS);
    for (const k of rateLimit.keys()) if (!k.endsWith(`:${cutoff}`)) rateLimit.delete(k);
  }
  const count = rateLimit.get(key) ?? 0;
  if (count >= MAX_PER_WINDOW) return true;
  rateLimit.set(key, count + 1);
  return false;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function hasAdminEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const unavailable = () =>
  NextResponse.json({ error: "Reports are not configured on this deployment." }, { status: 503 });

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

function optionalSlug(v: unknown, name: string): { value: string | null } | { error: string } {
  if (v === undefined || v === null || v === "") return { value: null };
  if (typeof v !== "string" || !SLUG_RE.test(v)) return { error: `${name} must be a short kebab-case id` };
  return { value: v };
}

export async function POST(request: Request) {
  if (!hasAdminEnv()) return unavailable();
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid JSON");
  }

  const kind = body.kind as ReportKind;
  if (!KINDS.includes(kind)) return bad("kind must be question, chapter or site");

  const reason = body.reason;
  if (typeof reason !== "string" || !REASONS_BY_KIND[kind].includes(reason)) {
    return bad("reason is not one of the allowed reasons for this kind");
  }

  const rawMessage = body.message;
  if (rawMessage !== undefined && rawMessage !== null && typeof rawMessage !== "string") {
    return bad("message must be a string");
  }
  const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
  if (message.length > MESSAGE_MAX[kind]) return bad(`message is too long (max ${MESSAGE_MAX[kind]} characters)`);
  if ((reason === "Other" || kind === "site") && message.length < 3) {
    return bad("Please describe the problem in a few words");
  }

  const pageUrl =
    typeof body.pageUrl === "string" && body.pageUrl.length > 0 ? body.pageUrl.slice(0, PAGE_URL_MAX) : null;

  let learner: LearnerContext | null = null;
  if (body.learner !== undefined && body.learner !== null) {
    const l = body.learner;
    if (typeof l !== "object" || Array.isArray(l)) return bad("learner must be an object");
    if (JSON.stringify(l).length > LEARNER_MAX_CHARS) return bad("learner context is too large");
    learner = l as LearnerContext;
  }

  const subject = optionalSlug(body.subject, "subject");
  const topicId = optionalSlug(body.topicId, "topicId");
  const section = optionalSlug(body.section, "section");
  const questionId = optionalSlug(body.questionId, "questionId");
  for (const f of [subject, topicId, section, questionId]) if ("error" in f) return bad(f.error);
  const subj = (subject as { value: string | null }).value;
  const topic = (topicId as { value: string | null }).value;
  const sec = (section as { value: string | null }).value;
  const qid = (questionId as { value: string | null }).value;

  let snapshot: ReportSnapshot | null = null;
  if (kind === "question") {
    if (!subj || !topic || !qid) return bad("question reports need subject, topicId and questionId");
    snapshot = await buildQuestionSnapshot(subj, topic, qid);
    if (!snapshot) return bad("Unknown question");
  } else if (kind === "chapter") {
    if (!subj || !topic) return bad("chapter reports need subject and topicId");
    snapshot = await buildChapterSnapshot(subj, topic, sec);
    if (!snapshot) return bad("Unknown chapter");
  }

  const row = {
    kind,
    subject: subj,
    topic_id: topic,
    section: kind === "question" ? (snapshot as { sectionSlug: string }).sectionSlug : sec,
    question_id: kind === "question" ? qid : null,
    reason,
    message: message || null,
    page_url: pageUrl,
    snapshot,
    learner: kind === "question" ? learner : null,
  };

  const { data, error } = await createAdminClient().from("reports").insert(row).select("id").single();
  if (error) {
    // Schema problems stay in the server log; the client gets a generic message.
    console.error("Report insert error:", error.message, error.details, error.hint);
    return NextResponse.json({ error: "Failed to save the report" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data?.id ?? null });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Resolves the bearer token to an email via Supabase Auth; null when invalid. */
async function bearerEmail(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  const client = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await client.auth.getUser(token);
  return data.user?.email?.toLowerCase() ?? null;
}

async function requireAdmin(request: Request): Promise<NextResponse | null> {
  const allowed = adminEmails();
  if (allowed.length === 0) return NextResponse.json({ error: "No admin configured" }, { status: 403 });
  const email = await bearerEmail(request);
  if (!email || !allowed.includes(email)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  return null;
}

export async function GET(request: Request) {
  if (!hasAdminEnv()) return unavailable();
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const kind = url.searchParams.get("kind");
  const subject = url.searchParams.get("subject");
  const limitRaw = Number(url.searchParams.get("limit") ?? 200);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 1000) : 200;

  let query = createAdminClient()
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status && STATUSES.includes(status as ReportStatus)) query = query.eq("status", status);
  if (kind && KINDS.includes(kind as ReportKind)) query = query.eq("kind", kind);
  if (subject && SLUG_RE.test(subject)) query = query.eq("subject", subject);

  const { data, error } = await query;
  if (error) {
    console.error("Report fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
  return NextResponse.json({ reports: data ?? [] });
}

export async function PATCH(request: Request) {
  if (!hasAdminEnv()) return unavailable();
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid JSON");
  }
  const status = body.status as ReportStatus;
  if (!STATUSES.includes(status)) return bad("status must be open, fixed or dismissed");
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/.test(id))
    : [];
  if (ids.length === 0) return bad("ids are required");
  if (ids.length > 500) return bad("Too many ids in one update");

  const { error } = await createAdminClient()
    .from("reports")
    .update({ status, resolved_at: status === "open" ? null : new Date().toISOString() })
    .in("id", ids);
  if (error) {
    console.error("Report status update error:", error.message);
    return NextResponse.json({ error: "Failed to update reports" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ids, status });
}
