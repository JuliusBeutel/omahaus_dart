import { useParams } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { ScoreBoard } from '../components/display/ScoreBoard';
import { QRCodeDisplay } from '../components/display/QRCodeDisplay';
import { PlayerCard } from '../components/display/PlayerCard';

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

  if (state.status === 'playing') {
    const cols = state.players.length === 4 ? 2 : state.players.length;
    return (
      <div style={{ ...styles.matchGrid, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {state.players.map((player, i) => (
          <PlayerCard
            key={player.id}
            player={player}
            isActive={i === state.currentPlayerIndex}
            throws={i === state.currentPlayerIndex ? state.currentTurn.throws : []}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <QRCodeDisplay sessionId={id} />
      </div>
      <div style={styles.right}>
        <ScoreBoard
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
          isPlaying={false}
        />
      </div>
    </div>
  );
}

const styles = {
  matchGrid: {
    display: 'grid',
    gap: 0,
    padding: 0,
    height: '100vh',
    background: '#0c1a08',
    alignItems: 'stretch',
  },
  page: {
    display: 'flex',
    gap: '40px',
    padding: '40px',
    minHeight: '100vh',
    alignItems: 'flex-start',
    background: '#0c1a08',
    color: '#d3e8cb',
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
    background: '#0c1a08',
    color: '#d3e8cb',
  },
  connecting: { color: '#aeaeae', fontSize: '1.4rem' },
  winnerBox: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  winnerLabel: { fontSize: '1.4rem', color: '#aeaeae', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  winnerName: { fontSize: '5rem', fontWeight: 'bold' as const, color: '#d3e8cb' },
  avg: { fontSize: '1.6rem', color: '#d3e8cb' },
};
