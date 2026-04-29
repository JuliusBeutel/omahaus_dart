import { useState } from 'react';
import type { Multiplier } from '../../types/game';
import * as api from '../../api/client';

interface Props {
  sessionId: string;
  canUndo: boolean;
}

const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

function BackArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 5l-7 7 7 7" />
    </svg>
  );
}

export function DartInput({ sessionId, canUndo }: Props) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1);
  const [pending, setPending] = useState(false);

  async function handleThrow(value: number, forceMultiplier?: Multiplier) {
    if (pending) return;
    setPending(true);
    await api.throwDart(sessionId, value, forceMultiplier ?? multiplier);
    setMultiplier(1);
    setPending(false);
  }

  function toggleMultiplier(m: 2 | 3) {
    setMultiplier((prev) => (prev === m ? 1 : m));
  }

  const bull25Disabled = pending || multiplier === 3;

  return (
    <div className="flex-1 flex flex-col gap-2 p-3 bg-base">
      <div className="grid grid-cols-2 gap-2">
        {([2, 3] as const).map((m) => (
          <button
            key={m}
            onClick={() => toggleMultiplier(m)}
            className={`p-3 rounded-xl border-2 font-semibold cursor-pointer ${
              multiplier === m
                ? 'bg-overlay text-primary border-accent'
                : 'bg-surface text-muted border-transparent'
            }`}
          >
            {m === 2 ? 'Double' : 'Triple'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {NUMBERS.map((n) => (
          <button
            key={n}
            onClick={() => handleThrow(n)}
            disabled={pending}
            className={`flex flex-col items-center justify-center py-3 min-h-14 bg-surface border border-overlay rounded-xl cursor-pointer ${pending ? 'opacity-30' : ''}`}
          >
            <span className="text-primary font-semibold text-xl leading-none">{n}</span>
            {multiplier > 1 && <Dots count={multiplier} />}
          </button>
        ))}

        <button
          onClick={() => handleThrow(0)}
          disabled={pending}
          className={`flex flex-col items-center justify-center py-3 min-h-14 bg-surface border border-overlay rounded-xl cursor-pointer ${pending ? 'opacity-30' : ''}`}
        >
          <span className="text-primary font-semibold text-xl leading-none">0</span>
          {multiplier > 1 && <Dots count={multiplier} />}
        </button>

        <button
          onClick={() => handleThrow(25)}
          disabled={bull25Disabled}
          className={`flex flex-col items-center justify-center py-3 min-h-14 bg-surface border border-overlay rounded-xl cursor-pointer ${bull25Disabled ? 'opacity-30' : ''}`}
        >
          <span className="text-primary font-semibold text-xl leading-none">25</span>
          {multiplier === 2 && <Dots count={2} />}
        </button>

        <button
          onClick={() => api.undoThrow(sessionId)}
          disabled={!canUndo}
          className={`col-span-2 flex items-center justify-center py-3 min-h-14 bg-overlay border border-overlay rounded-xl cursor-pointer text-muted ${!canUndo ? 'opacity-30' : ''}`}
        >
          <BackArrow />
        </button>
      </div>
    </div>
  );
}

function Dots({ count }: { count: number }) {
  return (
    <div className="flex gap-1 justify-center mt-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
      ))}
    </div>
  );
}
