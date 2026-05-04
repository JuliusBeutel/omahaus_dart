import { useState, useRef } from 'react';
import type { GameState, GameMode } from '../../types/game';
import { patchMode, postPlayer, deletePlayer, postStart, postReorder } from '../../api/client';

interface SetupScreenProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
  onEndSession?: () => void;
}

export default function SetupScreen({ state, onStateChange, onEndSession }: SetupScreenProps) {
  const [nameInput, setNameInput] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragIndexRef = useRef<number | null>(null);
  const dragOrderRef = useRef<GameState['players']>([]);

  const sessionId = state.sessionId;

  async function handleModeToggle(mode: GameMode) {
    const newState = await patchMode(sessionId, mode);
    onStateChange(newState);
  }

  async function handleAddPlayer() {
    const name = nameInput.trim();
    if (!name || state.players.length >= 4) return;
    const newState = await postPlayer(sessionId, name);
    onStateChange(newState);
    setNameInput('');
    inputRef.current?.focus();
  }

  async function handleRemovePlayer(playerId: string) {
    const newState = await deletePlayer(sessionId, playerId);
    onStateChange(newState);
  }

  async function handleStart() {
    let s = state;
    if (nameInput.trim() && state.players.length < 4) {
      s = await postPlayer(sessionId, nameInput.trim());
      setNameInput('');
    }
    if (s.players.length < 1) return;
    const newState = await postStart(sessionId);
    onStateChange(newState);
  }

  function handleTouchStart(i: number) {
    dragIndexRef.current = i;
    dragOrderRef.current = [...state.players];
    setDragIndex(i);
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (dragIndexRef.current === null) return;
    const touch = e.touches[0];
    let targetIndex = -1;
    rowRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        targetIndex = idx;
      }
    });
    if (targetIndex === -1 || targetIndex === dragIndexRef.current) return;
    const reordered = [...dragOrderRef.current];
    const [moved] = reordered.splice(dragIndexRef.current, 1);
    reordered.splice(targetIndex, 0, moved);
    dragOrderRef.current = reordered;
    dragIndexRef.current = targetIndex;
    setDragIndex(targetIndex);
    onStateChange({ ...state, players: reordered });
  }

  async function handleTouchEnd() {
    if (dragIndexRef.current === null) return;
    const finalOrder = [...dragOrderRef.current];
    dragIndexRef.current = null;
    dragOrderRef.current = [];
    setDragIndex(null);
    await postReorder(sessionId, finalOrder.map((p) => p.id));
  }

  return (
    <div className="flex flex-col h-full bg-base p-4 gap-4">
      <div className="relative flex items-center justify-center">
        <button
          onClick={onEndSession}
          className="absolute left-0 bg-surface border border-accent rounded-lg px-3 py-1.5 text-muted text-sm"
        >
          ✕
        </button>
        <h1 className="text-xl font-bold text-primary">Omahaus Dart-Zähler</h1>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        {([301, 501] as GameMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeToggle(m)}
            className={`flex-1 py-3 rounded-lg font-bold text-lg border transition-colors ${
              state.mode === m
                ? 'bg-accent border-accent text-primary'
                : 'bg-overlay border-overlay text-muted'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-2 flex-1">
        {state.players.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => { rowRefs.current[i] = el; }}
            onTouchStart={() => handleTouchStart(i)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`flex items-center gap-3 bg-surface border border-accent rounded-lg px-3 py-2 cursor-grab touch-none select-none transition-opacity ${dragIndex === i ? 'opacity-40' : 'opacity-100'}`}
          >
            <span className="text-muted text-sm select-none">☰</span>
            <span className="text-primary flex-1">{p.name}</span>
            <button
              onClick={() => handleRemovePlayer(p.id)}
              className="text-danger font-bold px-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add player input */}
      {state.players.length < 4 && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            placeholder="Spielername..."
            className="flex-1 bg-surface border border-accent rounded-lg px-3 py-2 text-primary placeholder:text-muted outline-none focus:border-primary"
          />
          <button
            onClick={handleAddPlayer}
            disabled={!nameInput.trim()}
            className="bg-overlay border border-accent rounded-lg px-4 py-2 text-primary disabled:opacity-40"
          >
            +
          </button>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={state.players.length < 1 && !nameInput.trim()}
        className="w-full py-4 rounded-xl bg-action text-primary font-bold text-xl disabled:opacity-40"
      >
        Spiel starten
      </button>
    </div>
  );
}
