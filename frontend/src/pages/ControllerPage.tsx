import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { GameState, Multiplier } from '../types/game';
import { processThrow as localProcessThrow, undoLastThrow as localUndo } from '../../lib/gameLogic';
import { getSession, postThrow, postUndo, postReset, deleteSession } from '../api/client';
import SetupScreen from '../components/controller/SetupScreen';
import DartInput from '../components/controller/DartInput';
import ThrowSlots from '../components/shared/ThrowSlots';

export default function ControllerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [multiplier, setMultiplier] = useState<Multiplier>(1);
  const pendingRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (pendingRef.current) return;
      try {
        const data = await getSession(id!);
        if (active) setGameState(data);
      } catch {
        // ignore
      }
    }

    poll();
    const interval = setInterval(poll, 800);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  async function handleThrow(value: number) {
    if (!gameState || gameState.status !== 'playing') return;
    const prevState = gameState;
    const optimistic = localProcessThrow(gameState, value, multiplier);
    setGameState(optimistic);
    setMultiplier(1);
    pendingRef.current = true;
    try {
      const newState = await postThrow(id!, value, multiplier);
      setGameState(newState);
    } catch {
      setGameState(prevState);
    } finally {
      pendingRef.current = false;
    }
  }

  async function handleUndo() {
    if (!gameState) return;
    const prevState = gameState;
    const optimistic = localUndo(gameState);
    setGameState(optimistic);
    pendingRef.current = true;
    try {
      const newState = await postUndo(id!);
      setGameState(newState);
    } catch {
      setGameState(prevState);
    } finally {
      pendingRef.current = false;
    }
  }

  async function handleExit() {
    if (!id) return;
    try {
      const newState = await postReset(id);
      setGameState(newState);
    } catch {
      // ignore
    }
  }

  async function handleEndSession() {
    if (!id) return;
    try {
      await deleteSession(id);
    } catch { /* ignore */ }
    navigate('/scan', { replace: true });
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full bg-base">
        <span className="text-muted">Lade...</span>
      </div>
    );
  }

  if (gameState.status === 'setup') {
    return (
      <SetupScreen
        state={gameState}
        onStateChange={setGameState}
        onEndSession={handleEndSession}
      />
    );
  }

  if (gameState.status === 'finished') {
    const winner = gameState.players.find((p) => p.id === gameState.winnerId);
    return (
      <div className="flex flex-col items-center justify-center h-full bg-base gap-8 p-6">
        <div className="flex flex-col items-center gap-4 bg-surface border border-accent rounded-2xl px-8 py-8 w-full">
          <span className="text-muted">Gewinner</span>
          <span className="text-4xl font-bold text-primary">{winner?.name}</span>
        </div>
        <button
          onClick={handleExit}
          className="w-full py-4 rounded-xl bg-action text-primary font-bold text-xl"
        >
          Neues Spiel
        </button>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="flex flex-col h-full bg-base p-3 gap-3">
      {/* Top bar: exit + player info */}
      <div className="flex items-start gap-3">
        <button
          onClick={handleExit}
          className="shrink-0 bg-surface border border-accent rounded-lg px-3 py-2 text-muted text-sm"
        >
          ← Exit
        </button>
        <div className="flex-1 flex flex-col items-center bg-surface border border-accent rounded-xl p-3 gap-2">
          <span className="text-muted text-sm">{currentPlayer.name}</span>
          <span className="text-5xl font-bold text-primary tabular-nums">
            {currentPlayer.score}
          </span>
          <ThrowSlots throws={gameState.currentTurn.throws} />
        </div>
      </div>

      {/* Dart input */}
      <div className="flex-1 flex flex-col justify-end">
        <DartInput
          multiplier={multiplier}
          onMultiplierChange={setMultiplier}
          onThrow={handleThrow}
          onUndo={handleUndo}
        />
      </div>
    </div>
  );
}
