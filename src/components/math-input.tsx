"use client";

import { useState } from "react";

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export function MathInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Tap to enter answer",
}: MathInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const numbers = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];
  const symbols = [
    { label: "×", value: "*" },
    { label: "÷", value: "/" },
    { label: "+", value: "+" },
    { label: "−", value: "-" },
    { label: "=", value: "=" },
    { label: "^", value: "^" },
    { label: "√", value: "sqrt" },
    { label: "π", value: "pi" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: ".", value: "." },
    { label: "x", value: "x" },
    { label: "e", value: "e" },
    { label: "ln", value: "ln" },
    { label: "sin", value: "sin" },
    { label: "cos", value: "cos" },
    { label: "tan", value: "tan" },
    { label: "C", value: "C" },
  ];

  const handleButtonClick = (val: string) => {
    if (val === "C") {
      onChange("");
    } else {
      onChange(value + val);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleDone = () => {
    setIsOpen(false);
    onSubmit();
  };

  return (
    <div className="space-y-4">
      {/* Input Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-left text-lg dark:border-zinc-700 dark:bg-zinc-800"
      >
        {value || (
          <span className="text-zinc-400 dark:text-zinc-500">{placeholder}</span>
        )}
      </button>

      {/* Inline Keypad */}
      {isOpen && (
        <div className="rounded-2xl border-2 border-blue-500 bg-zinc-50 p-4 dark:bg-zinc-900/50 sm:p-6">
          {/* Display Area */}
          <div className="mb-4 min-h-[50px] rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-right text-xl font-medium dark:border-blue-900/50 dark:bg-zinc-800 sm:text-2xl">
            {value || (
              <span className="text-zinc-400 dark:text-zinc-500">
                Enter answer
              </span>
            )}
          </div>

          {/* Keypad Grid */}
          <div className="mb-3 grid grid-cols-5 gap-1.5 sm:gap-2">
            {/* Numbers (left side, 3 columns) */}
            <div className="col-span-3 grid grid-cols-3 gap-1.5 sm:gap-2">
              {numbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleButtonClick(num)}
                  className="rounded-lg bg-zinc-100 py-3 text-lg font-semibold text-zinc-900 transition hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 sm:rounded-xl sm:py-4 sm:text-xl"
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Math Symbols (right side, 2 columns) */}
            <div className="col-span-2 grid grid-cols-2 gap-1.5 sm:gap-2">
              {symbols.slice(0, 6).map((sym) => (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() => handleButtonClick(sym.value)}
                  className="rounded-lg bg-blue-100 py-3 text-base font-semibold text-blue-900 transition hover:bg-blue-200 active:scale-95 dark:bg-blue-900/30 dark:text-blue-100 dark:hover:bg-blue-900/50 sm:rounded-xl sm:py-4 sm:text-lg"
                >
                  {sym.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extended Symbols */}
          <div className="mb-3 grid grid-cols-6 gap-1.5 sm:gap-2">
            {symbols.slice(6).map((sym) => (
              <button
                key={sym.label}
                type="button"
                onClick={() => handleButtonClick(sym.value)}
                className="rounded-lg bg-purple-100 px-1 py-2.5 text-xs font-semibold text-purple-900 transition hover:bg-purple-200 active:scale-95 dark:bg-purple-900/30 dark:text-purple-100 dark:hover:bg-purple-900/50 sm:px-2 sm:py-3 sm:text-sm"
              >
                {sym.label}
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleBackspace}
              className="rounded-lg bg-red-100 py-3 text-base font-semibold text-red-900 transition hover:bg-red-200 active:scale-95 dark:bg-red-900/30 dark:text-red-100 dark:hover:bg-red-900/50 sm:rounded-xl sm:py-4 sm:text-lg"
            >
              ⌫ Back
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-zinc-200 py-3 text-base font-semibold text-zinc-900 transition hover:bg-zinc-300 active:scale-95 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600 sm:rounded-xl sm:py-4 sm:text-lg"
            >
              Hide
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 py-3 text-base font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-95 sm:rounded-xl sm:py-4 sm:text-lg"
            >
              Check ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
