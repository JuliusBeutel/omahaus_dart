import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { GameState, GameStatus, Multiplier } from "../types/game";
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
  postPlug,
  postJoin,
  parseApiError,
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
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(0);
  const gameStatusRef = useRef<GameStatus | null>(null);
  // Refs mirror the matching state so handleThrow/handleUndo always read
  // the latest value even when called before React has re-rendered.
  const gameStateRef = useRef<GameState | null>(null);
  const multiplierRef = useRef<Multiplier>(1);
  // Promise chain — serialises throw/undo requests so they reach the server in order
  const throwChainRef = useRef<Promise<void>>(Promise.resolve());

  function applyState(s: GameState) {
    gameStateRef.current = s;
    gameStatusRef.current = s.status;
    setGameState(s);
  }

  function applyMultiplier(m: Multiplier) {
    multiplierRef.current = m;
    setMultiplier(m);
  }

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (pendingRef.current > 0) return;
      try {
        const data = await getSession(id!);
        // Re-check after the async fetch — a mutation may have started while we were waiting
        if (!active || pendingRef.current > 0) return;
        if (Date.now() - data.lastActivity > SESSION_TIMEOUT_MS) {
          active = false;
          postPlug(id!, false).catch(() => {});
          navigate("/scan", { replace: true });
          return;
        }
        if (gameStatusRef.current !== 'playing') {
          applyState(data);
        }
      } catch {
        // ignore transient poll errors
      }
    }

    postJoin(id!).catch(() => {});
    postPlug(id!, true).catch(() => {});
    poll();
    const interval = setInterval(poll, 800);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  function handleThrow(value: number) {
    const current = gameStateRef.current;
    if (!current || current.status !== "playing") return;
    const usedMultiplier = multiplierRef.current;
    applyState(localProcessThrow(current, value, usedMultiplier));
    applyMultiplier(1);
    throwChainRef.current = throwChainRef.current.then(async () => {
      try {
        await postThrow(id!, value, usedMultiplier);
      } catch (err) {
        setError(parseApiError(err));
        try { applyState(await getSession(id!)); } catch { /* ignore */ }
      }
    });
  }

  function handleUndo() {
    const current = gameStateRef.current;
    if (!current) return;
    const prevState = current;
    applyState(localUndo(current));
    throwChainRef.current = throwChainRef.current.then(async () => {
      try {
        await postUndo(id!);
      } catch (err) {
        applyState(prevState);
        setError(parseApiError(err));
      }
    });
  }

  async function handleExit() {
    if (!id) return;
    pendingRef.current++;
    try {
      const newState = await postReset(id);
      applyState(newState);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      pendingRef.current--;
    }
  }

  async function handleEndSession() {
    if (!id) return;
    postPlug(id, false).catch(() => {});
    try {
      await deleteSession(id);
    } catch {
      /* ignore */
    }
    navigate("/scan", { replace: true });
  }

  function renderContent() {
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
          onMutationStart={() => { pendingRef.current++; }}
          onMutationEnd={() => { pendingRef.current--; }}
          onError={setError}
        />
      );
    }

    if (gameState.status === "finished") {
      const winner = gameState.players.find((p) => p.id === gameState.winnerId);
      return (
        <>
          <div className="flex flex-col items-center justify-center h-full bg-base gap-4 p-6">
            <div className="flex flex-col items-center gap-4 bg-surface rounded-2xl px-8 py-8 w-full">
              <span className="text-muted">Gewinner</span>
              <span className="text-4xl font-bold text-primary">
                {winner?.name}
              </span>
            </div>
            <button
              onClick={handleExit}
              className="w-full py-4 mt-10 rounded-xl bg-action text-primary font-bold text-xl"
            >
              Neues Spiel
            </button>
            <button
              onClick={() => setShowEndSessionDialog(true)}
              className="w-full py-4 rounded-xl bg-overlay text-muted font-bold text-xl"
            >
              Session beenden
            </button>
          </div>

          {showEndSessionDialog && (
            <div className="fixed inset-0 bg-base/80 z-50 flex items-center justify-center p-6">
              <div className="bg-surface border border-accent rounded-2xl p-8 flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-1">
                  <span className="text-primary text-xl font-bold">
                    Session beenden?
                  </span>
                  <span className="text-muted text-sm">
                    Die Session wird gelöscht und du kommst zurück zum Scannen.
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleEndSession}
                    className="py-4 rounded-xl bg-danger text-primary font-bold text-lg active:opacity-80"
                  >
                    Ja
                  </button>
                  <button
                    onClick={() => setShowEndSessionDialog(false)}
                    className="py-4 rounded-xl bg-overlay text-muted font-bold text-lg active:bg-accent"
                  >
                    Nein
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    return (
      <div className="flex flex-col h-full bg-base p-3 gap-3">
        <div className="relative flex flex-col items-center bg-surface rounded-xl p-3 py-8 gap-2">
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

        <div className="flex-1 flex flex-col justify-end">
          <DartInput
            multiplier={multiplier}
            onMultiplierChange={applyMultiplier}
            onThrow={handleThrow}
            onUndo={handleUndo}
          />
        </div>

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

  return (
    <>
      {renderContent()}
      {error && (
        <div className="fixed bottom-6 left-4 right-4 z-50 bg-danger rounded-xl px-5 py-4 flex items-start gap-3 shadow-lg">
          <span className="text-primary text-sm font-medium flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-primary/70 font-bold text-xl leading-none mt-[-2px]"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
