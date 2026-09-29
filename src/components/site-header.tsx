"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchTrigger } from "@/components/search-command";
import { ThemeToggle } from "@/components/theme-toggle";
import { useClientMounted } from "@/hooks/use-client-mounted";
import type { NavSubject } from "@/lib/shared-types";

const utilityLinks = [
  { href: "/dashboard", label: "Progress" },
  { href: "/problem-sets", label: "Problem sets" },
  { href: "/feedback", label: "Feedback" },
] as const;

function SubjectsDropdown({
  subjects,
}: {
  subjects: Array<{ slug: string; label: string; icon?: string; category?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeAndNavigate = () => setOpen(false);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1.5 text-sm theme-text-secondary hover:underline"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Subjects
        <svg
          className={`h-3.5 w-3.5 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-80 border theme-border bg-[var(--surface-solid)]"
          role="menu"
        >
          <div className="grid grid-cols-2 gap-0.5 p-1">
            {subjects.map((subject) => (
              <Link
                key={subject.slug}
                href={`/${subject.slug}`}
                onClick={closeAndNavigate}
                className="flex items-center gap-2 px-3 py-2 text-sm theme-text hover:underline"
                role="menuitem"
              >
                <span aria-hidden className="w-5 shrink-0 text-center font-serif theme-text-muted">
                  {subject.icon || "•"}
                </span>
                <span className="truncate">{subject.label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t theme-border" />
          <Link
            href="/subjects"
            onClick={closeAndNavigate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--accent)] hover:underline"
            role="menuitem"
          >
            All subjects →
          </Link>
        </div>
      )}
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  subjects = [],
}: {
  open: boolean;
  onClose: () => void;
  subjects?: Array<{ slug: string; label: string; icon?: string; category?: string }>;
}) {
  const mounted = useClientMounted();

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-[9998] bg-black/30"
      />

      <div
        className="fixed right-0 top-0 z-[9999] flex h-dvh w-[min(300px,85vw)] flex-col border-l theme-border bg-[var(--surface-solid)]"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex shrink-0 items-center justify-between border-b theme-border px-4 py-4">
          <span className="text-lg font-semibold theme-text">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center border theme-border theme-text-secondary"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[1px] theme-text-muted">Subjects</div>
          {subjects.map((subject) => (
            <Link
              key={subject.slug}
              href={`/${subject.slug}`}
              className="flex items-center gap-3 border theme-border px-4 py-3 text-base font-medium theme-text"
              onClick={onClose}
            >
              <span aria-hidden className="w-6 shrink-0 text-center font-serif theme-text-muted">
                {subject.icon || "•"}
              </span>
              {subject.label}
            </Link>
          ))}

          {/* separator between subject links and utility links */}
          <div className="my-2 border-t theme-border" />

          {utilityLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 border theme-border px-4 py-3 text-base font-medium theme-text"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}

        </nav>
      </div>
    </div>,
    document.body,
  );
}

export const SiteHeader = ({ subjects }: { subjects: NavSubject[] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navSubjects = subjects.filter((s) => (s.order ?? 0) < 50);

  return (
    <>
      {/* --nav-bg / --nav-border exist only inside a .subject-theme-* subtree
          (see themes.ts): there the nav carries the subject's identity tint —
          the ONE place subjects differ visually. Everywhere else the fallbacks
          keep the default header. */}
      <header className="sticky top-0 z-50 border-b border-[var(--nav-border,var(--border))] bg-[var(--nav-bg,var(--surface-solid))] pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="CalcPath home">
            <span className="font-serif text-xl font-semibold theme-text">CalcPath</span>
          </Link>

          <nav className="hidden items-center gap-3 text-sm md:flex">
            <SubjectsDropdown subjects={navSubjects} />

            {/* subtle separator between subject group and utility links */}
            <span className="mx-1 h-3 w-px bg-[var(--border)]" aria-hidden="true" />

            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="theme-text-secondary hover:underline"
              >
                {link.label}
              </Link>
            ))}

            <SearchTrigger />
          </nav>

          <SiteHeaderAuthControls
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
            onCloseMobileMenu={() => setMobileMenuOpen(false)}
            subjects={navSubjects}
          />
        </div>
      </header>
    </>
  );
};

function SiteHeaderAuthControls({
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  subjects = [],
}: {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  subjects?: Array<{ slug: string; label: string; icon?: string; category?: string }>;
}) {
  return (
    <>
      <div className="flex items-center gap-1.5 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex h-10 w-10 items-center justify-center border border-[var(--nav-control-border,var(--border))] bg-[var(--nav-control-bg,var(--surface))] theme-text-secondary"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <ThemeToggle />
      </div>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={onCloseMobileMenu}
        subjects={subjects}
      />
    </>
  );
}
