import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { SetupScreen } from '../components/controller/SetupScreen';
import { DartInput } from '../components/controller/DartInput';
import { GameControls } from '../components/controller/GameControls';
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
      <div style={styles.center}>
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
  const canUndo = state.currentTurn.throws.length > 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.playerName}>{currentPlayer?.name}</span>
        <span style={styles.playerScore}>{currentPlayer?.score}</span>
      </div>
      <DartInput sessionId={id} />
      <GameControls sessionId={id} canUndo={canUndo} />
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    paddingBottom: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 16px 8px',
    maxWidth: '480px',
    margin: '0 auto',
    width: '100%',
  },
  playerName: { fontSize: '1.4rem', fontWeight: 'bold' as const, color: '#e94560' },
  playerScore: { fontSize: '2.2rem', fontWeight: 'bold' as const },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
  },
  info: { color: '#aaa', fontSize: '1.2rem' },
  finishBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center' as const,
  },
  finishLabel: { fontSize: '1.1rem', color: '#aaa' },
  finishWinner: { fontSize: '2rem', fontWeight: 'bold' as const, color: '#e94560' },
  resetBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
