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

  const keys = useMemo(
    () => ({
      basic: [
        { label: "7", type: "write" as const, latex: "7" },
        { label: "8", type: "write" as const, latex: "8" },
        { label: "9", type: "write" as const, latex: "9" },
        { label: "÷", type: "write" as const, latex: "/" },
        { label: "4", type: "write" as const, latex: "4" },
        { label: "5", type: "write" as const, latex: "5" },
        { label: "6", type: "write" as const, latex: "6" },
        { label: "×", type: "write" as const, latex: "\\cdot " },
        { label: "1", type: "write" as const, latex: "1" },
        { label: "2", type: "write" as const, latex: "2" },
        { label: "3", type: "write" as const, latex: "3" },
        { label: "−", type: "write" as const, latex: "-" },
        { label: "0", type: "write" as const, latex: "0" },
        { label: ".", type: "write" as const, latex: "." },
        { label: "(", type: "write" as const, latex: "\\left(" },
        { label: ")", type: "write" as const, latex: "\\right)" },
        { label: "+", type: "write" as const, latex: "+" },
        { label: "=", type: "write" as const, latex: "=" },
      ],
      trig: [
        { label: "sin", type: "func" as const, latex: "\\sin\\left(\\right)" },
        { label: "cos", type: "func" as const, latex: "\\cos\\left(\\right)" },
        { label: "tan", type: "func" as const, latex: "\\tan\\left(\\right)" },
        { label: "sec", type: "func" as const, latex: "\\sec\\left(\\right)" },
        { label: "csc", type: "func" as const, latex: "\\csc\\left(\\right)" },
        { label: "cot", type: "func" as const, latex: "\\cot\\left(\\right)" },
      ],
      vars: [
        { label: "x", type: "write" as const, latex: "x" },
        { label: "y", type: "write" as const, latex: "y" },
        { label: "t", type: "write" as const, latex: "t" },
        { label: "e", type: "write" as const, latex: "e" },
        { label: "π", type: "write" as const, latex: "\\pi" },
        { label: "C", type: "write" as const, latex: "C" },
      ],
      tools: [
        { label: "frac", type: "cmd" as const, cmd: "\\frac" },
        { label: "√", type: "cmd" as const, cmd: "\\sqrt" },
        { label: "x^n", type: "write" as const, latex: "^" },
        { label: "ln", type: "func" as const, latex: "\\ln\\left(\\right)" },
      ],
    }),
    [],
  );

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
      {/* Desmos-style equation field */}
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          {placeholder}
        </div>
        <div className="mt-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <EditableMathField
            latex={value}
            onChange={(field: MQField) => {
              mqRef.current = field;
              onChange(field.latex());
            }}
            mathquillDidMount={(field: MQField) => {
              mqRef.current = field;
            }}
            className="min-h-[44px] text-xl text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Keypad (tabbed) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap gap-2">
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
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                panel === key
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {panel === "basic" && (
            <div className="grid grid-cols-4 gap-2">
              {keys.basic.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  onClick={() => write(k.latex)}
                  className="keypad-btn"
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}

          {panel === "trig" && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {keys.trig.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  onClick={() => insertFunction(k.latex)}
                  className="keypad-btn"
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}

          {panel === "vars" && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {keys.vars.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  onClick={() => write(k.latex)}
                  className="keypad-btn"
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}

          {panel === "tools" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {keys.tools.map((k) => (
                <button
                  key={k.label}
                  type="button"
                  onClick={() => {
                    if (k.type === "cmd") cmd(k.cmd);
                    else if (k.type === "func") insertFunction(k.latex);
                    else write(k.latex);
                  }}
                  className="keypad-btn"
                >
                  {k.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button type="button" onClick={clear} className="keypad-btn-del">
            Clear
          </button>
          <button type="button" onClick={backspace} className="keypad-btn-del">
            ⌫ Delete
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-emerald-600 px-3 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 sm:col-span-1"
          >
            Check
          </button>
        </div>
      </div>

      {/* Spacer (keeps layout stable) */}
    </div>
  );
}
