import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { SetupScreen } from '../components/controller/SetupScreen';
import { DartInput } from '../components/controller/DartInput';
import { ThrowSlots } from '../components/shared/ThrowSlots';
import * as api from '../api/client';

export function ControllerPage() {
  const { id } = useParams<{ id: string }>();
  const state = useGameState(id ?? null);

  if (!id) return null;

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base">
        <p className="text-muted text-lg">Verbinde mit Session {id}...</p>
      </div>
    );
  }

  if (state.status === 'setup') {
    return (
      <div className="min-h-screen bg-base">
        <SetupScreen sessionId={id} state={state} />
      </div>
    );
  }

  if (state.status === 'finished') {
    const winner = state.players.find((p) => p.id === state.winnerId);
    return (
      <div className="flex items-center justify-center min-h-screen bg-base">
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-muted text-sm uppercase tracking-widest">Spiel beendet</p>
          <p className="text-primary text-4xl font-bold">{winner?.name} gewinnt!</p>
          <button
            onClick={() => api.resetGame(id)}
            className="px-10 py-4 bg-action text-primary font-bold text-lg rounded-xl cursor-pointer"
          >
            Neues Spiel
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const canUndo = state.currentTurn.throws.length > 0 || state.turnHistory.length > 0;

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <div className="bg-surface border-b border-overlay text-center px-4 py-5">
        <p className="text-primary font-semibold text-lg mb-1">{currentPlayer?.name}</p>
        <p className="text-primary font-bold text-6xl leading-none">{currentPlayer?.score}</p>
        <div className="flex justify-center">
          <ThrowSlots throws={state.currentTurn.throws} />
        </div>
      </div>
      <DartInput sessionId={id} canUndo={canUndo} />
    </div>
  );
}
