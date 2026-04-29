import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { ScoreBoard } from '../components/display/ScoreBoard';
import { CurrentThrows } from '../components/display/CurrentThrows';
import { QRCodeDisplay } from '../components/display/QRCodeDisplay';

export function DisplayPage() {
  const { id } = useParams<{ id: string }>();
  const state = useGameState(id ?? null);

  if (!id) return null;

  if (!state) {
    return (
      <div style={styles.center}>
        <p style={styles.connecting}>Verbinde...</p>
      </div>
    );
  }

  if (state.status === 'finished') {
    const winner = state.players.find((p) => p.id === state.winnerId);
    const avg = winner && winner.dartsThrown > 0
      ? ((state.mode - winner.score) / winner.dartsThrown * 3).toFixed(1)
      : '—';

    return (
      <div style={styles.center}>
        <div style={styles.winnerBox}>
          <div style={styles.winnerLabel}>Gewinner</div>
          <div style={styles.winnerName}>{winner?.name ?? '?'}</div>
          <div style={styles.avg}>Ø {avg} pro Runde</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <QRCodeDisplay sessionId={id} />
        {state.status === 'playing' && (
          <CurrentThrows
            throws={state.currentTurn.throws}
            currentPlayerName={state.players[state.currentPlayerIndex]?.name ?? ''}
          />
        )}
      </div>
      <div style={styles.right}>
        <ScoreBoard
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
          isPlaying={state.status === 'playing'}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    gap: '40px',
    padding: '40px',
    minHeight: '100vh',
    alignItems: 'flex-start',
    background: '#1a1a2e',
    color: '#eaeaea',
  },
  left: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
    flexShrink: 0,
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#1a1a2e',
    color: '#eaeaea',
  },
  connecting: { color: '#aaa', fontSize: '1.4rem' },
  winnerBox: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  winnerLabel: { fontSize: '1.4rem', color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  winnerName: { fontSize: '5rem', fontWeight: 'bold' as const, color: '#e94560' },
  avg: { fontSize: '1.6rem', color: '#eaeaea' },
};
