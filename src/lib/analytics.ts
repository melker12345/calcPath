export type AnalyticsEvent = {
  name: string;
  payload?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

const EVENTS_KEY = "calc_analytics_v1";

export const trackEvent = (name: string, payload?: AnalyticsEvent["payload"]) => {
  if (typeof window === "undefined") return;
  const event: AnalyticsEvent = {
    name,
    payload,
    createdAt: new Date().toISOString(),
  };
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    const events = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    const nextEvents = [event, ...events].slice(0, 200);
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(nextEvents));
  } catch {
    // Ignore analytics failures.
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => undefined);
};
