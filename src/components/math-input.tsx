"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Scratchpad } from "@/components/scratchpad";

let stylesInjected = false;

type Subject = "calculus" | "linalg" | "stats";

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
    pillBg: "#ede9fe", pillBorder: "#c4b5fd", pillText: "#7c3aed",
    opBg: "#ede9fe", opText: "#18181b", parenColor: "#7c3aed",
    opSolidBg: "#6366f1",
    containerBg: "#f4f4f5", containerBorder: "#e4e4e7",
    headerBg: "#ffffff", labelColor: "#a1a1aa", dividerColor: "#e4e4e7",
    fieldAreaBg: "#ffffff", fieldInnerBg: "#f8fafc", fieldBorder: "#e4e4e7",
    keypadBg: "#f4f4f5", numBg: "#ffffff", numText: "#18181b", numShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  linalg: {
    pillBg: "rgba(51,114,162,0.14)", pillBorder: "rgba(51,114,162,0.35)", pillText: "#5b9bd5",
    opBg: "rgba(51,114,162,0.22)", opText: "#e2e8f0", parenColor: "#5b9bd5",
    opSolidBg: "#3372A2",
    containerBg: "#0d1b2a", containerBorder: "rgba(51,114,162,0.32)",
    headerBg: "#0d1b2a", labelColor: "rgba(226,232,240,0.45)", dividerColor: "rgba(51,114,162,0.22)",
    fieldAreaBg: "#0d1b2a", fieldInnerBg: "rgba(255,255,255,0.06)", fieldBorder: "rgba(51,114,162,0.28)",
    keypadBg: "#0a1520", numBg: "rgba(255,255,255,0.07)", numText: "#e2e8f0", numShadow: "none",
  },
  stats: {
    pillBg: "rgba(253,230,138,0.16)", pillBorder: "rgba(253,230,138,0.4)", pillText: "#d97706",
    opBg: "rgba(253,230,138,0.18)", opText: "#e8e4d9", parenColor: "#d97706",
    opSolidBg: "#d97706",
    containerBg: "#161e14", containerBorder: "rgba(253,230,138,0.22)",
    headerBg: "#161e14", labelColor: "rgba(232,228,217,0.45)", dividerColor: "rgba(253,230,138,0.15)",
    fieldAreaBg: "#161e14", fieldInnerBg: "rgba(255,255,255,0.06)", fieldBorder: "rgba(253,230,138,0.2)",
    keypadBg: "#111810", numBg: "rgba(255,255,255,0.07)", numText: "#e8e4d9", numShadow: "none",
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
  questionContext?: {
    hasVariable?: string[];
    hasTrig?: boolean;
    hasExp?: boolean;
    hasLn?: boolean;
    hasPi?: boolean;
  };
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
  questionCtx: MathInputProps["questionContext"],
  write: (l: string) => void,
  cmd: (l: string) => void,
  insertFn: (l: string) => void,
): SuggestionKey[] {
  const keys: SuggestionKey[] = [];
  const added = new Set<string>();
  const add = (label: string, action: () => void) => {
    if (added.has(label)) return;
    added.add(label);
    keys.push({ label, action });
  };

  const src = (answer ?? "") + " " + (questionCtx?.hasVariable?.join(" ") ?? "");

  if (/\bx\b/.test(src)) add("x", () => write("x"));
  if (/\by\b/.test(src)) add("y", () => write("y"));
  if (/\bt\b/.test(src)) add("t", () => write("t"));
  if (/\bn\b/.test(src)) add("n", () => write("n"));
  if (/\ba\b/.test(src)) add("a", () => write("a"));
  if (/\bC\b/.test(src)) add("C", () => write("C"));

  if (/sin/i.test(src)) add("sin", () => insertFn("\\sin\\left(\\right)"));
  if (/cos/i.test(src)) add("cos", () => insertFn("\\cos\\left(\\right)"));
  if (/tan/i.test(src)) add("tan", () => insertFn("\\tan\\left(\\right)"));
  if (/sec/i.test(src)) add("sec", () => insertFn("\\sec\\left(\\right)"));
  if (/csc/i.test(src)) add("csc", () => insertFn("\\csc\\left(\\right)"));
  if (/cot/i.test(src)) add("cot", () => insertFn("\\cot\\left(\\right)"));
  if (/arcsin/i.test(src)) add("arcsin", () => insertFn("\\arcsin\\left(\\right)"));
  if (/arccos/i.test(src)) add("arccos", () => insertFn("\\arccos\\left(\\right)"));
  if (/arctan/i.test(src)) add("arctan", () => insertFn("\\arctan\\left(\\right)"));

  if (/\be\b|e\^/.test(src)) add("e", () => write("e"));
  if (/\bln\b/i.test(src)) add("ln", () => insertFn("\\ln\\left(\\right)"));
  if (/\blog\b/i.test(src)) add("log", () => insertFn("\\log\\left(\\right)"));
  if (/pi|π/i.test(src) || questionCtx?.hasPi) add("π", () => write("\\pi"));
  if (/inf/i.test(src)) add("∞", () => write("\\infty"));
  if (/sqrt/i.test(src)) add("√", () => cmd("\\sqrt"));
  if (/\//.test(answer ?? "")) add("a/b", () => cmd("\\frac"));
  if (/\^/.test(answer ?? "")) add("xⁿ", () => cmd("^"));

  return keys;
}

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
  const th = SUBJECT_THEME[subject];
  const mqRef = useRef<MQField | null>(null);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const scratchpadData = useRef<string | null>(null);
  const prevPrompt = useRef(questionPrompt);

  if (questionPrompt !== prevPrompt.current) {
    prevPrompt.current = questionPrompt;
    scratchpadData.current = null;
  }

  useEffect(() => {
    if (stylesInjected) return;
    import("react-mathquill").then((mod) => {
      mod.addStyles();
      stylesInjected = true;
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

  const suggestions = useMemo(
    () => deriveKeys(answerHint, questionContext, write, cmd, insertFunction),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answerHint, questionContext],
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border sm:min-h-0" data-subject={subject} style={{ background: th.containerBg, borderColor: th.containerBorder }}>
      {/* ── Header: label + draw + hint ── */}
      <div className="flex items-center justify-between px-4 pt-3 sm:px-5 sm:pt-4" style={{ background: th.headerBg }}>
        <p className="text-xs font-semibold sm:text-sm" style={{ color: th.labelColor }}>{placeholder}</p>
        <div className="flex items-center gap-1.5">
          {!feedbackOverlay && (
            <button
              type="button"
              onClick={() => setScratchpadOpen(true)}
              className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition active:scale-95 sm:px-3 sm:py-1 sm:text-sm"
              style={{ borderColor: th.dividerColor, color: th.labelColor }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-3.5 sm:w-3.5">
                <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
              </svg>
              Draw
            </button>
          )}
          {onHint && !feedbackOverlay && (
            <button
              type="button"
              onClick={onHint}
              disabled={hintDisabled}
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

      {/* ── Math field ── */}
      <div className="flex items-center justify-center px-4 py-3 sm:px-5 sm:py-4 md:px-8 md:py-6" style={{ background: th.fieldAreaBg }}>
        <div className="flex min-h-[56px] w-full items-center justify-center rounded-xl border px-4 sm:min-h-[80px] md:min-h-[100px] md:px-8 md:rounded-2xl" style={{ background: th.fieldInnerBg, borderColor: th.fieldBorder }}>
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
            }}
            className="w-full text-center text-lg sm:text-xl md:text-2xl"
            style={{ color: th.numText }}
          />
        </div>
      </div>

      {/* ── Keypad area — overlay replaces it when feedback is active ── */}
      <div className="relative">
        {feedbackOverlay && (
          <div className="absolute inset-0 z-10 overflow-y-auto rounded-b-2xl">
            {onDismissOverlay && (
              <button
                type="button"
                onClick={onDismissOverlay}
                className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-zinc-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-800 sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            )}
            {feedbackOverlay}
          </div>
        )}

        <div className={feedbackOverlay ? "invisible" : ""}>
          {/* ── Suggestions strip ── */}
          {suggestions.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto border-t px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2 md:justify-center md:gap-3 md:px-6 md:py-3" style={{ background: th.keypadBg, borderColor: th.dividerColor }}>
              {suggestions.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  onClick={k.action}
                  className="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold transition active:scale-95 sm:px-3 sm:py-1 sm:text-sm md:px-4 md:py-1.5"
                  style={{ background: th.pillBg, borderColor: th.pillBorder, color: th.pillText }}
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Tools row: ( )  xⁿ  √  ⌫  AC ── */}
          <div className="grid grid-cols-5 gap-[3px] border-t px-2 py-1.5 sm:gap-1.5 sm:px-3 sm:py-2 md:gap-2.5 md:px-6 md:py-2.5" style={{ background: th.keypadBg, borderColor: th.dividerColor }}>
            <button type="button" onClick={() => { write("\\left(\\right)"); mqRef.current?.keystroke("Left"); }} className="kp-op text-[13px] sm:text-sm" style={{ background: th.opBg, color: th.parenColor, borderColor: th.pillBorder }}>( )</button>
            <button type="button" onClick={() => cmd("^")} className="kp-op text-[13px] sm:text-sm" style={{ background: th.opBg, color: th.opText, borderColor: th.dividerColor }}>x<sup className="text-[9px]">n</sup></button>
            <button type="button" onClick={() => cmd("\\sqrt")} className="kp-op text-[13px] sm:text-sm" style={{ background: th.opBg, color: th.opText, borderColor: th.dividerColor }}>√</button>
            <button type="button" onClick={backspace} className="kp-op text-[13px] sm:text-sm" style={{ background: th.opBg, color: th.opText, borderColor: th.dividerColor }}>⌫</button>
            <button type="button" onClick={clear} className="kp-op-ac">AC</button>
          </div>

          {/* ── Numpad (3 cols) + operator column (1 col) ── */}
          <div className="flex flex-col gap-[3px] px-2 pb-2 pt-[3px] sm:gap-1.5 sm:px-3 sm:pb-3 sm:pt-1.5 md:gap-2.5 md:px-6 md:pb-4 md:pt-2" style={{ background: th.keypadBg }}>
            <div className="grid grid-cols-[2fr_2fr_2fr_1fr] grid-rows-5 gap-[3px] sm:gap-1.5 md:gap-2.5">
              <button type="button" onClick={() => write("7")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>7</button>
              <button type="button" onClick={() => write("8")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>8</button>
              <button type="button" onClick={() => write("9")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>9</button>
              <button type="button" onClick={() => write("+")} className="kp-op-solid" style={{ background: th.opSolidBg }}>+</button>

              <button type="button" onClick={() => write("4")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>4</button>
              <button type="button" onClick={() => write("5")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>5</button>
              <button type="button" onClick={() => write("6")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>6</button>
              <button type="button" onClick={() => write("-")} className="kp-op-solid" style={{ background: th.opSolidBg }}>−</button>

              <button type="button" onClick={() => write("1")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>1</button>
              <button type="button" onClick={() => write("2")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>2</button>
              <button type="button" onClick={() => write("3")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>3</button>
              <button type="button" onClick={() => write("\\cdot ")} className="kp-op-solid" style={{ background: th.opSolidBg }}>×</button>

              <button type="button" onClick={() => write("0")} className="kp-num col-span-2" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>0</button>
              <button type="button" onClick={() => write(".")} className="kp-num" style={{ background: th.numBg, color: th.numText, boxShadow: th.numShadow }}>.</button>
              <button type="button" onClick={() => cmd("\\frac")} className="kp-op-solid" style={{ background: th.opSolidBg }}>
                <span className="flex flex-col items-center text-[11px] leading-[1.1] sm:text-xs">
                  <span>a</span><span className="my-[-1px] h-px w-3 bg-current" /><span>b</span>
                </span>
              </button>

              <button type="button" onClick={onSubmit} className="kp-submit col-span-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M20 6L9 17l-5-5"/></svg>
                Check
              </button>
              <button type="button" onClick={() => write("\\div ")} className="kp-op-solid" style={{ background: th.opSolidBg }}>÷</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
