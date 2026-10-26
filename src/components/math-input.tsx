"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { SYMBOL_KEYS, deriveSuggestionLabels, type QuestionContext, GREEK_KEYS } from "@/lib/math-input-helpers";

let stylesInjected = false;

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHint?: () => void;
  hintDisabled?: boolean;
  placeholder?: string;
  /** Replaces the default "Your answer / Hint" header row (e.g. the graded
      "Not quite" state), so the panel keeps its size between states. */
  header?: React.ReactNode;
  questionContext?: QuestionContext;
  answerHint?: string;
  /** Changing prompt → the field is re-focused. */
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
      case "≤":
        return { label, action: () => write("\\le") };
      case "≥":
        return { label, action: () => write("\\ge") };
      case "λ":
        return { label, action: () => write("\\lambda") };
      case "θ":
        return { label, action: () => write("\\theta") };
      case "{ }":
        return { label, action: () => insertFn("\\{\\}") };
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
      default: {
        const greek = GREEK_KEYS.find((k) => k.label === label);
        if (greek) return { label, action: () => write(greek.latex) };
        const symbol = SYMBOL_KEYS.find((k) => k.label === label);
        if (symbol) return { label, action: () => write(symbol.latex) };
        return { label, action: () => write(label) };
      }
    }
  });
}

/**
 * MathInput — a MathQuill field with a small keypad, for typed answers.
 *
 * Enter submits. Contextual symbol keys (variables, functions, constants) are
 * derived from the question and the expected answer. Styled with the site
 * tokens only, so light and dark both work and no per-subject palette exists.
 */
export function MathInput({
  value,
  onChange,
  onSubmit,
  onHint,
  hintDisabled,
  placeholder = "Your answer",
  header,
  questionContext,
  answerHint,
  questionPrompt,
}: MathInputProps) {
  const mqRef = useRef<MQField | null>(null);
  // Stable ref so the MathQuill enter handler (bound once at mount) always
  // calls the latest onSubmit.
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

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

  const moveCursor = (direction: "Left" | "Right") => {
    if (!mqRef.current) return;
    mqRef.current.keystroke(direction);
    mqRef.current.focus();
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

  const key = "flex items-center justify-center border theme-border bg-[var(--surface)] text-[15px] theme-text";

  return (
    <div className="flex flex-col border theme-border bg-[var(--surface)]">
      {/* Header: label + hint, or the graded state handed in by the caller */}
      {header ?? (
        <div className="flex min-h-[41px] items-center justify-between border-b theme-border px-3 py-2">
          <p className="text-sm theme-text-muted">{placeholder}</p>
          {onHint && (
            <button
              type="button"
              onClick={onHint}
              disabled={hintDisabled}
              className="border theme-border bg-[var(--surface)] px-2.5 py-1 text-xs font-medium theme-text disabled:opacity-40"
            >
              Hint
            </button>
          )}
        </div>
      )}

      {/* Math field. Enter submits: caught at the wrapper (the event bubbles up
          from MathQuill's hidden textarea) instead of via config.handlers.enter,
          because react-mathquill mutates the handlers object when wiring its
          edit wrapper, which double-wraps under StrictMode and crashes. */}
      <div
        className="relative flex min-h-[72px] items-center justify-center border-b theme-border bg-[var(--bg)] px-4 py-3 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--accent)]"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmitRef.current();
          }
        }}
      >
        {!value && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm theme-text-muted sm:text-base"
          >
            <span className="mi-fine-only">Type your answer, then press Enter to check</span>
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
            // Each question remounts this component (keyed error boundary), so
            // focusing here means the field is ready the moment a question
            // appears.
            requestAnimationFrame(() => field.focus());
          }}
          className="w-full text-center text-lg theme-text sm:text-xl"
        />
      </div>

      {/* Contextual symbols for this question */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-b theme-border px-3 py-2">
          {suggestions.map((k) => (
            <button key={k.label} type="button" onClick={k.action} className={`${key} min-h-[32px] px-2.5 text-sm`}>
              {k.label}
            </button>
          ))}
        </div>
      )}

      {/* Keypad: digits, operators, and the one accent-coloured action, Check.
          Digits are clickable everywhere; typing + Enter always works too. */}
      <div className="mx-auto w-full max-w-[430px] px-3 py-3">
        <div className="grid grid-cols-7 gap-1 pb-1">
          <button type="button" aria-label="parentheses" onClick={() => { write("\\left(\\right)"); mqRef.current?.keystroke("Left"); }} className={`${key} min-h-[36px]`}>( )</button>
          <button type="button" aria-label="exponent" onClick={() => cmd("^")} className={`${key} min-h-[36px]`}><span aria-hidden>x<sup className="text-[9px]">n</sup></span></button>
          <button type="button" aria-label="square root" onClick={() => cmd("\\sqrt")} className={`${key} min-h-[36px]`}>√</button>
          {/* Cursor keys: on a phone there is no other way to step out of an
              exponent, a fraction or a root once it has been typed. */}
          <button type="button" aria-label="move cursor left" onClick={() => moveCursor("Left")} className={`${key} min-h-[36px]`}>←</button>
          <button type="button" aria-label="move cursor right" onClick={() => moveCursor("Right")} className={`${key} min-h-[36px]`}>→</button>
          <button type="button" aria-label="backspace" onClick={backspace} className={`${key} min-h-[36px]`}>⌫</button>
          <button type="button" aria-label="clear all" onClick={clear} className={`${key} min-h-[36px] text-[13px] theme-text-muted`}>AC</button>
        </div>

        <div className="grid grid-cols-[2fr_2fr_2fr_1fr] grid-rows-5 gap-1">
          <button type="button" onClick={() => write("7")} className={`${key} min-h-[42px]`}>7</button>
          <button type="button" onClick={() => write("8")} className={`${key} min-h-[42px]`}>8</button>
          <button type="button" onClick={() => write("9")} className={`${key} min-h-[42px]`}>9</button>
          <button type="button" aria-label="plus" onClick={() => write("+")} className={`${key} min-h-[42px]`}>+</button>

          <button type="button" onClick={() => write("4")} className={`${key} min-h-[42px]`}>4</button>
          <button type="button" onClick={() => write("5")} className={`${key} min-h-[42px]`}>5</button>
          <button type="button" onClick={() => write("6")} className={`${key} min-h-[42px]`}>6</button>
          <button type="button" aria-label="minus" onClick={() => write("-")} className={`${key} min-h-[42px]`}>−</button>

          <button type="button" onClick={() => write("1")} className={`${key} min-h-[42px]`}>1</button>
          <button type="button" onClick={() => write("2")} className={`${key} min-h-[42px]`}>2</button>
          <button type="button" onClick={() => write("3")} className={`${key} min-h-[42px]`}>3</button>
          <button type="button" aria-label="multiply" onClick={() => write("\\cdot ")} className={`${key} min-h-[42px]`}>×</button>

          <button type="button" onClick={() => write("0")} className={`${key} col-span-2 min-h-[42px]`}>0</button>
          <button type="button" aria-label="decimal point" onClick={() => write(".")} className={`${key} min-h-[42px]`}>.</button>
          <button type="button" aria-label="fraction" onClick={() => cmd("\\frac")} className={`${key} min-h-[42px]`}>
            <span aria-hidden className="flex flex-col items-center text-[11px] leading-[1.1]">
              <span>a</span><span className="my-[-1px] h-px w-3 bg-current" /><span>b</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="col-span-3 flex min-h-[42px] items-center justify-center border border-[var(--accent)] bg-[var(--accent)] text-sm font-semibold text-[var(--accent-text)]"
          >
            Check
            <span aria-hidden className="mi-fine-only ml-2 text-xs opacity-80">(Enter)</span>
          </button>
          <button type="button" aria-label="divide" onClick={() => write("\\div ")} className={`${key} min-h-[42px]`}>÷</button>
        </div>
      </div>
    </div>
  );
}
