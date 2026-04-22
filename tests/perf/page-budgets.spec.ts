import { expect, test, type Page } from "@playwright/test";
import { routeBudgets, type RouteBudget } from "./routes";

type BrowserMetrics = {
  documentTransferBytes: number;
  scriptTransferBytes: number;
  stylesheetTransferBytes: number;
  totalTransferBytes: number;
  timeToFirstByteMs: number;
  domContentLoadedMs: number;
  loadMs: number;
  sameOriginResourceCount: number;
};

function formatBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function formatMetrics(route: RouteBudget, metrics: BrowserMetrics) {
  return [
    `${route.name} (${route.path}) exceeded its performance budget.`,
    `Document transfer: ${formatBytes(metrics.documentTransferBytes)} / ${formatBytes(route.maxDocumentTransferBytes)}`,
    `Scripts: ${formatBytes(metrics.scriptTransferBytes)} / ${formatBytes(route.maxScriptTransferBytes)}`,
    `Stylesheets: ${formatBytes(metrics.stylesheetTransferBytes)} / ${formatBytes(route.maxStylesheetTransferBytes)}`,
    `Total same-origin transfer: ${formatBytes(metrics.totalTransferBytes)} / ${formatBytes(route.maxTotalTransferBytes)}`,
    `TTFB: ${Math.round(metrics.timeToFirstByteMs)} ms / ${route.maxTimeToFirstByteMs} ms`,
    `DOMContentLoaded: ${Math.round(metrics.domContentLoadedMs)} ms / ${route.maxDomContentLoadedMs} ms`,
    `Load: ${Math.round(metrics.loadMs)} ms / ${route.maxLoadMs} ms`,
    `Same-origin resources counted: ${metrics.sameOriginResourceCount}`,
  ].join("\n");
}

async function collectBrowserMetrics(page: Page, origin: string): Promise<BrowserMetrics> {
  try {
    await page.waitForLoadState("networkidle", { timeout: 3_000 });
  } catch {
    // Some pages keep light background activity; the load event remains the primary timing boundary.
  }

  return page.evaluate((siteOrigin) => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const resourceEntries = performance
      .getEntriesByType("resource")
      .map((entry) => entry as PerformanceResourceTiming)
      .filter((entry) => entry.name.startsWith(siteOrigin));

    const getTransferSize = (entry: { transferSize?: number; encodedBodySize?: number }) =>
      entry.transferSize && entry.transferSize > 0
        ? entry.transferSize
        : (entry.encodedBodySize ?? 0);

    const documentTransferBytes = navigation ? getTransferSize(navigation) : 0;
    const scriptTransferBytes = resourceEntries
      .filter((entry) => entry.initiatorType === "script" || entry.name.includes("/_next/static/chunks/"))
      .reduce((total, entry) => total + getTransferSize(entry), 0);
    const stylesheetTransferBytes = resourceEntries
      .filter((entry) => entry.initiatorType === "link" || entry.name.endsWith(".css"))
      .reduce((total, entry) => total + getTransferSize(entry), 0);
    const totalTransferBytes = documentTransferBytes + resourceEntries.reduce((total, entry) => total + getTransferSize(entry), 0);

    return {
      documentTransferBytes,
      scriptTransferBytes,
      stylesheetTransferBytes,
      totalTransferBytes,
      timeToFirstByteMs: navigation?.responseStart ?? 0,
      domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? 0,
      loadMs: navigation?.loadEventEnd ?? 0,
      sameOriginResourceCount: resourceEntries.length,
    };
  }, origin);
}

for (const route of routeBudgets) {
  test(`${route.name} stays within its performance budget`, async ({ page, baseURL }) => {
    const pageResponse = await page.goto(route.path, { waitUntil: "load" });
    expect(pageResponse?.ok()).toBe(true);

    await expect(page.locator("body")).toBeVisible();

    const origin = new URL(baseURL!).origin;
    const metrics = await collectBrowserMetrics(page, origin);
    const failureMessage = formatMetrics(route, metrics);

    expect(metrics.documentTransferBytes, failureMessage).toBeLessThanOrEqual(route.maxDocumentTransferBytes);
    expect(metrics.scriptTransferBytes, failureMessage).toBeLessThanOrEqual(route.maxScriptTransferBytes);
    expect(metrics.stylesheetTransferBytes, failureMessage).toBeLessThanOrEqual(route.maxStylesheetTransferBytes);
    expect(metrics.totalTransferBytes, failureMessage).toBeLessThanOrEqual(route.maxTotalTransferBytes);
    expect(metrics.timeToFirstByteMs, failureMessage).toBeLessThanOrEqual(route.maxTimeToFirstByteMs);
    expect(metrics.domContentLoadedMs, failureMessage).toBeLessThanOrEqual(route.maxDomContentLoadedMs);
    expect(metrics.loadMs, failureMessage).toBeLessThanOrEqual(route.maxLoadMs);
  });
}
