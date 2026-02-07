"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { addStyles } from "react-mathquill";

let stylesInjected = false;

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  /** Variables and symbols detected in the current question for suggestions */
  questionContext?: {
    hasVariable?: string[];
    hasTrig?: boolean;
    hasExp?: boolean;
    hasLn?: boolean;
    hasPi?: boolean;
  };
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

export function MathInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Your answer",
  questionContext,
}: MathInputProps) {
  const mqRef = useRef<MQField | null>(null);
  const [panel, setPanel] = useState<"basic" | "trig" | "vars" | "tools">(
    "basic",
  );

  useEffect(() => {
    if (stylesInjected) return;
    addStyles();
    stylesInjected = true;
  }, []);

  // Build suggested keys based on question context
  const suggestedKeys = useMemo(() => {
    const suggestions: Array<{
      label: string;
      action: () => void;
    }> = [];

    if (questionContext?.hasVariable) {
      questionContext.hasVariable.forEach((v) => {
        if (!suggestions.find((s) => s.label === v)) {
          suggestions.push({
            label: v,
            action: () => write(v === "π" ? "\\pi" : v),
          });
        }
      });
    }

    if (questionContext?.hasPi && !suggestions.find((s) => s.label === "π")) {
      suggestions.push({ label: "π", action: () => write("\\pi") });
    }

    if (questionContext?.hasExp && !suggestions.find((s) => s.label === "e")) {
      suggestions.push({ label: "e", action: () => write("e") });
    }

    if (questionContext?.hasLn) {
      suggestions.push({
        label: "ln",
        action: () => insertFunction("\\ln\\left(\\right)"),
      });
    }

    if (questionContext?.hasTrig) {
      suggestions.push({
        label: "sin",
        action: () => insertFunction("\\sin\\left(\\right)"),
      });
      suggestions.push({
        label: "cos",
        action: () => insertFunction("\\cos\\left(\\right)"),
      });
    }

    // Always suggest common tools
    if (!suggestions.find((s) => s.label === "frac")) {
      suggestions.push({ label: "frac", action: () => cmd("\\frac") });
    }
    if (!suggestions.find((s) => s.label === "xⁿ")) {
      suggestions.push({ label: "xⁿ", action: () => cmd("^") });
    }
    if (!suggestions.find((s) => s.label === "√")) {
      suggestions.push({ label: "√", action: () => cmd("\\sqrt") });
    }

    return suggestions.slice(0, 8); // Max 8 suggestions
  }, [questionContext]);

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
    // Move cursor inside the parentheses we just inserted.
    mqRef.current?.keystroke("Left");
  };

  return (
    <div className="space-y-3">
      {/* Equation input field */}
      <div className="rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {placeholder}
        </div>
        <div className="mt-2 rounded-xl border-2 border-orange-100 bg-white px-3 py-2 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-200">
          <EditableMathField
            latex={value}
            config={{
              spaceBehavesLikeTab: true,
            }}
            onChange={(field: MQField) => {
              mqRef.current = field;
              onChange(field.latex());
            }}
            mathquillDidMount={(field: MQField) => {
              mqRef.current = field;
            }}
            className="min-h-[44px] text-xl text-zinc-900"
          />
        </div>
      </div>

      {/* Calculator Keypad */}
      <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 border-b border-orange-100 pb-3">
          {(
            [
              ["basic", "123"],
              ["trig", "Trig"],
              ["vars", "Vars"],
              ["tools", "Tools"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPanel(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                panel === key
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Suggested section */}
        {suggestedKeys.length > 0 && (
          <div className="mt-3 border-b border-orange-100 pb-3">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Suggested
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedKeys.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  onClick={k.action}
                  className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 active:scale-95"
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Panel content */}
        <div className="mt-3">
          {panel === "basic" && (
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1: 7 8 9 ÷ */}
              <button type="button" onClick={() => write("7")} className="keypad-btn">7</button>
              <button type="button" onClick={() => write("8")} className="keypad-btn">8</button>
              <button type="button" onClick={() => write("9")} className="keypad-btn">9</button>
              <button type="button" onClick={() => write("/")} className="keypad-btn">÷</button>
              
              {/* Row 2: 4 5 6 × */}
              <button type="button" onClick={() => write("4")} className="keypad-btn">4</button>
              <button type="button" onClick={() => write("5")} className="keypad-btn">5</button>
              <button type="button" onClick={() => write("6")} className="keypad-btn">6</button>
              <button type="button" onClick={() => write("\\cdot ")} className="keypad-btn">×</button>
              
              {/* Row 3: 1 2 3 − */}
              <button type="button" onClick={() => write("1")} className="keypad-btn">1</button>
              <button type="button" onClick={() => write("2")} className="keypad-btn">2</button>
              <button type="button" onClick={() => write("3")} className="keypad-btn">3</button>
              <button type="button" onClick={() => write("-")} className="keypad-btn">−</button>
              
              {/* Row 4: 0 . ( ) */}
              <button type="button" onClick={() => write("0")} className="keypad-btn">0</button>
              <button type="button" onClick={() => write(".")} className="keypad-btn">.</button>
              <button type="button" onClick={() => write("\\left(")} className="keypad-btn">(</button>
              <button type="button" onClick={() => write("\\right)")} className="keypad-btn">)</button>
              
              {/* Row 5: + = xⁿ frac */}
              <button type="button" onClick={() => write("+")} className="keypad-btn">+</button>
              <button type="button" onClick={() => write("=")} className="keypad-btn">=</button>
              <button type="button" onClick={() => cmd("^")} className="keypad-btn">xⁿ</button>
              <button type="button" onClick={() => cmd("\\frac")} className="keypad-btn">frac</button>
            </div>
          )}

          {panel === "trig" && (
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => insertFunction("\\sin\\left(\\right)")} className="keypad-btn">sin</button>
              <button type="button" onClick={() => insertFunction("\\cos\\left(\\right)")} className="keypad-btn">cos</button>
              <button type="button" onClick={() => insertFunction("\\tan\\left(\\right)")} className="keypad-btn">tan</button>
              <button type="button" onClick={() => insertFunction("\\sec\\left(\\right)")} className="keypad-btn">sec</button>
              <button type="button" onClick={() => insertFunction("\\csc\\left(\\right)")} className="keypad-btn">csc</button>
              <button type="button" onClick={() => insertFunction("\\cot\\left(\\right)")} className="keypad-btn">cot</button>
              <button type="button" onClick={() => insertFunction("\\arcsin\\left(\\right)")} className="keypad-btn">arcsin</button>
              <button type="button" onClick={() => insertFunction("\\arccos\\left(\\right)")} className="keypad-btn">arccos</button>
              <button type="button" onClick={() => insertFunction("\\arctan\\left(\\right)")} className="keypad-btn">arctan</button>
            </div>
          )}

          {panel === "vars" && (
            <div className="grid grid-cols-4 gap-2">
              <button type="button" onClick={() => write("x")} className="keypad-btn">x</button>
              <button type="button" onClick={() => write("y")} className="keypad-btn">y</button>
              <button type="button" onClick={() => write("t")} className="keypad-btn">t</button>
              <button type="button" onClick={() => write("n")} className="keypad-btn">n</button>
              <button type="button" onClick={() => write("a")} className="keypad-btn">a</button>
              <button type="button" onClick={() => write("b")} className="keypad-btn">b</button>
              <button type="button" onClick={() => write("c")} className="keypad-btn">c</button>
              <button type="button" onClick={() => write("k")} className="keypad-btn">k</button>
              <button type="button" onClick={() => write("e")} className="keypad-btn">e</button>
              <button type="button" onClick={() => write("\\pi")} className="keypad-btn">π</button>
              <button type="button" onClick={() => write("C")} className="keypad-btn">C</button>
              <button type="button" onClick={() => write("\\infty")} className="keypad-btn">∞</button>
            </div>
          )}

          {panel === "tools" && (
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => cmd("\\frac")} className="keypad-btn">frac</button>
              <button type="button" onClick={() => cmd("\\sqrt")} className="keypad-btn">√</button>
              <button type="button" onClick={() => cmd("^")} className="keypad-btn">xⁿ</button>
              <button type="button" onClick={() => cmd("_")} className="keypad-btn">x₍ₙ₎</button>
              <button type="button" onClick={() => insertFunction("\\ln\\left(\\right)")} className="keypad-btn">ln</button>
              <button type="button" onClick={() => insertFunction("\\log\\left(\\right)")} className="keypad-btn">log</button>
              <button type="button" onClick={() => write("\\left|\\right|")} className="keypad-btn">|x|</button>
              <button type="button" onClick={() => write("\\leq")} className="keypad-btn">≤</button>
              <button type="button" onClick={() => write("\\geq")} className="keypad-btn">≥</button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-orange-100 pt-3">
          <button type="button" onClick={clear} className="keypad-btn-del">
            Clear
          </button>
          <button type="button" onClick={backspace} className="keypad-btn-del">
            ⌫
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-3 text-base font-bold text-white shadow-md transition hover:shadow-lg active:scale-95"
          >
            Check ✓
          </button>
        </div>
      </div>
    </div>
  );
}
