"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { MathText } from "@/components/math-text";

type Tool = "pen" | "eraser";

const COLORS = ["#1e293b", "#dc2626", "#2563eb", "#16a34a", "#9333ea"];
const SIZES = [2, 4, 8];

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
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [mounted, setMounted] = useState(false);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const paths = useRef<ImageData[]>([]);
  const hasRestored = useRef(false);

  useEffect(() => setMounted(true), []);

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
    ctx.putImageData(existing, 0, 0);
  }, []);

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

      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = savedImage;
    }, 60);

    return () => clearTimeout(timer);
  }, [open, savedImage]);

  // Reset restoration flag when closed so next open can restore again
  useEffect(() => {
    if (!open) {
      hasRestored.current = false;
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
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    paths.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (paths.current.length > 50) paths.current.shift();
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    saveSnapshot();
    drawing.current = true;
    const pos = getPos(e);
    lastPoint.current = pos;

    const ctx = getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (tool === "eraser" ? size * 3 : size) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
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
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
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
      ctx.putImageData(prev, 0, 0);
    }
  };

  const clearAll = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    saveSnapshot();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClose = () => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const isEmpty = pixels.data.every((v, i) => i % 4 === 3 ? v === 0 : true);
        onSave(isEmpty ? null : canvas.toDataURL("image/png"));
      } else {
        onSave(null);
      }
    }
    paths.current = [];
    onClose();
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex flex-col bg-white/30 backdrop-blur-md">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 px-3 py-2 sm:px-4 sm:py-2.5">
        {/* Top row: close button always visible */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Pen / Eraser toggle */}
            <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setTool("pen")}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                  tool === "pen"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
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
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Eraser
              </button>
            </div>

            {/* Undo / Clear */}
            <div className="hidden h-5 w-px bg-zinc-200 sm:block" />
            <button
              type="button"
              onClick={undo}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 sm:px-2.5 sm:text-sm"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:px-2.5 sm:text-sm"
            >
              Clear
            </button>
          </div>

          {/* Close button — always reachable */}
          <button
            type="button"
            onClick={handleClose}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:px-4 sm:py-2 sm:text-sm"
          >
            Done
          </button>
        </div>

        {/* Second row: colors + size */}
        <div className="mt-2 flex items-center gap-2 sm:gap-3">
          {/* Colors (only when pen selected) */}
          {tool === "pen" && (
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition sm:h-7 sm:w-7 ${
                    color === c ? "border-zinc-900 scale-110" : "border-zinc-200 hover:border-zinc-400"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          )}

          <div className="h-5 w-px bg-zinc-200" />

          {/* Stroke size */}
          <div className="flex items-center gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`flex h-7 w-7 items-center justify-center rounded-md transition sm:h-8 sm:w-8 ${
                  size === s ? "bg-zinc-200" : "hover:bg-zinc-100"
                }`}
                aria-label={`Size ${s}`}
              >
                <div
                  className="rounded-full bg-zinc-700"
                  style={{ width: s + 2, height: s + 2 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question prompt */}
      {questionPrompt && (
        <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 sm:px-6 sm:py-3">
          <p className="text-center text-sm font-medium text-zinc-800 sm:text-base">
            <MathText text={questionPrompt} />
          </p>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair touch-none"
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
