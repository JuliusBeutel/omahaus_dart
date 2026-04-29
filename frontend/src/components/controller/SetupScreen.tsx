import { useState } from 'react';
import type { GameMode, GameState } from '../../types/game';
import * as api from '../../api/client';

interface Props {
  sessionId: string;
  state: GameState;
}

export function SetupScreen({ sessionId, state }: Props) {
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAddPlayer() {
    const name = nameInput.trim();
    if (!name || state.players.length >= 4) return;
    await api.addPlayer(sessionId, name);
    setNameInput('');
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
      setNameInput('');
      hasPlayers = true;
    }

    if (!hasPlayers) { setLoading(false); return; }

    await api.startGame(sessionId);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto">
      <h1 className="text-2xl text-center text-primary">Spiel einrichten</h1>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted uppercase tracking-widest">Spielmodus</label>
        <div className="flex gap-3">
          {([301, 501] as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 p-3 text-xl rounded-xl border-2 cursor-pointer ${
                state.mode === m
                  ? 'border-accent text-primary bg-surface'
                  : 'border-transparent text-muted bg-surface'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted uppercase tracking-widest">
          Spieler ({state.players.length}/4)
        </label>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex justify-between items-center px-4 py-3 bg-surface rounded-xl text-primary text-lg">
              <span>{p.name}</span>
              <button
                onClick={() => handleRemovePlayer(p.id)}
                className="text-danger text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        {state.players.length < 4 && (
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }}
          >
            <input
              className="flex-1 px-4 py-3 bg-surface text-primary border-2 border-overlay rounded-xl outline-none"
              placeholder="Name eingeben"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-3 bg-overlay text-primary rounded-xl text-2xl cursor-pointer"
            >
              +
            </button>
          </form>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={state.players.length === 0 || loading}
        className={`p-4 bg-action text-primary rounded-xl font-bold text-xl mt-2 cursor-pointer ${
          state.players.length === 0 || loading ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Starte...' : 'Spiel starten'}
      </button>
    </div>
  );
}
