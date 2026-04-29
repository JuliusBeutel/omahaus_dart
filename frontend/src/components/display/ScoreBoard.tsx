import type { Player } from '../../types/game';

interface Props {
  players: Player[];
  currentPlayerIndex: number;
  isPlaying: boolean;
}

export function ScoreBoard({ players, currentPlayerIndex, isPlaying }: Props) {
  if (players.length === 0) {
    return <p style={styles.empty}>Warte auf Spieler...</p>;
  }

  return (
    <div style={styles.grid}>
      {players.map((player, i) => {
        const isActive = isPlaying && i === currentPlayerIndex;
        return (
          <div key={player.id} style={{ ...styles.card, ...(isActive ? styles.active : {}) }}>
            <div style={styles.name}>{player.name}</div>
            <div style={styles.score}>{player.score}</div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  grid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    flex: '1 1 180px',
    maxWidth: '240px',
    background: '#162e0f',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center' as const,
    border: '3px solid transparent',
    transition: 'border-color 0.2s',
  },
  active: {
    borderColor: '#5a9050',
  },
  name: {
    fontSize: '1.2rem',
    color: '#aeaeae',
    marginBottom: '8px',
  },
  score: {
    fontSize: '3.5rem',
    fontWeight: 'bold' as const,
    letterSpacing: '-2px',
    color: '#d3e8cb',
  },
  empty: {
    color: '#aeaeae',
    fontSize: '1.4rem',
  },
};
