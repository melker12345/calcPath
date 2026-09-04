"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Scratchpad } from "@/components/scratchpad";
import { deriveSuggestionLabels, type QuestionContext } from "@/lib/math-input-helpers";

let stylesInjected = false;

type Subject = "calculus" | "linalg" | "stats" | "generic";

const SUBJECT_THEME: Record<Subject, {
  pillBg: string; pillBorder: string; pillText: string;
  opBg: string; opText: string; parenColor: string;
  opSolidBg: string;
  containerBg: string; containerBorder: string;
  headerBg: string; labelColor: string; dividerColor: string;
  fieldAreaBg: string; fieldInnerBg: string; fieldBorder: string;
  keypadBg: string; numBg: string; numText: string; numShadow: string;
}> = {
  calculus: {
    pillBg: "#f1f5f9", pillBorder: "#cbd5e1", pillText: "#334155",
    opBg: "#f1f5f9", opText: "#0f172a", parenColor: "#334155",
    opSolidBg: "#334155",
    containerBg: "#f8fafc", containerBorder: "#e2e8f0",
    headerBg: "#ffffff", labelColor: "#a1a1aa", dividerColor: "#e4e4e7",
    fieldAreaBg: "#ffffff", fieldInnerBg: "#f8fafc", fieldBorder: "#e4e4e7",
    keypadBg: "#f4f4f5", numBg: "#ffffff", numText: "#18181b", numShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  linalg: {
    pillBg: "#f1f5f9", pillBorder: "#cbd5e1", pillText: "#334155",
    opBg: "#f1f5f9", opText: "#0f172a", parenColor: "#334155",
    opSolidBg: "#334155",
    containerBg: "#f8fafc", containerBorder: "#e2e8f0",
    headerBg: "#ffffff", labelColor: "#a1a1aa", dividerColor: "#e4e4e7",
    fieldAreaBg: "#ffffff", fieldInnerBg: "#f8fafc", fieldBorder: "#e4e4e7",
    keypadBg: "#f4f4f5", numBg: "#ffffff", numText: "#18181b", numShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  stats: {
    pillBg: "#f1f5f9", pillBorder: "#cbd5e1", pillText: "#334155",
    opBg: "#f1f5f9", opText: "#0f172a", parenColor: "#334155",
    opSolidBg: "#334155",
    containerBg: "#f8fafc", containerBorder: "#e2e8f0",
    headerBg: "#ffffff", labelColor: "#a1a1aa", dividerColor: "#e4e4e7",
    fieldAreaBg: "#ffffff", fieldInnerBg: "#f8fafc", fieldBorder: "#e4e4e7",
    keypadBg: "#f4f4f5", numBg: "#ffffff", numText: "#18181b", numShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  generic: {
    // Neutral fallback for the data-driven dynamic routes (primary for main /[subject] + future subjects).
    // Uses CSS vars so it is always design-token aligned, dark-mode friendly,
    // and resolves to correct light values on initial SSR (no theme flash on fast nav).
    pillBg: "var(--surface-2)", pillBorder: "var(--border)", pillText: "var(--text-secondary)",
    opBg: "var(--surface-2)", opText: "var(--text-secondary)", parenColor: "var(--text-muted)",
    opSolidBg: "var(--accent)",
    containerBg: "var(--surface)", containerBorder: "var(--border)",
    headerBg: "var(--surface)", labelColor: "var(--text-muted)", dividerColor: "var(--border)",
    fieldAreaBg: "var(--surface)", fieldInnerBg: "var(--bg)", fieldBorder: "var(--border)",
    keypadBg: "var(--surface)", numBg: "var(--surface-2)", numText: "var(--text-primary)", numShadow: "none",
  },
};

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHint?: () => void;
  hintDisabled?: boolean;
  placeholder?: string;
  subject?: Subject;
  questionContext?: QuestionContext;
  answerHint?: string;
  feedbackOverlay?: React.ReactNode;
  onDismissOverlay?: () => void;
  questionPrompt?: string;
}

type MQField = {
  latex: (next?: string) => string;
  write: (latex: string) => void;
  cmd: (latexCmd: string) => void;
  keystroke: (keys: string) => void;
  focus: () => void;
};

const EditableMathField = dynamic(
  () => import("react-mathquill").then((m) => m.EditableMathField),
  { ssr: false },
);

type SuggestionKey = { label: string; action: () => void };

function deriveKeys(
  answer: string | undefined,
  questionCtx: QuestionContext | undefined,
  write: (l: string) => void,
  cmd: (l: string) => void,
  insertFn: (l: string) => void,
): SuggestionKey[] {
  return deriveSuggestionLabels(answer, questionCtx).map((label) => {
    switch (label) {
      case "x":
      case "y":
      case "t":
      case "n":
      case "a":
      case "z":
      case "p":
      case "s":
      case "r":
      case "u":
      case "v":
      case "w":
      case "k":
      case "m":
      case "h":
      case "d":
      case "f":
      case "g":
      case "l":
      case "q":
      case "c":
      case "b":
      case "C":
      case "A":
      case "B":
      case "P":
      case "N":
      case "T":
      case "e":
      case "=":
      case ",":
      case "[":
      case "]":
      case "<":
      case ">":
        return { label, action: () => write(label) };
      case "λ":
        return { label, action: () => write("\\lambda") };
      case "sin":
        return { label, action: () => insertFn("\\sin\\left(\\right)") };
      case "cos":
        return { label, action: () => insertFn("\\cos\\left(\\right)") };
      case "tan":
        return { label, action: () => insertFn("\\tan\\left(\\right)") };
      case "sinh":
        return { label, action: () => insertFn("\\sinh\\left(\\right)") };
      case "cosh":
        return { label, action: () => insertFn("\\cosh\\left(\\right)") };
      case "tanh":
        return { label, action: () => insertFn("\\tanh\\left(\\right)") };
      case "sec":
        return { label, action: () => insertFn("\\sec\\left(\\right)") };
      case "csc":
        return { label, action: () => insertFn("\\csc\\left(\\right)") };
      case "cot":
        return { label, action: () => insertFn("\\cot\\left(\\right)") };
      case "arcsin":
        return { label, action: () => insertFn("\\arcsin\\left(\\right)") };
      case "arccos":
        return { label, action: () => insertFn("\\arccos\\left(\\right)") };
      case "arctan":
        return { label, action: () => insertFn("\\arctan\\left(\\right)") };
      case "ln":
        return { label, action: () => insertFn("\\ln\\left(\\right)") };
      case "log":
        return { label, action: () => insertFn("\\log\\left(\\right)") };
      case "π":
        return { label, action: () => write("\\pi") };
      case "∞":
        return { label, action: () => write("\\infty") };
      case "√":
        return { label, action: () => cmd("\\sqrt") };
      case "| |":
        return { label, action: () => insertFn("\\left|\\right|") };
      case "_":
        return { label, action: () => cmd("_") };
      case "a/b":
        return { label, action: () => cmd("\\frac") };
      case "xⁿ":
        return { label, action: () => cmd("^") };
      default:
        return { label, action: () => write(label) };
    }
  });
}

/**
 * MathInput — virtual keypad + react-mathquill LaTeX editor for free-response numeric answers.
 *
 * - subject="generic" (used by GenericPracticeExperience in the primary data-driven routes) now has
 *   a hardened neutral var-based theme (light/dark friendly, matches app design tokens).
 * - Style injection for MQ is robust (DOM-checked + tagging) to survive fast navigations and
 *   remounts/HMR (or multi-bundle scenarios).
 * - Suggestions derive improved via better questionContext fallbacks (benefits generic stats/linalg topics).
 * - Full flow (direct typing in MQ field, all keypad buttons, scratchpad, submit, hint, feedback overlay)
 *   works end-to-end for the primary /[subject]/practice routes with subject=generic.
 *
 * Used by legacy per-subject pages (calculus/stats/linalg) and the new generic practice.
 */
export function MathInput({
  value,
  onChange,
  onSubmit,
  onHint,
  hintDisabled,
  placeholder = "Your answer",
  subject = "calculus",
  questionContext,
  answerHint,
  feedbackOverlay,
  onDismissOverlay,
  questionPrompt,
}: MathInputProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lightTh = SUBJECT_THEME[subject] ?? SUBJECT_THEME.calculus;

  // Dark theme colors (GitHub-inspired + our accent system)
  const darkTh = {
    pillBg: "var(--surface-2)",
    pillBorder: "var(--border)",
    pillText: "var(--text-secondary)",
    opBg: "var(--surface-2)",
    opText: "var(--text-secondary)",
    parenColor: "var(--text-muted)",
    opSolidBg: "var(--accent)",
    containerBg: "var(--surface)",
    containerBorder: "var(--border)",
    headerBg: "var(--surface)",
    labelColor: "var(--text-muted)",
    dividerColor: "var(--border)",
    fieldAreaBg: "var(--surface)",
    fieldInnerBg: "var(--bg)",
    fieldBorder: "var(--border)",
    keypadBg: "var(--surface)",
    numBg: "var(--surface-2)",
    numText: "var(--text-primary)",
    numShadow: "none",
  };

  // Only trust the theme after mount to prevent hydration mismatch.
  // On server / first client render we always use light values so the HTML matches.
  const isDark = mounted && (resolvedTheme ?? theme) === "dark";
  const th = isDark ? darkTh : lightTh;

  const mqRef = useRef<MQField | null>(null);
  // Stable ref so the MathQuill enter handler (bound once at mount) always
  // calls the latest onSubmit.
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const scratchpadData = useRef<string | null>(null);
  const prevPrompt = useRef(questionPrompt);

  if (questionPrompt !== prevPrompt.current) {
    prevPrompt.current = questionPrompt;
    scratchpadData.current = null;
  }

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (stylesInjected) return;

    // Robust detection for already-injected MQ styles (handles fast client navs,
    // remounts in data-driven routes, HMR, or multi-bundle scenarios).
    const hasMQStyles =
      !!document.querySelector('style[data-mq]') ||
      Array.from(document.getElementsByTagName("style")).some((s) => {
        try {
          return /mq-editable-field|\\.mq-/.test(s.textContent || "");
        } catch {
          return false;
        }
      });
    if (hasMQStyles) {
      stylesInjected = true;
      return;
    }

    import("react-mathquill").then((mod) => {
      mod.addStyles();
      stylesInjected = true;
      // Tag the (likely last) injected stylesheet for future fast-path detection
      const allStyles = document.getElementsByTagName("style");
      if (allStyles.length > 0) {
        const last = allStyles[allStyles.length - 1];
        if (!last.dataset.mq && /mq-|mathquill/i.test(last.textContent || "")) {
          last.dataset.mq = "injected";
        }
      }
    });
  }, []);

  const write = (latex: string) => {
    if (mqRef.current) {
      mqRef.current.write(latex);
      onChange(mqRef.current.latex());
      mqRef.current.focus();
      return;
    }
    onChange(value + latex);
  };

  const cmd = (latexCmd: string) => {
    if (!mqRef.current) return;
    mqRef.current.cmd(latexCmd);
    onChange(mqRef.current.latex());
    mqRef.current.focus();
  };

  const backspace = () => {
    if (!mqRef.current) {
      onChange(value.slice(0, -1));
      return;
    }
    mqRef.current.keystroke("Backspace");
    onChange(mqRef.current.latex());
    mqRef.current.focus();
  };

  const clear = () => {
    if (mqRef.current) {
      mqRef.current.latex("");
      onChange("");
      mqRef.current.focus();
      return;
    }
    onChange("");
  };

  const insertFunction = (latex: string) => {
    write(latex);
    mqRef.current?.keystroke("Left");
  };

  // Keep the field focused as questions change (covers non-remounting callers;
  // keyed remounts focus via mathquillDidMount).
  useEffect(() => {
    mqRef.current?.focus();
  }, [questionPrompt]);

  const suggestions = useMemo(
    () => deriveKeys(answerHint, questionContext, write, cmd, insertFunction),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answerHint, questionContext],
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl sm:min-h-0" data-subject={subject} style={{ background: th.containerBg }}>
      {/* ── Header: label + draw + hint ── */}
      <div className="flex items-center justify-between px-4 pt-3 sm:px-5 sm:pt-4" style={{ background: th.headerBg }}>
        <p className="text-xs font-semibold sm:text-sm" style={{ color: th.labelColor }}>{placeholder}</p>
        {/* Keep the action buttons mounted (just hidden) while feedback is shown
            so the header height never changes between input and feedback states. */}
        <div className={`flex items-center gap-1.5 ${feedbackOverlay ? "invisible" : ""}`} aria-hidden={feedbackOverlay ? true : undefined}>
          <button
            type="button"
            onClick={() => setScratchpadOpen(true)}
            tabIndex={feedbackOverlay ? -1 : undefined}
            className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition active:scale-95 sm:px-3 sm:py-1 sm:text-sm"
            style={{ borderColor: th.dividerColor, color: th.labelColor }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-3.5 sm:w-3.5">
              <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
            Draw
          </button>
          {onHint && (
            <button
              type="button"
              onClick={onHint}
              disabled={hintDisabled}
              tabIndex={feedbackOverlay ? -1 : undefined}
              className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition active:scale-95 disabled:opacity-30 sm:px-3 sm:py-1 sm:text-sm"
              style={{ borderColor: th.dividerColor, color: th.labelColor }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-3.5 sm:w-3.5"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Hint
            </button>
          )}
        </div>
      </div>
      <Scratchpad
        open={scratchpadOpen}
        onClose={() => setScratchpadOpen(false)}
        questionPrompt={questionPrompt}
        savedImage={scratchpadData.current}
        onSave={(dataUrl) => { scratchpadData.current = dataUrl; }}
      />

      {/* ── Math field — compact borderless bar, accent ring on focus ── */}
      <div className="flex items-center justify-center px-4 py-3 sm:px-5" style={{ background: th.fieldAreaBg }}>
        <div
          className="relative flex min-h-[52px] w-full items-center justify-center rounded-xl px-4 transition-shadow focus-within:ring-2 focus-within:ring-[var(--accent)]/50 sm:min-h-[58px]"
          style={{ background: "var(--surface-2)" }}
          // Enter submits. Caught at the wrapper (the event bubbles up from
          // MathQuill's hidden textarea) instead of via config.handlers.enter:
          // react-mathquill mutates the passed handlers object when wiring its
          // edit wrapper, which double-wraps under StrictMode and crashes.
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmitRef.current();
            }
          }}
        >
          {!value && !feedbackOverlay && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm sm:text-base"
              style={{ color: th.labelColor }}
            >
              <span className="mi-fine-only">Type your answer — press Enter to check</span>
              <span className="mi-touch-only">Enter your answer</span>
            </span>
          )}
          <EditableMathField
            latex={value}
            config={{
              spaceBehavesLikeTab: true,
              substituteTextarea: () => {
                const ta = document.createElement("textarea");
                ta.setAttribute("autocapitalize", "off");
                ta.setAttribute("autocomplete", "off");
                ta.setAttribute("autocorrect", "off");
                ta.setAttribute("spellcheck", "false");
                ta.setAttribute("inputmode", "none");
                return ta;
              },
            }}
            onChange={(field: MQField) => {
              mqRef.current = field;
              onChange(field.latex());
            }}
            mathquillDidMount={(field: MQField) => {
              mqRef.current = field;
              // Each question remounts this component (keyed error boundary),
              // so focusing here means the field is ready to type into the
              // moment a question appears — no click required.
              requestAnimationFrame(() => field.focus());
            }}
            className="w-full text-center text-lg sm:text-xl"
            style={{ color: th.numText }}
          />
        </div>
      </div>

      {/* ── Symbol strip + keypad — the feedback overlay covers them exactly
             when active (their height is preserved underneath). ── */}
      <div className="relative">
        {feedbackOverlay && (
          <div className="absolute inset-0 z-10 overflow-y-auto rounded-b-2xl">
            {onDismissOverlay && (
              <button
                type="button"
                onClick={onDismissOverlay}
                className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-zinc-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-800 dark:bg-[var(--surface-2)]/80 dark:text-[var(--text-muted)] dark:hover:bg-[var(--surface-2)] dark:hover:text-[var(--text-secondary)] sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            )}
            {feedbackOverlay}
          </div>
        )}

        <div className={feedbackOverlay ? "invisible" : ""}>
          {/* ── Suggestions strip: contextual symbols for this question.
                 Dividers are short centered hairlines, not full-width rules. ── */}
          {suggestions.length > 0 && (
            <div aria-hidden className="mx-auto h-px w-1/3" style={{ background: th.dividerColor }} />
          )}
          {suggestions.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto px-3 py-1.5 sm:gap-2 sm:px-4" style={{ background: th.keypadBg }}>
              {suggestions.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  onClick={k.action}
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold transition active:scale-95 sm:px-3 sm:text-sm"
                  style={{ background: th.pillBg, color: th.pillText }}
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Keypad — compact, centered, capped width so it reads as a tool,
                 not a wall. Digits are clickable everywhere; typing + Enter
                 always work too. ── */}
          <div style={{ background: th.keypadBg }}>
            <div aria-hidden className="mx-auto h-px w-1/3" style={{ background: th.dividerColor }} />
            <div className="mx-auto w-full max-w-[430px] px-3 pb-2.5 pt-1.5 sm:px-4 sm:pb-3">
              {/* Tools row: ( )  xⁿ  √  ⌫  AC */}
              <div className="grid grid-cols-5 gap-1 pb-1 sm:gap-1.5 sm:pb-1.5">
                <button type="button" onClick={() => { write("\\left(\\right)"); mqRef.current?.keystroke("Left"); }} className="kp-op text-[13px] sm:text-sm">( )</button>
                <button type="button" onClick={() => cmd("^")} className="kp-op text-[13px] sm:text-sm">x<sup className="text-[9px]">n</sup></button>
                <button type="button" onClick={() => cmd("\\sqrt")} className="kp-op text-[13px] sm:text-sm">√</button>
                <button type="button" onClick={backspace} className="kp-op text-[13px] sm:text-sm">⌫</button>
                <button type="button" onClick={clear} className="kp-op-ac">AC</button>
              </div>

              {/* Numpad (3 cols) + operator column (1 col) */}
              <div className="grid grid-cols-[2fr_2fr_2fr_1fr] grid-rows-5 gap-1 sm:gap-1.5">
                <button type="button" onClick={() => write("7")} className="kp-num">7</button>
                <button type="button" onClick={() => write("8")} className="kp-num">8</button>
                <button type="button" onClick={() => write("9")} className="kp-num">9</button>
                <button type="button" onClick={() => write("+")} className="kp-op-solid">+</button>

                <button type="button" onClick={() => write("4")} className="kp-num">4</button>
                <button type="button" onClick={() => write("5")} className="kp-num">5</button>
                <button type="button" onClick={() => write("6")} className="kp-num">6</button>
                <button type="button" onClick={() => write("-")} className="kp-op-solid">−</button>

                <button type="button" onClick={() => write("1")} className="kp-num">1</button>
                <button type="button" onClick={() => write("2")} className="kp-num">2</button>
                <button type="button" onClick={() => write("3")} className="kp-num">3</button>
                <button type="button" onClick={() => write("\\cdot ")} className="kp-op-solid">×</button>

                <button type="button" onClick={() => write("0")} className="kp-num col-span-2">0</button>
                <button type="button" onClick={() => write(".")} className="kp-num">.</button>
                <button type="button" onClick={() => cmd("\\frac")} className="kp-op-solid">
                  <span className="flex flex-col items-center text-[11px] leading-[1.1] sm:text-xs">
                    <span>a</span><span className="my-[-1px] h-px w-3 bg-current" /><span>b</span>
                  </span>
                </button>

                <button type="button" onClick={onSubmit} className="kp-submit col-span-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Check
                  <span className="mi-fine-only ml-1.5 items-center rounded border px-1 text-[10px] font-semibold opacity-70" style={{ borderColor: "currentColor" }}>↵</span>
                </button>
                <button type="button" onClick={() => write("\\div ")} className="kp-op-solid">÷</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
