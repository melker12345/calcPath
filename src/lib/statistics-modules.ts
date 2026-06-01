/**
 * @deprecated Legacy compatibility shim (now inert stub).
 *
 * Historical reference only:
 *   backup-content/legacy/statistics/statistics-modules.ts
 *   (and its internal ./modules/ + shared-types relatives — intentionally left
 *    non-resolvable so the archive never participates in builds)
 *
 * This shim:
 * - Exports the exact public surface expected by remaining call sites
 *   (modules pages, layouts, search-command, providers, tests, etc.)
 * - Contains ZERO references to backup-content/ (prevents all resolution errors
 *   and bundler pollution from the legacy tree)
 * - Provides empty data + no-op helpers (legacy subject UIs will show no
 *   content until importers are updated to adapters + new content/)
 *
 * The backup dir is 100% safe for git history / manual inspection / parity
 * but is never loaded by TS, Next.js, or any bundler.
 *
 * Use new path: @/lib/content/adapters (getLegacyModulesAndTopicsForSubject)
 * or @/lib/content/loader + generic components.
 */
import type { ModuleContent, ModuleSection, WorkedExample } from "@/lib/modules/types";

export type { ModuleContent, ModuleSection, WorkedExample };

export const modules: ModuleContent[] = [];
