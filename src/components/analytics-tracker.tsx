"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { postTrack, setTrackingEnabled } from "@/lib/analytics";
import { supabase } from "@/lib/supabase/client";

// Ignore absurd durations (tab left open for days) so they don't skew averages.
const MAX_PAGE_MS = 1000 * 60 * 60 * 6;

/**
 * Mounted once in the root layout. Records a `pageview` on every route change
 * and a `page_time` (duration) when the visitor leaves the page — via a route
 * change, a hidden tab, or a full unload (sendBeacon, so it survives closing).
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const startRef = useRef(0);
  const flushedRef = useRef(false);

  // Exclude signed-in users (admins) from metrics. Keep the flag in sync with
  // the auth session so it flips immediately on sign-in / sign-out.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setTrackingEnabled(!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setTrackingEnabled(!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    startRef.current = Date.now();
    flushedRef.current = false;

    postTrack({
      event: "pageview",
      path: pathname,
      referrer:
        typeof document !== "undefined" ? document.referrer || null : null,
    });

    const flush = () => {
      if (flushedRef.current) return;
      flushedRef.current = true;
      const ms = Date.now() - startRef.current;
      if (ms > 0 && ms < MAX_PAGE_MS) {
        postTrack({ event: "page_time", path: pathname, duration_ms: ms }, true);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      flush(); // route change / unmount
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  return null;
}
