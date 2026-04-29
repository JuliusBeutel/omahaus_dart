import { useState } from "react";
import type { GameMode, GameState } from "../../types/game";
import * as api from "../../api/client";

interface Props {
  sessionId: string;
  state: GameState;
}

export function SetupScreen({ sessionId, state }: Props) {
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddPlayer() {
    const name = nameInput.trim();
    if (!name || state.players.length >= 4) return;
    await api.addPlayer(sessionId, name);
    setNameInput("");
  }

  async function handleRemovePlayer(playerId: string) {
    await api.removePlayer(sessionId, playerId);
  }

  async function handleModeChange(mode: GameMode) {
    await api.setMode(sessionId, mode);
  }

  async function handleStart() {
    setLoading(true);
    const pendingName = nameInput.trim();
    let hasPlayers = state.players.length > 0;

    if (pendingName && state.players.length < 4) {
      await api.addPlayer(sessionId, pendingName);
      setNameInput("");
      hasPlayers = true;
    }

    if (!hasPlayers) {
      setLoading(false);
      return;
    }

    await api.startGame(sessionId);
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 pt-6 pb-28">
      {/* HEADER */}
      <h1 className="text-2xl text-center text-primary font-medium opacity-80 mb-4">
        Spiel einrichten
      </h1>

      {/* GAME MODE */}
      <div className="mb-6">
        <div className="bg-surface rounded-2xl p-1 flex shadow-sm">
          {[301, 501].map((m) => {
            const active = state.mode === m;

            return (
              <button
                key={m}
                onClick={() => handleModeChange(m as GameMode)}
                className={`
                  flex-1 py-4 rounded-xl text-lg font-medium transition-all
                  ${active ? "bg-accent text-white shadow" : "text-muted"}
                `}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* PLAYERS */}
      <div className="flex flex-col gap-3 flex-1">
        {/* PLAYER COUNT */}
        <span className="text-sm text-muted uppercase tracking-wider">
          Spieler ({state.players.length}/4)
        </span>

        {/* PLAYER CARDS */}
        <div className="flex flex-col gap-3">
          {state.players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-5 rounded-2xl bg-surface shadow-md"
            >
              <span className="text-xl font-medium text-primary">{p.name}</span>

              <button
                onClick={() => handleRemovePlayer(p.id)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ADD PLAYER */}
        {state.players.length < 4 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddPlayer();
            }}
            className="flex gap-3 mt-2"
          >
            <input
              className="flex-1 px-5 py-5 rounded-2xl bg-surface text-lg text-primary outline-none focus:ring-2 focus:ring-accent"
              placeholder="Neuer Spieler"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
            />

            <button
              type="submit"
              className="w-16 rounded-2xl bg-accent text-white text-2xl shadow-lg flex items-center justify-center"
            >
              +
            </button>
          </form>
        )}
      </div>

      {/* START BUTTON (STICKY) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
        <button
          onClick={handleStart}
          disabled={state.players.length === 0 || loading}
          className={`
            w-full py-6 rounded-2xl text-xl font-semibold transition-all
            ${
              state.players.length === 0 || loading
                ? "bg-overlay text-muted"
                : "bg-accent text-white shadow-xl active:scale-[0.98]"
            }
          `}
        >
          {loading ? "Starte..." : "Spiel starten"}
        </button>
      </div>
    </div>
  );
}
