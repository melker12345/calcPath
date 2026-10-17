import { handleFeedback } from "./feedback";

/**
 * The only code that runs per request. Everything else on the site is static
 * files from `npm run build` (out/), served by Cloudflare before this worker
 * is reached; wrangler.jsonc sends /api/* and /report-data/* here first.
 *
 *   /api/feedback   reports (worker/feedback.ts)
 *   /report-data/*  build output this worker reads; not public
 *   anything else   no file matched: an old practice link whose redirect
 *                   depends on ?section= (out/report-data/redirects.json,
 *                   from scripts/cloudflare-assets.ts), else out/404.html
 */

export interface Env {
  ASSETS: { fetch(input: Request | URL | string): Promise<Response> };
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  ADMIN_EMAIL?: string;
}

/** Old path → where it goes for each ?section=, and without one. */
export type SectionRedirects = Record<string, { sections: Record<string, string>; fallback: string | null }>;

let sectionRedirects: Promise<SectionRedirects> | null = null;

function loadSectionRedirects(env: Env, url: URL): Promise<SectionRedirects> {
  sectionRedirects ??= env.ASSETS.fetch(new URL("/report-data/redirects.json", url)).then((r) =>
    r.ok ? (r.json() as Promise<SectionRedirects>) : {},
  );
  return sectionRedirects;
}

async function notFound(env: Env, url: URL): Promise<Response> {
  const page = await env.ASSETS.fetch(new URL("/404", url));
  return new Response(page.body, { status: 404, headers: page.headers });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/feedback") return handleFeedback(request, env);
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/report-data/")) return notFound(env, url);

    const moved = (await loadSectionRedirects(env, url))[url.pathname];
    if (moved) {
      const section = url.searchParams.get("section");
      const to = (section && moved.sections[section]) || moved.fallback;
      if (to) return Response.redirect(new URL(to, url).toString(), 308);
    }
    return notFound(env, url);
  },
};

export default worker;
