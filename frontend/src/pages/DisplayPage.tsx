import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { ScoreBoard } from '../components/display/ScoreBoard';
import { QRCodeDisplay } from '../components/display/QRCodeDisplay';
import { PlayerCard } from '../components/display/PlayerCard';
import { TurnSummary } from '../components/shared/TurnSummary';
import type { DartThrow } from '../types/game';

interface SummaryData { throws: DartThrow[]; total: number; }

export function DisplayPage() {
  const { id } = useParams<{ id: string }>();
  const state = useGameState(id ?? null);
  const prevHistoryLen = useRef(0);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    if (!state) return;
    const len = state.turnHistory.length;
    if (len > prevHistoryLen.current) {
      const completed = state.turnHistory[len - 1];
      if (!completed.wasBust) {
        const total = completed.throws.reduce((s, t) => s + t.points, 0);
        setSummary({ throws: completed.throws, total });
        setTimeout(() => setSummary(null), 1500);
      }
    }
    prevHistoryLen.current = len;
  }, [state?.turnHistory.length]);

  if (!id) return null;

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base">
        <p className="text-muted text-2xl">Verbinde...</p>
      </div>
    );
  }

  if (state.status === 'finished') {
    const winner = state.players.find((p) => p.id === state.winnerId);
    const avg = winner && winner.dartsThrown > 0
      ? ((state.mode - winner.score) / winner.dartsThrown * 3).toFixed(1)
      : '—';

    return (
      <div className="flex items-center justify-center min-h-screen bg-base">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted text-lg uppercase tracking-widest">Gewinner</p>
          <p className="text-primary text-8xl font-bold">{winner?.name ?? '?'}</p>
          <p className="text-primary text-2xl">Ø {avg} pro Runde</p>
        </div>
      </div>
    );
  }

  if (state.status === 'playing') {
    const cols = state.players.length === 4 ? 2 : state.players.length;
    return (
      <div
        className="grid h-screen"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {state.players.map((player, i) => (
          <PlayerCard
            key={player.id}
            player={player}
            isActive={i === state.currentPlayerIndex}
            throws={i === state.currentPlayerIndex ? state.currentTurn.throws : []}
          />
        ))}
        {summary && <TurnSummary throws={summary.throws} total={summary.total} />}
      </div>
    );
  }

  return (
    <div className="flex gap-10 p-10 min-h-screen bg-base text-primary items-start">
      <div className="shrink-0">
        <QRCodeDisplay sessionId={id} />
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <ScoreBoard players={state.players} />
      </div>
    </div>
  );
}
