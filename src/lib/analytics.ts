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

/**
 * Low-level send to /api/track. Uses sendBeacon when `useBeacon` is set so the
 * request survives page unload (used for time-on-page). Always best-effort.
 */
export function postTrack(payload: TrackPayload, useBeacon = false) {
  if (typeof window === "undefined") return;
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
