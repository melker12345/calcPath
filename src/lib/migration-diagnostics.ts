/**
 * Migration Diagnostics (dev-only)
 *
 * Goal: Help the team see exactly which components / import chains are still
 * pulling legacy content (src/lib/modules/*, *-content.ts shims, etc.) so we
 * know precisely what is left to port to the `content/` + FileSystemContentBundle
 * architecture.
 *
 * It also tries to surface the *deeply nested component* responsible when the
 * site crashes with a "legacy-looking" error (e.g. "topics is not defined",
 * ReferenceError on old content vars, empty data causing null crashes in
 * progress or rendering code during the transition).
 *
 * Usage:
 *   - The inert shims and legacy aggregators call registerLegacyImport(...) on load (dev only).
 *   - Key consuming components can call trackLegacyUsageInComponent("SubjectModulePage", "modules") etc.
 *   - In dev you can do in console:  window.__dumpLegacyReport()
 *   - On errors in root ErrorPage / error boundaries we auto-augment messages for content-related crashes
 *     and include the last-seen component render stack if the render tracker is installed.
 *
 * This is intentionally zero-dependency and safe to leave in the tree (all effects are dev-only).
 */

type LegacyReportEntry = {
  source: string;
  stack?: string;
  timestamp: number;
};

const LEGACY_SOURCES = new Set<string>();
const LEGACY_IMPORTS: LegacyReportEntry[] = [];
let RENDER_STACK: string[] = [];
let RENDER_TRACKER_INSTALLED = false;

const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";

function safeStack() {
  try {
    return new Error().stack?.split("\n").slice(2, 8).join("\n") ?? "";
  } catch {
    return "";
  }
}

export function registerLegacyImport(source: string, hint?: string) {
  if (!isDev) return;
  if (LEGACY_SOURCES.has(source)) return;
  LEGACY_SOURCES.add(source);
  LEGACY_IMPORTS.push({
    source: hint ? `${source} (${hint})` : source,
    stack: safeStack(),
    timestamp: Date.now(),
  });
  // Helpful immediate console signal during dev server / HMR
  // (won't spam because of the Set guard)
  // eslint-disable-next-line no-console
  console.warn(
    `%c[MIGRATION] Legacy content source loaded: ${source}\n` +
      `This may still be causing "topics is not defined", empty data, or chunk evaluation issues on real routes.\n` +
      `Import stack (top of):\n${safeStack()}`,
    "color:#c2410f;font-family:monospace"
  );
}

export function trackLegacyUsageInComponent(componentName: string, legacyKind: string) {
  if (!isDev) return;
  registerLegacyImport(`component:${componentName}`, `uses ${legacyKind}`);
  // Also push to a render-time visible stack for crash correlation
  pushRenderComponent(componentName);
}

export function getLegacyReport() {
  return {
    sources: Array.from(LEGACY_SOURCES),
    imports: [...LEGACY_IMPORTS],
  };
}

export function dumpLegacyReportToConsole() {
  if (!isDev) {
    // eslint-disable-next-line no-console
    console.log("[MIGRATION] dumpLegacyReport only works in development.");
    return;
  }
  // eslint-disable-next-line no-console
  console.group("%c[Migration Diagnostics] Legacy content usage report", "color:#c2410f;font-weight:bold");
  // eslint-disable-next-line no-console
  console.table(getLegacyReport().imports.map((e) => ({
    source: e.source,
    when: new Date(e.timestamp).toISOString(),
  })));
  // eslint-disable-next-line no-console
  console.log("Full stacks (newest first):");
  [...LEGACY_IMPORTS].reverse().forEach((e, i) => {
    // eslint-disable-next-line no-console
    console.log(`#${i} ${e.source}\n${e.stack || "(no stack captured)"}`);
  });
  // eslint-disable-next-line no-console
  console.groupEnd();
}

// Expose on window in dev for easy access from browser console
if (isDev && typeof window !== "undefined") {
  (window as any).__dumpLegacyReport = dumpLegacyReportToConsole;
  (window as any).__getLegacyReport = getLegacyReport;
}

// --- Render stack tracking for "which deeply nested component was rendering?" ---

function pushRenderComponent(name: string) {
  if (!isDev) return;
  if (!RENDER_TRACKER_INSTALLED) installRenderTracker();
  // Keep last ~12 to avoid unbounded growth
  RENDER_STACK.push(name);
  if (RENDER_STACK.length > 12) RENDER_STACK.shift();
}

function popRenderComponent() {
  RENDER_STACK.pop();
}

function installRenderTracker() {
  if (RENDER_TRACKER_INSTALLED || typeof window === "undefined") return;
  RENDER_TRACKER_INSTALLED = true;

  try {
    // In dev we can patch React.createElement to observe function/class component renders.
    // This is a well-known technique; we only do it in development.
    // We avoid patching in a way that would break production.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require("react") as typeof import("react");

    const origCreateElement = React.createElement;

    (React as any).createElement = function patchedCreateElement(type: any, props: any, ...children: any[]) {
      let displayName: string | undefined;

      if (typeof type === "function") {
        displayName = (type as any).displayName || (type as any).name || "AnonymousFn";
      } else if (typeof type === "object" && type && (type as any).$$typeof) {
        // forwardRef, memo, etc.
        displayName = (type as any).displayName || (type as any).type?.name || "AnonymousSpecial";
      }

      if (displayName && displayName !== "div" && displayName !== "span" && !displayName.startsWith("_")) {
        pushRenderComponent(displayName);
        // We can't reliably pop for every element (many are primitives), so we just keep a short rolling buffer.
        // The most recently pushed names at the time of a crash are the deepest in the current tree.
        // We also opportunistically trim old entries on a timer (cheap).
        setTimeout(() => {
          // opportunistic trim of very old entries
          if (RENDER_STACK.length > 8) RENDER_STACK = RENDER_STACK.slice(-8);
        }, 0);
      }

      return origCreateElement(type, props, ...children);
    };

    // Also hook console.error for the Next.js redbox so we can append our stack when it fires for known patterns.
    const origConsoleError = console.error;
    console.error = function (...args: any[]) {
      try {
        const first = args[0];
        const msg = typeof first === "string" ? first : (first && first.message) || String(first);
        if (isContentRelatedErrorMessage(msg)) {
          const extra = buildMigrationCrashNote();
          // Append our note without breaking the original call
          args = [...args, "\n" + extra];
        }
      } catch {
        /* never break logging */
      }
      return origConsoleError.apply(this, args as any);
    };
  } catch {
    // If React isn't there or patching fails, diagnostics just degrade gracefully.
  }
}

function isContentRelatedErrorMessage(msg: string): boolean {
  const lower = (msg || "").toLowerCase();
  return (
    lower.includes("topics is not defined") ||
    lower.includes("is not defined") && (lower.includes("topic") || lower.includes("problem") || lower.includes("module")) ||
    lower.includes("cannot read") && (lower.includes("topic") || lower.includes("problem") || lower.includes("of undefined")) ||
    lower.includes("legacy") ||
    lower.includes("getfilesytemcontentbundle") || // common misspelling guard
    lower.includes("getfilesystemcontentbundle")
  );
}

function buildMigrationCrashNote(): string {
  const report = getLegacyReport();
  const stack = RENDER_STACK.length ? RENDER_STACK.slice().reverse().join(" > ") : "(no render stack captured yet)";
  return (
    "[MIGRATION DIAGNOSTIC]\n" +
    "This error looks related to the content-driven architecture port (legacy shims, src/lib/modules, or code assuming old shapes).\n" +
    "Most recent component render stack (deepest last):\n  " +
    stack +
    "\n\n" +
    "Legacy sources loaded in this session:\n  " +
    (report.sources.length ? report.sources.join("\n  ") : "(none recorded)") +
    "\n\n" +
    "Run  window.__dumpLegacyReport()  in the console for full import stacks.\n" +
    "See src/lib/content/NOTES.md (and git history for one.md etc) for migration context."
  );
}

// Install the render tracker eagerly in dev (safe)
if (isDev) {
  // The patch happens lazily on first createElement via installRenderTracker(),
  // but we can also eagerly attempt once the module is touched by anything.
  // Touching it from an error boundary or root layout is enough.
  // We schedule a no-op to trigger the require side in some bundlers.
  Promise.resolve().then(() => {
    // no-op
  });
}

// Public helper for error boundaries to call on catch
export function onContentRelatedError(error: unknown) {
  if (!isDev) return;
  try {
    const msg = error instanceof Error ? error.message : String(error);
    if (isContentRelatedErrorMessage(msg)) {
      // eslint-disable-next-line no-console
      console.error(buildMigrationCrashNote());
      // Also dump the current legacy report automatically
      dumpLegacyReportToConsole();
    }
  } catch {
    /* ignore */
  }
}

// Also expose a manual trigger
if (isDev && typeof window !== "undefined") {
  (window as any).__explainMigrationCrash = () => {
    // eslint-disable-next-line no-console
    console.error(buildMigrationCrashNote());
  };
}

export const __migrationDiagnostics = {
  registerLegacyImport,
  trackLegacyUsageInComponent,
  getLegacyReport,
  dumpLegacyReportToConsole,
  onContentRelatedError,
};