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
  const handleButtonClick = (val: string) => {
    onChange(value + val);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      {/* Answer Display */}
      <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 px-4 py-2.5 dark:border-emerald-700 dark:bg-emerald-950/30">
        <div className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {placeholder}
        </div>
        <div className="mt-0.5 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
          {value || "—"}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1: 7, 8, 9, ÷ */}
        <button onClick={() => handleButtonClick("7")} className="keypad-btn">7</button>
        <button onClick={() => handleButtonClick("8")} className="keypad-btn">8</button>
        <button onClick={() => handleButtonClick("9")} className="keypad-btn">9</button>
        <button onClick={() => handleButtonClick("/")} className="keypad-btn-op">÷</button>

        {/* Row 2: 4, 5, 6, × */}
        <button onClick={() => handleButtonClick("4")} className="keypad-btn">4</button>
        <button onClick={() => handleButtonClick("5")} className="keypad-btn">5</button>
        <button onClick={() => handleButtonClick("6")} className="keypad-btn">6</button>
        <button onClick={() => handleButtonClick("*")} className="keypad-btn-op">×</button>

        {/* Row 3: 1, 2, 3, − */}
        <button onClick={() => handleButtonClick("1")} className="keypad-btn">1</button>
        <button onClick={() => handleButtonClick("2")} className="keypad-btn">2</button>
        <button onClick={() => handleButtonClick("3")} className="keypad-btn">3</button>
        <button onClick={() => handleButtonClick("-")} className="keypad-btn-op">−</button>

        {/* Row 4: 0, ., C, + */}
        <button onClick={() => handleButtonClick("0")} className="keypad-btn">0</button>
        <button onClick={() => handleButtonClick(".")} className="keypad-btn">.</button>
        <button onClick={handleClear} className="keypad-btn">C</button>
        <button onClick={() => handleButtonClick("+")} className="keypad-btn-op">+</button>

        {/* Row 5: (, ), ^, √ */}
        <button onClick={() => handleButtonClick("(")} className="keypad-btn-sec">(</button>
        <button onClick={() => handleButtonClick(")")} className="keypad-btn-sec">)</button>
        <button onClick={() => handleButtonClick("^")} className="keypad-btn-sec">x^n</button>
        <button onClick={() => handleButtonClick("sqrt")} className="keypad-btn-sec">√</button>

        {/* Row 6: x, π, e, ⌫ */}
        <button onClick={() => handleButtonClick("x")} className="keypad-btn-sec">x</button>
        <button onClick={() => handleButtonClick("pi")} className="keypad-btn-sec">π</button>
        <button onClick={() => handleButtonClick("e")} className="keypad-btn-sec">e</button>
        <button onClick={handleBackspace} className="keypad-btn-del">⌫</button>
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
