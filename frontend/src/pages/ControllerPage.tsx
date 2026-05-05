import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { GameState, Multiplier } from "../types/game";
import {
  processThrow as localProcessThrow,
  undoLastThrow as localUndo,
} from "../../lib/gameLogic";
import {
  getSession,
  postThrow,
  postUndo,
  postReset,
  deleteSession,
} from "../api/client";
import SetupScreen from "../components/controller/SetupScreen";
import DartInput from "../components/controller/DartInput";
import ThrowSlots from "../components/shared/ThrowSlots";

const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

export default function ControllerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [multiplier, setMultiplier] = useState<Multiplier>(1);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (pendingRef.current) return;
      try {
        const data = await getSession(id!);
        if (!active) return;
        if (Date.now() - data.lastActivity > SESSION_TIMEOUT_MS) {
          active = false;
          navigate("/scan", { replace: true });
          return;
        }
        setGameState(data);
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
    if (!gameState || gameState.status !== "playing") return;
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
    } catch {
      /* ignore */
    }
    navigate("/scan", { replace: true });
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full bg-base">
        <span className="text-muted">Lade...</span>
      </div>
    );
  }

  if (gameState.status === "setup") {
    return (
      <SetupScreen
        state={gameState}
        onStateChange={setGameState}
        onEndSession={handleEndSession}
      />
    );
  }

  if (gameState.status === "finished") {
    const winner = gameState.players.find((p) => p.id === gameState.winnerId);
    return (
      <div className="flex flex-col items-center justify-center h-full bg-base gap-8 p-6">
        <div className="flex flex-col items-center gap-4 bg-surface border border-accent rounded-2xl px-8 py-8 w-full">
          <span className="text-muted">Gewinner</span>
          <span className="text-4xl font-bold text-primary">
            {winner?.name}
          </span>
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
      {/* Player info — full width, exit button inside top-left */}
      <div className="relative flex flex-col items-center bg-surface  rounded-xl p-3 py-8 gap-2">
        <button
          onClick={() => setShowExitDialog(true)}
          className="absolute top-3 left-3 text-muted active:text-primary"
          aria-label="Spiel beenden"
        >
          <svg
            viewBox="0 0 512 512"
            className="w-7 h-7 rotate-180"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
          >
            <path d="M320,176V136a40,40,0,0,0-40-40H88a40,40,0,0,0-40,40V376a40,40,0,0,0,40,40H280a40,40,0,0,0,40-40V336" />
            <polyline points="384 176 464 256 384 336" />
            <line x1="191" y1="256" x2="464" y2="256" />
          </svg>
        </button>
        <span className="text-muted text-3xl">{currentPlayer.name}</span>
        <span className="text-7xl font-bold text-primary tabular-nums">
          {currentPlayer.score}
        </span>
        <ThrowSlots throws={gameState.currentTurn.throws} />
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

      {/* Exit confirmation dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-base/80 z-50 flex items-center justify-center p-6">
          <div className="bg-surface border border-accent rounded-2xl p-8 flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-1">
              <span className="text-primary text-xl font-bold">
                Spiel beenden?
              </span>
              <span className="text-muted text-sm">
                Der aktuelle Spielstand geht verloren.
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  setShowExitDialog(false);
                  await handleExit();
                }}
                className="py-4 rounded-xl bg-danger text-primary font-bold text-lg active:opacity-80"
              >
                Beenden
              </button>
              <button
                onClick={() => setShowExitDialog(false)}
                className="py-4 rounded-xl bg-overlay text-muted font-bold text-lg active:bg-accent"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
