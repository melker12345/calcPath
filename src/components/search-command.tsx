"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

type SearchEntry = {
  label: string;
  description: string;
  href: string;
  subjectIcon: string;
  kind: "topic" | "section" | "page";
};

async function loadIndex(): Promise<SearchEntry[]> {
  const [
    { calculusTopics, statisticsTopics, linalgTopics },
    { modules: calculusModules },
    { modules: statisticsModules },
    { modules: linalgModules },
  ] = await Promise.all([
    import("@/lib/subject-topics"),
    import("@/lib/modules"),
    import("@/lib/statistics-modules"),
    import("@/lib/linalg-modules"),
  ]);

  const entries: SearchEntry[] = [];

  const subjects = [
    { slug: "calculus", icon: "\u222b", name: "Calculus", topics: calculusTopics, modules: calculusModules },
    { slug: "statistics", icon: "\u03c3", name: "Statistics", topics: statisticsTopics, modules: statisticsModules },
    { slug: "linear-algebra", icon: "\u03bb", name: "Linear Algebra", topics: linalgTopics, modules: linalgModules },
  ];

  for (const s of subjects) {
    entries.push({ label: s.name, description: `${s.topics.length} topics`, href: `/${s.slug}`, subjectIcon: s.icon, kind: "page" });
    entries.push({ label: `${s.name} Progress`, description: "Your progress", href: `/dashboard`, subjectIcon: s.icon, kind: "page" });

    for (const topic of s.topics) {
      entries.push({ label: topic.title, description: `${s.name} module`, href: `/${s.slug}/modules/${topic.id}`, subjectIcon: s.icon, kind: "topic" });

      const mod = s.modules.find((m) => m.topicId === topic.id);
      if (mod) {
        for (const section of mod.sections) {
          const slug = section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          entries.push({
            label: section.title,
            description: `${topic.title} \u2014 ${s.name}`,
            href: `/${s.slug}/modules/${topic.id}#${slug}`,
            subjectIcon: s.icon,
            kind: "section",
          });
        }
      }
    }
  }

  return entries;
}

function matchScore(entry: SearchEntry, query: string): number {
  const q = query.toLowerCase();
  const label = entry.label.toLowerCase();
  const desc = entry.description.toLowerCase();

  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (desc.includes(q)) return 40;

  const words = q.split(/\s+/);
  if (words.every((w) => label.includes(w) || desc.includes(w))) return 30;

  return 0;
}

const SearchContext = createContext<{ open: () => void }>({ open: () => {} });
export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const indexLoaded = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const ensureIndexLoaded = useCallback(() => {
    if (indexLoaded.current) return;
    indexLoaded.current = true;
    loadIndex().then(setIndex);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 8);
    return index
      .map((e) => ({ e, s: matchScore(e, query.trim()) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.e);
  }, [query, index]);

  useEffect(() => setActiveIndex(0), [query]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    ensureIndexLoaded();
  }, [ensureIndexLoaded]);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((p) => {
          const next = !p;
          if (next) ensureIndexLoaded();
          return next;
        });
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close, ensureIndexLoaded]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[activeIndex]) { e.preventDefault(); navigate(results[activeIndex].href); }
  };

  const kindClasses: Record<string, string> = {
    topic: "bg-blue-100 text-blue-700 dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]",
    section: "bg-zinc-100 text-zinc-600 dark:bg-[var(--surface-2)] dark:text-[var(--text-muted)]",
    page: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400",
  };

  const ctxValue = useMemo(() => ({ open }), [open]);

  return (
    <SearchContext.Provider value={ctxValue}>
      {children}
      {mounted && isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[10000]">
            <button type="button" aria-label="Close search" onClick={close} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative mx-auto mt-[15vh] w-[min(560px,90vw)]">
              <div className="overflow-hidden rounded-xl border theme-border theme-surface shadow-2xl">
                <div className="flex items-center gap-3 border-b theme-border px-4 py-3">
                  <svg className="h-5 w-5 shrink-0 theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search topics, sections, pages..."
                    className="flex-1 bg-transparent text-sm theme-text placeholder:text-[var(--text-muted)] outline-none border-none p-0 focus:ring-0"
                  />
                  <kbd className="rounded border theme-border bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-medium theme-text-muted">ESC</kbd>
                </div>
                <div ref={listRef} className="max-h-[50vh] overflow-y-auto overscroll-contain py-2">
                  {results.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm theme-text-muted">No results found</div>
                  )}
                  {results.map((entry, i) => (
                    <button
                      key={entry.href}
                      type="button"
                      onClick={() => navigate(entry.href)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${i === activeIndex ? "bg-[var(--accent)]/10" : "hover:bg-[var(--surface-2)]"}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-sm font-bold theme-text-muted">
                        {entry.subjectIcon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium theme-text">{entry.label}</span>
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${kindClasses[entry.kind]}`}>
                            {entry.kind}
                          </span>
                        </div>
                        <p className="truncate text-xs theme-text-muted">{entry.description}</p>
                      </div>
                      {i === activeIndex && <span className="shrink-0 text-xs theme-text-muted">↵</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </SearchContext.Provider>
  );
}

export function SearchTrigger() {
  const { open } = useSearch();
  return (
    <button
      type="button"
      onClick={open}
      className="flex items-center gap-2 rounded-lg border theme-border bg-[var(--surface)]/80 px-3 py-1.5 text-sm theme-text-muted transition hover:bg-[var(--surface)]"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <span className="hidden sm:inline">Search...</span>
    </button>
  );
}

