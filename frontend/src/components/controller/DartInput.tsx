import type { Multiplier } from "../../types/game";

interface DartInputProps {
  multiplier: Multiplier;
  onMultiplierChange: (m: Multiplier) => void;
  onThrow: (value: number) => void;
  onUndo: () => void;
  disabled?: boolean;
}

const NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

function MultiplierDots({ count }: { count: Multiplier }) {
  return (
    <span
      className={`flex gap-1 justify-center ${count === 1 ? "invisible" : ""}`}
    >
      {Array.from({ length: count === 1 ? 2 : count }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
        />
      ))}
    </span>
  );
}

interface NumberButtonProps {
  value: number;
  multiplier: Multiplier;
  onThrow: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

function NumberButton({
  value,
  multiplier,
  onThrow,
  disabled = false,
  className = "",
}: NumberButtonProps) {
  const effectiveMultiplier: Multiplier =
    value === 25 && multiplier === 3 ? 1 : multiplier;
  const isDisabled = disabled || (value === 25 && multiplier === 3);

  return (
    <button
      onClick={() => !isDisabled && onThrow(value)}
      disabled={isDisabled}
      className={`py-3 flex flex-col items-center justify-center gap-0.5 bg-surface rounded-lg text-primary font-bold text-2xl active:bg-accent disabled:opacity-40 ${className}`}
    >
      {value}
      <MultiplierDots count={effectiveMultiplier} />
    </button>
  );
}

export default function DartInput({
  multiplier,
  onMultiplierChange,
  onThrow,
  onUndo,
  disabled = false,
}: DartInputProps) {
  function toggleMultiplier(m: 2 | 3) {
    onMultiplierChange(multiplier === m ? 1 : m);
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Double / Triple toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => toggleMultiplier(2)}
          className={`py-3 rounded-lg font-bold transition-colors text-2xl ${
            multiplier === 2
              ? "bg-accent border-accent text-primary"
              : "bg-surface border-overlay text-muted"
          }`}
        >
          Double
        </button>
        <button
          onClick={() => toggleMultiplier(3)}
          className={`py-3 rounded-lg font-bold text-2xl transition-colors ${
            multiplier === 3
              ? "bg-accent border-accent text-primary"
              : "bg-surface border-overlay text-muted"
          }`}
        >
          Triple
        </button>
      </div>

      {/* Number grid 4×5 */}
      <div className="grid grid-cols-4 gap-2">
        {NUMBERS.map((n) => (
          <NumberButton
            key={n}
            value={n}
            multiplier={multiplier}
            onThrow={onThrow}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Bottom row: 0 | 25 | Undo */}
      <div className="grid grid-cols-4 gap-2">
        <NumberButton
          value={0}
          multiplier={multiplier}
          onThrow={onThrow}
          disabled={disabled}
        />
        <NumberButton
          value={25}
          multiplier={multiplier}
          onThrow={onThrow}
          disabled={disabled}
        />
        <button
          onClick={onUndo}
          className="col-span-2 py-3 bg-surface rounded-lg text-muted font-bold text-base active:bg-overlay"
        >
          ↩
        </button>
      </div>
    </div>
  );
}
