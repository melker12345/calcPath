# Content Scalability Audit

**Branch:** `refactor/content-scalability`  
**Date:** 2026-05-31  
**Goal:** Make it feasible to add many more topics and entirely new subjects with minimal friction and duplication.

---

## 1. Current State Summary

We have made two positive steps on this branch:

- `SubjectSlug` changed from closed union → `string`
- Central registry in `src/lib/subjects.ts` improved (`order`, required `hasTests`, dynamic `subjectList`, helpers)
- Site navigation (`site-header.tsx`) now derives subject links from the registry

However, the majority of the codebase is still tightly coupled to the three current subjects.

---

## 2. Hardcoded Subject Structure (Biggest Problem)

### 2.1 Duplicate Route Trees

We have three nearly identical folder structures under `src/app/`:

- `app/calculus/`
- `app/linear-algebra/`
- `app/statistics/`

Each contains:
- `page.tsx`
- `layout.tsx`
- `modules/`, `practice/`, `test/` subtrees with `[topicId]` dynamic routes
- Heavy subject-specific imports

**Impact:** Adding a 4th subject requires copying ~15–20 files and making many small edits.

### 2.2 Per-Subject Content Aggregators

Each subject has its own aggregator file that manually imports every question file:

- `src/lib/calculus-content.ts`
- `src/lib/linalg-content.ts`
- `src/lib/statistics-content.ts`

Same pattern exists for modules:
- `src/lib/modules.ts` (2390 lines — all calculus in one file)
- `src/lib/linalg-modules.ts`
- `src/lib/statistics-modules.ts`

**Impact:** Adding a new topic requires edits in multiple places.

---

## 3. Hardcoded References Inventory

### 3.1 Navigation & UI (Partially Fixed)

| File | Status | Notes |
|------|--------|-------|
| `src/components/site-header.tsx` | ✅ Fixed on this branch | Now uses `subjectList` |
| `src/components/search-command.tsx` | Hardcoded | Has explicit array of 3 subjects |
| `src/components/landing-content.tsx` | Hardcoded | Mentions the three subjects by name |
| `src/components/site-footer.tsx` | Some hardcoding | Links and text |

### 3.2 Core Registry Consumers (Still Mixed)

- `src/app/(main)/dashboard/DashboardContent.tsx` — imports `subjectList` (good)
- `src/lib/feedback-metadata.ts` — now imports `SubjectSlug` (improved)
- Many per-subject page files still do `subjects.calculus`, `subjects.statistics`, etc.

### 3.3 Sitemap & SEO

- `src/app/sitemap.ts` — Only generates routes for Calculus
- `src/app/robots.ts`, root `layout.tsx`, and individual subject `page.tsx` files contain hardcoded SEO/JSON-LD data

### 3.4 Subject-Specific Page Logic

Large amounts of duplicated logic in:
- `app/*/modules/[topicId]/page.tsx`
- `app/*/practice/[topicId]/page.tsx`
- `app/*/test/[topicId]/page.tsx` (only calculus has tests currently)

These files contain:
- Subject-specific imports (`@/lib/calculus-content`, etc.)
- Hardcoded FAQ data per topic
- Hardcoded "Back to X" links

### 3.5 Tests & Diagnostics

- `src/lib/diagnostics.ts` and `diagnostic-content.ts`
- `src/lib/section-coverage.test.ts`
- Various `.test.ts` files reference specific subjects

### 3.6 Other Notable Files

- `src/lib/content.ts`
- `src/app/layout.tsx` (root)
- `src/app/(main)/layout.tsx`

---

## 4. Risk Areas for Future Expansion

| Area | Risk Level | Why |
|------|------------|-----|
| Route folder duplication | **High** | Adding new subject = lots of copy-paste |
| Giant `modules.ts` | **High** | 2400+ lines, very hard to maintain |
| Manual question imports | Medium | Painful when adding many topics |
| Per-subject `[topicId]` pages | High | Duplicated component logic + FAQ data |
| Sitemap & SEO | Medium | Easy to forget new subjects |
| Progress / feedback systems | Low-Medium | Mostly generic, but some assumptions exist |

---

## 5. Recommended Next Priorities (on this branch)

1. **Create `docs/` structure** for subject content (already started)
2. Split the giant `modules.ts` into per-topic files (Phase 2)
3. Build a generic subject page template or route group to reduce duplication in `app/`
4. Update remaining hardcoded lists (`search-command.tsx`, landing page, etc.)
5. Make `sitemap.ts` and SEO data derive from the registry
6. Consider a `content/` or `subjects/` folder structure for future subjects

---

## 6. Files That Must Eventually Change

(Non-exhaustive — generated from current grep)

**High priority for data-driven approach:**
- `src/components/search-command.tsx`
- `src/components/landing-content.tsx`
- `src/app/sitemap.ts`
- `src/app/layout.tsx` (root)
- All files under `app/calculus/`, `app/linear-algebra/`, `app/statistics/`
- The three `*-content.ts` and `*-modules.ts` files

---

**Next Action Suggestion:**  
Continue systematically removing hardcoded subject lists and wiring, starting with `search-command.tsx` and `sitemap.ts`, while we decide on the long-term strategy for the route duplication problem.

---

*This document should be updated as work on the `refactor/content-scalability` branch progresses.*