/**
 * Diagnostic Content Loader (server-only)
 *
 * Loads and validates content/{slug}/diagnostic.json files.
 * Used for subject-level prerequisite readiness checks.
 */

import "server-only";

import {
  DiagnosticFileSchema,
  type DiagnosticFile,
} from "./schema";
import { loadSubjectIndex } from "./loader";

const CONTENT_DIR = "content";

async function readDiagnosticJson(slug: string): Promise<DiagnosticFile> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const fullPath = path.join(process.cwd(), CONTENT_DIR, slug, "diagnostic.json");
  const raw = await fs.readFile(fullPath, "utf-8");
  const parsed = JSON.parse(raw);
  return DiagnosticFileSchema.parse(parsed);
}

/**
 * Load and validate content/{slug}/diagnostic.json.
 * Throws if the file is missing or fails Zod validation.
 */
export async function loadDiagnosticFile(slug: string): Promise<DiagnosticFile> {
  return readDiagnosticJson(slug);
}

/**
 * Scan content/ for subjects that ship a diagnostic.json.
 * Returns slug + human label from each subject's index.json.
 */
export async function listSubjectsWithDiagnostics(): Promise<Array<{ slug: string; label: string; order: number }>> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const contentRoot = path.join(process.cwd(), CONTENT_DIR);

  const results: Array<{ slug: string; label: string; order: number }> = [];

  let dirents;
  try {
    dirents = await fs.readdir(contentRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const d of dirents) {
    if (!d.isDirectory()) continue;

    const diagnosticPath = path.join(contentRoot, d.name, "diagnostic.json");
    try {
      await fs.access(diagnosticPath);
    } catch {
      continue;
    }

    try {
      const idx = await loadSubjectIndex(d.name);
      results.push({ slug: d.name, label: idx.label, order: idx.order });
    } catch {
      results.push({ slug: d.name, label: d.name, order: 999 });
    }
  }

  results.sort((a, b) => a.order - b.order);
  return results;
}

/**
 * Returns true when content/{slug}/diagnostic.json exists on disk.
 */
export async function hasDiagnosticFile(slug: string): Promise<boolean> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const fullPath = path.join(process.cwd(), CONTENT_DIR, slug, "diagnostic.json");
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}