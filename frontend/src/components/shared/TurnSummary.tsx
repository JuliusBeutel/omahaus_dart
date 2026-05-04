import type { DartThrow } from '../../types/game';
import { formatThrowLabel } from '../../../lib/gameLogic';

interface TurnSummaryProps {
  throws: DartThrow[];
  total: number;
  isBust?: boolean;
}

export default function TurnSummary({ throws, total, isBust = false }: TurnSummaryProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-base/90 z-50">
      <div className="animate-pop-in flex flex-col items-center gap-6 bg-surface border border-accent rounded-2xl px-12 py-10">
        {isBust ? (
          <span className="text-5xl font-bold text-danger">Bust!</span>
        ) : (
          <>
            <div className="flex gap-4">
              {throws.map((t, i) => (
                <span
                  key={i}
                  className="text-xl font-mono bg-overlay rounded px-3 py-1 text-primary"
                >
                  {formatThrowLabel(t)}
                </span>
              ))}
            </div>
            <span className="text-4xl font-bold text-primary">{total} Punkte</span>
          </>
        )}
      </div>
    </div>
  );
}
