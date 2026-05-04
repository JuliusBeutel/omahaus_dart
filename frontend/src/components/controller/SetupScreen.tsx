import { useState, useRef } from "react";
import type { GameState, GameMode } from "../../types/game";
import {
  patchMode,
  postPlayer,
  deletePlayer,
  postStart,
  postReorder,
} from "../../api/client";

interface SetupScreenProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
  onEndSession?: () => void;
}

interface DragState {
  index: number;
  startTouchY: number;
  itemHeight: number;
  deltaY: number;
  targetIndex: number;
  releasing: boolean;
}

const GAP = 8;

export default function SetupScreen({
  state,
  onStateChange,
  onEndSession,
}: SetupScreenProps) {
  const [nameInput, setNameInput] = useState("");
  const [drag, setDrag] = useState<DragState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const releaseCommitRef = useRef<(() => void) | null>(null);

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
    setNameInput("");
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
      setNameInput("");
    }
    if (s.players.length < 1) return;
    const newState = await postStart(sessionId);
    onStateChange(newState);
  }

  function handleTouchStart(i: number, e: React.TouchEvent) {
    const ref = rowRefs.current[i];
    if (!ref) return;
    setDrag({
      index: i,
      startTouchY: e.touches[0].clientY,
      itemHeight: ref.getBoundingClientRect().height,
      deltaY: 0,
      targetIndex: i,
      releasing: false,
    });
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (!drag || drag.releasing) return;
    const deltaY = e.touches[0].clientY - drag.startTouchY;
    const step = drag.itemHeight + GAP;
    const targetIndex = Math.max(
      0,
      Math.min(
        state.players.length - 1,
        Math.round(drag.index + deltaY / step),
      ),
    );
    setDrag({ ...drag, deltaY, targetIndex });
  }

  function handleTouchEnd() {
    if (!drag || drag.releasing) return;
    const { index, targetIndex, itemHeight } = drag;
    const step = itemHeight + GAP;
    const finalDeltaY = (targetIndex - index) * step;

    const reordered = [...state.players];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const commit = () => {
      if (!releaseCommitRef.current) return;
      releaseCommitRef.current = null;
      setDrag(null);
      if (index !== targetIndex) {
        onStateChange({ ...state, players: reordered });
        postReorder(
          sessionId,
          reordered.map((p) => p.id),
        );
      }
    };
    releaseCommitRef.current = commit;

    setDrag({ ...drag, deltaY: finalDeltaY, releasing: true });
    setTimeout(commit, 600);
  }

  function getTransform(i: number): string {
    if (!drag) return "translateY(0px)";
    const step = drag.itemHeight + GAP;
    if (i === drag.index) {
      const min = -drag.index * step;
      const max = (state.players.length - 1 - drag.index) * step;
      return `translateY(${Math.max(min, Math.min(max, drag.deltaY))}px)`;
    }
    const { index: from, targetIndex: to } = drag;
    if (from < to && i > from && i <= to) return `translateY(-${step}px)`;
    if (from > to && i >= to && i < from) return `translateY(${step}px)`;
    return "translateY(0px)";
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
                ? "bg-accent border-accent text-primary"
                : "bg-surface border-surface text-muted"
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
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            onTouchStart={(e) => handleTouchStart(i, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTransitionEnd={
              drag?.index === i && drag.releasing
                ? () => releaseCommitRef.current?.()
                : undefined
            }
            style={{
              transform: getTransform(i),
              transition: !drag
                ? "none"
                : drag.index === i
                  ? drag.releasing
                    ? "transform 500ms ease"
                    : "none"
                  : drag.releasing
                    ? "none"
                    : "transform 500ms ease",
              zIndex: drag?.index === i ? 10 : 1,
              position: "relative",
            }}
            className={`flex items-center gap-3 bg-surface rounded-lg px-3 py-4 touch-none select-none ${
              drag?.index === i ? "opacity-50 cursor-grabbing" : "cursor-grab"
            }`}
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
            onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
            placeholder="Spielername..."
            className="flex-1 bg-surface rounded-lg px-3 py-4 text-primary placeholder:text-muted outline-none focus:border-primary"
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
