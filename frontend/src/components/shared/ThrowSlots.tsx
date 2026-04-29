import type { DartThrow } from '../../types/game';
import { DartIcon } from './DartIcon';

interface Props {
  throws: DartThrow[];
  visible?: boolean;
}

function throwLabel(t: DartThrow): string {
  const prefix = t.multiplier === 2 ? 'D' : t.multiplier === 3 ? 'T' : '';
  const field = t.value === 25 ? 'Bull' : String(t.value);
  return `${prefix}${field}`;
}

export function ThrowSlots({ throws, visible = true }: Props) {
  return (
    <div className={`flex gap-3 mt-3 ${visible ? 'visible' : 'invisible'}`}>
      {[0, 1, 2].map((i) => {
        const t = throws[i];
        return (
          <div
            key={i}
            className="w-20 h-14 bg-overlay rounded-xl flex items-center justify-center border border-accent/40"
          >
            {t ? (
              <span className="text-primary font-bold text-lg">{throwLabel(t)}</span>
            ) : (
              <span className="text-accent">
                <DartIcon />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
