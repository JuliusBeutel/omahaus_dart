import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { SetupScreen } from '../components/controller/SetupScreen';
import { DartInput } from '../components/controller/DartInput';
import * as api from '../api/client';

export function ControllerPage() {
  const { id } = useParams<{ id: string }>();
  const state = useGameState(id ?? null);

  if (!id) return null;

  if (!state) {
    return (
      <div style={styles.center}>
        <p style={styles.info}>Verbinde mit Session {id}...</p>
      </div>
    );
  }

  if (state.status === 'setup') {
    return <SetupScreen sessionId={id} state={state} />;
  }

  if (state.status === 'finished') {
    const winner = state.players.find((p) => p.id === state.winnerId);
    return (
      <div style={{ ...styles.center, background: '#f5f7ff', minHeight: '100vh' }}>
        <div style={styles.finishBox}>
          <p style={styles.finishLabel}>Spiel beendet</p>
          <p style={styles.finishWinner}>{winner?.name} gewinnt!</p>
          <button style={styles.resetBtn} onClick={() => api.resetGame(id)}>
            Neues Spiel
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <div style={styles.page}>
      <div style={styles.scoreCard}>
        <p style={styles.playerName}>{currentPlayer?.name}</p>
        <p style={styles.score}>{currentPlayer?.score}</p>
        <div style={styles.throwSlots}>
          {[0, 1, 2].map((i) => {
            const t = state.currentTurn.throws[i];
            return (
              <div key={i} style={styles.slot}>
                {t ? (
                  <span style={styles.slotValue}>{throwLabel(t)}</span>
                ) : (
                  <DartIcon />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <DartInput
        sessionId={id}
        canUndo={state.currentTurn.throws.length > 0}
      />
    </div>
  );
}

function throwLabel(t: { value: number; multiplier: number }): string {
  const prefix = t.multiplier === 2 ? 'D' : t.multiplier === 3 ? 'T' : '';
  const field = t.value === 25 ? 'Bull' : String(t.value);
  return `${prefix}${field}`;
}

function DartIcon() {
  return (
    <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
      <polygon points="9,0 13,9 5,9" fill="#c8d6e8" />
      <rect x="8" y="9" width="2" height="14" rx="1" fill="#c8d6e8" />
      <rect x="6" y="22" width="6" height="2" rx="1" fill="#c8d6e8" />
      <rect x="7" y="24" width="4" height="2" rx="1" fill="#c8d6e8" />
    </svg>
  );
}

const styles = {
  page: {
    background: '#f5f7ff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  scoreCard: {
    background: '#fff',
    textAlign: 'center' as const,
    padding: '24px 16px 20px',
    borderBottom: '1px solid #e8edf5',
  },
  playerName: {
    fontSize: '1.1rem',
    color: '#4f86f7',
    fontWeight: '600' as const,
    margin: 0,
    marginBottom: '4px',
  },
  score: {
    fontSize: '4rem',
    fontWeight: 'bold' as const,
    color: '#1e2d4a',
    margin: 0,
    lineHeight: 1.1,
  },
  throwSlots: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '16px',
  },
  slot: {
    width: '72px',
    height: '44px',
    background: '#f0f4ff',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotValue: {
    fontSize: '1.1rem',
    fontWeight: '700' as const,
    color: '#1e2d4a',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  info: { color: '#8896a9', fontSize: '1.1rem' },
  finishBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center' as const,
  },
  finishLabel: { fontSize: '1rem', color: '#8896a9' },
  finishWinner: { fontSize: '2rem', fontWeight: 'bold' as const, color: '#4f86f7' },
  resetBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    background: '#4f86f7',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
  },
};
