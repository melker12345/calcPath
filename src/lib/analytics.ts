export type AnalyticsEvent = {
  name: string;
  payload?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

const VISITOR_KEY = "calc_visitor_id";
const SESSION_KEY = "calc_session_id";

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through to fallback */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable anonymous id for this browser (localStorage). No PII. */
export function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Per-tab session id (sessionStorage: persists across navigations, resets on new tab). */
export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

type TrackPayload = {
  event: string;
  path?: string | null;
  referrer?: string | null;
  duration_ms?: number | null;
  meta?: Record<string, unknown> | null;
};

// Whether to record this client's activity. Signed-in users are excluded from
// metrics — and since the app has no public signup, the only accounts are
// admins, so an auth session == admin. `null` means "not resolved yet"; we then
// fall back to a synchronous localStorage probe so the very first pageview is
// gated correctly before the async auth check completes.
let trackingEnabled: boolean | null = null;

function hasSupabaseSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const value = localStorage.getItem(key);
        if (value && value.includes("access_token")) return true;
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Called by the auth watcher: disable tracking while a session is active. */
export function setTrackingEnabled(enabled: boolean) {
  trackingEnabled = enabled;
}

function isTrackingEnabled(): boolean {
  if (trackingEnabled === null) trackingEnabled = !hasSupabaseSession();
  return trackingEnabled;
}

/**
 * Low-level send to /api/track. Uses sendBeacon when `useBeacon` is set so the
 * request survives page unload (used for time-on-page). Always best-effort.
 */
export function postTrack(payload: TrackPayload, useBeacon = false) {
  if (typeof window === "undefined") return;
  if (!isTrackingEnabled()) return;
  const body = JSON.stringify({
    ...payload,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
  });
  try {
    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: useBeacon,
  }).catch(() => undefined);
}

/** Backwards-compatible custom-event helper used across the app. */
export const trackEvent = (name: string, payload?: AnalyticsEvent["payload"]) => {
  if (typeof window === "undefined") return;
  postTrack({
    event: name,
    path: window.location?.pathname ?? null,
    meta: payload ?? null,
  });
};
