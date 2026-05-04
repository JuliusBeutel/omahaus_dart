import type { Multiplier } from '../../types/game';

interface DartInputProps {
  multiplier: Multiplier;
  onMultiplierChange: (m: Multiplier) => void;
  onThrow: (value: number) => void;
  onUndo: () => void;
  disabled?: boolean;
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

function MultiplierDots({ count }: { count: Multiplier }) {
  if (count === 1) return <span className="h-2" />;
  return (
    <span className="flex gap-1 justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
      ))}
    </span>
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
          className={`py-3 rounded-lg font-bold text-base border transition-colors ${
            multiplier === 2
              ? 'bg-accent border-accent text-primary'
              : 'bg-overlay border-overlay text-muted'
          }`}
        >
          Double
        </button>
        <button
          onClick={() => toggleMultiplier(3)}
          className={`py-3 rounded-lg font-bold text-base border transition-colors ${
            multiplier === 3
              ? 'bg-accent border-accent text-primary'
              : 'bg-overlay border-overlay text-muted'
          }`}
        >
          Triple
        </button>
      </div>

      {/* Number grid 4×5 */}
      <div className="grid grid-cols-4 gap-2">
        {NUMBERS.map((n) => (
          <button
            key={n}
            onClick={() => !disabled && onThrow(n)}
            disabled={disabled}
            className="py-2 flex flex-col items-center justify-center gap-0.5 bg-overlay border border-accent rounded-lg text-primary font-bold text-lg active:bg-accent disabled:opacity-40"
          >
            {n}
            <MultiplierDots count={multiplier} />
          </button>
        ))}
      </div>

      {/* Bottom row: 0 | 25 | Undo */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => !disabled && onThrow(0)}
          disabled={disabled}
          className="py-2 flex flex-col items-center justify-center gap-0.5 bg-overlay border border-accent rounded-lg text-primary font-bold text-lg active:bg-accent disabled:opacity-40"
        >
          0
          <MultiplierDots count={multiplier} />
        </button>
        <button
          onClick={() => !disabled && onThrow(25)}
          disabled={disabled || multiplier === 3}
          className="py-2 flex flex-col items-center justify-center gap-0.5 bg-overlay border border-accent rounded-lg text-primary font-bold text-lg active:bg-accent disabled:opacity-40"
        >
          25
          <MultiplierDots count={multiplier === 3 ? 1 : multiplier} />
        </button>
        <button
          onClick={onUndo}
          className="col-span-2 py-3 bg-surface border border-accent rounded-lg text-muted font-bold text-base active:bg-overlay"
        >
          ↩ zurück
        </button>
      </div>
    </div>
  );
}
