"use client";

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
  placeholder = "Your answer",
}: MathInputProps) {
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

  return (
    <div className="space-y-4">
      {/* Answer Display */}
      <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 px-4 py-3 dark:border-emerald-700 dark:bg-emerald-950/30">
        <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {placeholder}
        </div>
        <div className="mt-1 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
          {value || "—"}
        </div>
      </div>

      {/* Keypad */}
      <div className="space-y-2">
        {/* Numbers and Basic Operations */}
        <div className="grid grid-cols-5 gap-2">
          {/* Numbers (3 columns) */}
          <div className="col-span-3 grid grid-cols-3 gap-2">
            {numbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleButtonClick(num)}
                className="rounded-lg bg-white py-4 text-xl font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Basic Math Symbols (2 columns) */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {symbols.slice(0, 6).map((sym) => (
              <button
                key={sym.label}
                type="button"
                onClick={() => handleButtonClick(sym.value)}
                className="rounded-lg bg-blue-500 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-600 active:scale-95"
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extended Symbols */}
        <div className="grid grid-cols-6 gap-2">
          {symbols.slice(6).map((sym) => (
            <button
              key={sym.label}
              type="button"
              onClick={() => handleButtonClick(sym.value)}
              className="rounded-lg bg-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 active:scale-95"
            >
              {sym.label}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleBackspace}
            className="rounded-lg bg-red-500 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-red-600 active:scale-95"
          >
            ⌫ Delete
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-lg bg-emerald-600 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            Check Answer ✓
          </button>
        </div>
      </div>
    </div>
  );
}
