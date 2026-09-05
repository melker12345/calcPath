"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { MathText } from "@/components/math-text";

type Tool = "pen" | "eraser";

const COLORS = ["#1e293b", "#dc2626", "#2563eb", "#16a34a", "#9333ea"];
// Dark mode gets dark paper, so pens must be bright (default: near-white).
const DARK_COLORS = ["#e2e8f0", "#f87171", "#60a5fa", "#4ade80", "#c084fc"];
const PAPER_LIGHT = "#ffffff";
const PAPER_DARK = "#10151c";
const SIZES = [2, 4, 8];
// Undo snapshots are stored at CSS-pixel resolution (not device pixels) and
// capped, so a long session can't hold hundreds of MB of full-DPR ImageData.
const MAX_UNDO_SNAPSHOTS = 20;

export function Scratchpad({
  open,
  onClose,
  questionPrompt,
  savedImage,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  questionPrompt?: string;
  savedImage?: string | null;
  onSave?: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const mounted = useClientMounted();
  const isDark = mounted && (resolvedTheme ?? theme) === "dark";

  const [tool, setTool] = useState<Tool>("pen");
  const [colorOverride, setColorOverride] = useState<string | null>(null);
  const [size, setSize] = useState(SIZES[1]);

  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const paths = useRef<HTMLCanvasElement[]>([]);
  const hasRestored = useRef(false);
  // Tracks whether the pad actually holds a drawing. The pixel-scan alternative
  // fails because resizeCanvas paints opaque paper, so alpha is never 0.
  const hasDrawn = useRef(false);

  const palette = isDark ? DARK_COLORS : COLORS;
  const paper = isDark ? PAPER_DARK : PAPER_LIGHT;
  const color = colorOverride ?? palette[0];

  const getCtx = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const existing = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Paper follows the site theme: white in light mode, near-black in dark
    // (a bright canvas in a dark room is blinding, and the default bright pen
    // would be invisible on white).
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.putImageData(existing, 0, 0);
  }, [paper]);

  // Restore saved drawing when opening
  useEffect(() => {
    if (!open || hasRestored.current) return;
    hasRestored.current = true;

    if (!savedImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timer = setTimeout(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Paint fresh theme-colored paper *before* restoring the old drawing.
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (!savedImage) return;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        hasDrawn.current = true;
      };
      img.src = savedImage;
    }, 60);

    return () => clearTimeout(timer);
  }, [open, savedImage, paper]);

  // Reset restoration flag when closed so next open can restore again
  useEffect(() => {
    if (!open) {
      hasRestored.current = false;
      hasDrawn.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(resizeCanvas, 50);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [open, resizeCanvas]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Modal focus management: move focus into the dialog on open, restore it on close.
  useEffect(() => {
    if (!open || !mounted) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => containerRef.current?.focus(), 0);
    return () => {
      clearTimeout(timer);
      previouslyFocused?.focus?.();
    };
  }, [open, mounted]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    // Downsample to CSS pixels: at DPR 2 this is a 4x smaller copy per snapshot,
    // and drawImage keeps the copy on the GPU instead of a huge ImageData buffer.
    const snap = document.createElement("canvas");
    snap.width = Math.max(1, Math.round(canvas.width / dpr));
    snap.height = Math.max(1, Math.round(canvas.height / dpr));
    const snapCtx = snap.getContext("2d");
    if (!snapCtx) return;
    snapCtx.drawImage(canvas, 0, 0, snap.width, snap.height);
    paths.current.push(snap);
    if (paths.current.length > MAX_UNDO_SNAPSHOTS) paths.current.shift();
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    saveSnapshot();
    if (tool === "pen") hasDrawn.current = true;
    drawing.current = true;
    const pos = getPos(e);
    lastPoint.current = pos;

    const ctx = getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (tool === "eraser" ? size * 3 : size) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? paper : color;
    ctx.fill();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const pos = getPos(e);
    const prev = lastPoint.current ?? pos;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? paper : color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";

    lastPoint.current = pos;
  };

  const endDraw = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const undo = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (paths.current.length > 0) {
      const prev = paths.current.pop()!;
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      // ctx is scaled by dpr (see resizeCanvas), so painting the CSS-sized
      // snapshot over the CSS rect covers the whole backing store.
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.drawImage(prev, 0, 0, cssW, cssH);
    }
  };

  const clearAll = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    saveSnapshot();
    hasDrawn.current = false;
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleClose = () => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      onSave(hasDrawn.current ? canvas.toDataURL("image/png") : null);
    }
    paths.current = [];
    setColorOverride(null);
    onClose();
  };

  // Focus trap + Escape-to-close for the full-screen dialog.
  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
      return;
    }
    if (e.key !== "Tab") return;
    const root = containerRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || active === root) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || active === root) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Scratchpad"
      tabIndex={-1}
      onKeyDown={handleDialogKeyDown}
      className="fixed inset-0 z-[10001] flex flex-col bg-black/40 outline-none backdrop-blur-md"
    >
      {/* Toolbar */}
      <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 dark:bg-[var(--surface)] dark:border-[var(--border)] px-3 py-2 sm:px-4 sm:py-2.5">
        {/* Top row: close button always visible */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Pen / Eraser toggle */}
            <div className="flex rounded-lg border border-zinc-200 bg-white dark:bg-[var(--surface-2)] dark:border-[var(--border)] p-0.5">
              <button
                type="button"
                onClick={() => setTool("pen")}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                  tool === "pen"
                    ? "bg-zinc-900 text-white dark:bg-[var(--accent)] dark:text-[var(--bg)]"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface)]"
                }`}
              >
                <svg className="inline h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setTool("eraser")}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                  tool === "eraser"
                    ? "bg-zinc-900 text-white dark:bg-[var(--accent)] dark:text-[var(--bg)]"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface)]"
                }`}
              >
                Eraser
              </button>
            </div>

            {/* Undo / Clear */}
            <div className="hidden h-5 w-px bg-zinc-200 dark:bg-[var(--border)] sm:block" />
            <button
              type="button"
              onClick={undo}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 sm:px-2.5 sm:text-sm dark:text-[var(--text-secondary)] dark:hover:bg-[var(--surface)]"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:px-2.5 sm:text-sm dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Clear
            </button>
          </div>

          {/* Close button — always reachable */}
          <button
            type="button"
            onClick={handleClose}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:px-4 sm:py-2 sm:text-sm dark:bg-[var(--accent)] dark:text-[var(--bg)] dark:hover:bg-[color-mix(in_srgb,var(--accent)_85%,white)]"
          >
            Done
          </button>
        </div>

        {/* Second row: colors + size */}
        <div className="mt-2 flex items-center gap-2 sm:gap-3">
          {/* Colors (only when pen selected) */}
          {tool === "pen" && (
            <div className="flex items-center gap-1.5">
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorOverride(c)}
                  className={`h-6 w-6 rounded-full border-2 transition sm:h-7 sm:w-7 ${
                    color === c
                      ? "border-zinc-900 dark:border-white scale-110"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          )}

          <div className="h-5 w-px bg-zinc-200 dark:bg-[var(--border)]" />

          {/* Stroke size — generous ≥36px hit areas (the small dot is only the
              visual); the selected state carries the affordance. */}
          <div className="flex items-center gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
                  size === s ? "bg-zinc-200 dark:bg-[var(--surface-2)]" : "hover:bg-zinc-100 dark:hover:bg-[var(--surface)]"
                }`}
                aria-label={`Size ${s}`}
                aria-pressed={size === s}
              >
                <div
                  className="rounded-full bg-zinc-700 dark:bg-[var(--text-primary)]"
                  style={{ width: s + 2, height: s + 2 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question prompt */}
      {questionPrompt && (
        <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 sm:px-6 sm:py-3 dark:bg-[var(--surface-2)] dark:border-[var(--border)]">
          <p className="text-center text-sm font-medium text-zinc-800 sm:text-base dark:text-[var(--text-primary)]">
            <MathText text={questionPrompt} />
          </p>
        </div>
      )}

      {/* Canvas — paper color follows the theme (white / near-black) */}
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair touch-none"
        style={{ background: paper }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        onTouchCancel={endDraw}
      />
    </div>,
    document.body
  );
}
