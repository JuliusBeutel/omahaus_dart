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

    if (!hasPlayers) {
      setLoading(false);
      return;
    }

    await api.startGame(sessionId);
    setLoading(false);
  }

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Spiel einrichten</h1>

      <div style={styles.section}>
        <label style={styles.label}>Spielmodus</label>
        <div style={styles.modeRow}>
          {([301, 501] as GameMode[]).map((m) => (
            <button
              key={m}
              style={{ ...styles.modeBtn, ...(state.mode === m ? styles.modeBtnActive : {}) }}
              onClick={() => handleModeChange(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Spieler ({state.players.length}/4)</label>
        <ul style={styles.playerList}>
          {state.players.map((p) => (
            <li key={p.id} style={styles.playerItem}>
              <span>{p.name}</span>
              <button style={styles.removeBtn} onClick={() => handleRemovePlayer(p.id)}>✕</button>
            </li>
          ))}
        </ul>
        {state.players.length < 4 && (
          <form
            style={styles.addRow}
            onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }}
          >
            <input
              style={styles.input}
              placeholder="Name eingeben"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button type="submit" style={styles.addBtn}>+</button>
          </form>
        )}
      </div>

      <button
        style={{ ...styles.startBtn, ...(state.players.length === 0 || loading ? styles.startBtnDisabled : {}) }}
        onClick={handleStart}
        disabled={state.players.length === 0 || loading}
      >
        {loading ? 'Starte...' : 'Spiel starten'}
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    padding: '24px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  title: { fontSize: '1.6rem', textAlign: 'center' as const },
  section: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  label: { fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  modeRow: { display: 'flex', gap: '12px' },
  modeBtn: {
    flex: 1,
    padding: '14px',
    fontSize: '1.2rem',
    background: '#16213e',
    color: '#eaeaea',
    border: '2px solid transparent',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  modeBtnActive: { borderColor: '#e94560', color: '#e94560' },
  playerList: { listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  playerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#16213e',
    borderRadius: '10px',
    fontSize: '1.1rem',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#e94560',
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  addRow: { display: 'flex', gap: '8px' },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '1rem',
    background: '#16213e',
    color: '#eaeaea',
    border: '2px solid #0f3460',
    borderRadius: '10px',
    outline: 'none',
  },
  addBtn: {
    padding: '12px 20px',
    fontSize: '1.4rem',
    background: '#0f3460',
    color: '#eaeaea',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  startBtn: {
    padding: '18px',
    fontSize: '1.2rem',
    fontWeight: 'bold' as const,
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  startBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
};
