"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
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

  useEffect(() => {
    if (stylesInjected) return;
    addStyles();
    stylesInjected = true;
  }, []);

  const keys = useMemo(
    () => ({
      numbers: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"],
      ops: [
        { label: "÷", latex: "\\div " },
        { label: "×", latex: "\\cdot " },
        { label: "−", latex: "-" },
        { label: "+", latex: "+" },
      ],
      funcs: [
        { label: "sin", latex: "\\sin\\left(\\right)" },
        { label: "cos", latex: "\\cos\\left(\\right)" },
        { label: "tan", latex: "\\tan\\left(\\right)" },
        { label: "ln", latex: "\\ln\\left(\\right)" },
      ],
      misc: [
        { label: "x", latex: "x" },
        { label: "e", latex: "e" },
        { label: "π", latex: "\\pi" },
        { label: "(", latex: "\\left(" },
        { label: ")", latex: "\\right)" },
        { label: "^", latex: "^" },
        { label: "√", latex: "\\sqrt{}" },
        { label: "frac", latex: "\\frac{}{}" },
        { label: "C", latex: "C" },
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

  return (
    <div className="space-y-3">
      {/* Desmos-style equation field */}
      <div className="rounded-2xl border-2 border-emerald-500 bg-white px-4 py-3 shadow-sm dark:border-emerald-700 dark:bg-zinc-950">
        <div className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {placeholder}
        </div>
        <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
          <EditableMathField
            latex={value}
            onChange={(field: MQField) => {
              mqRef.current = field;
              onChange(field.latex());
            }}
            mathquillDidMount={(field: MQField) => {
              mqRef.current = field;
            }}
            className="min-h-[44px] text-xl text-emerald-950 dark:text-emerald-100"
          />
        </div>
      </div>

      {/* Keypad */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {keys.funcs.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => {
                // write function and place cursor inside parentheses
                write(k.latex);
                mqRef.current?.keystroke("Left");
              }}
              className="keypad-btn-sec"
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button type="button" onClick={() => write("7")} className="keypad-btn">
            7
          </button>
          <button type="button" onClick={() => write("8")} className="keypad-btn">
            8
          </button>
          <button type="button" onClick={() => write("9")} className="keypad-btn">
            9
          </button>
          <button
            type="button"
            onClick={() => write("\\div ")}
            className="keypad-btn-op"
          >
            ÷
          </button>

          <button type="button" onClick={() => write("4")} className="keypad-btn">
            4
          </button>
          <button type="button" onClick={() => write("5")} className="keypad-btn">
            5
          </button>
          <button type="button" onClick={() => write("6")} className="keypad-btn">
            6
          </button>
          <button
            type="button"
            onClick={() => write("\\cdot ")}
            className="keypad-btn-op"
          >
            ×
          </button>

          <button type="button" onClick={() => write("1")} className="keypad-btn">
            1
          </button>
          <button type="button" onClick={() => write("2")} className="keypad-btn">
            2
          </button>
          <button type="button" onClick={() => write("3")} className="keypad-btn">
            3
          </button>
          <button type="button" onClick={() => write("-")} className="keypad-btn-op">
            −
          </button>

          <button type="button" onClick={() => write("0")} className="keypad-btn">
            0
          </button>
          <button type="button" onClick={() => write(".")} className="keypad-btn">
            .
          </button>
          <button type="button" onClick={clear} className="keypad-btn">
            C
          </button>
          <button type="button" onClick={() => write("+")} className="keypad-btn-op">
            +
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {keys.misc.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => {
                if (k.label === "frac") {
                  cmd("\\frac");
                  return;
                }
                if (k.label === "√") {
                  cmd("\\sqrt");
                  return;
                }
                write(k.latex);
              }}
              className="keypad-btn-sec"
            >
              {k.label}
            </button>
          ))}
          <button type="button" onClick={backspace} className="keypad-btn-del">
            ⌫
          </button>
        </div>
      </div>

      {/* Check Button */}
      <button
        type="button"
        onClick={onSubmit}
        className="w-full rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
      >
        Check Answer ✓
      </button>
    </div>
  );
}
