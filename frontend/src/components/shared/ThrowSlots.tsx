import type { DartThrow } from '../../types/game';
import DartIcon from './DartIcon';
import { formatThrowLabel } from '../../../lib/gameLogic';

interface ThrowSlotsProps {
  throws: DartThrow[];
  invisible?: boolean;
}

export default function ThrowSlots({ throws, invisible = false }: ThrowSlotsProps) {
  const slots = [0, 1, 2];

  return (
    <div className={`flex gap-2 justify-center ${invisible ? 'invisible' : ''}`}>
      {slots.map((i) => {
        const t = throws[i];
        return (
          <div
            key={i}
            className="flex items-center gap-1 bg-overlay rounded px-2 py-1 min-w-[3.5rem] justify-center"
          >
            <DartIcon className="w-3 h-3 text-accent" />
            <span className="text-sm font-mono text-primary">
              {t ? formatThrowLabel(t) : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
