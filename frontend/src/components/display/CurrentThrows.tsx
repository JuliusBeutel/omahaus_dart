import type { DartThrow } from '../../types/game';

interface Props {
  throws: DartThrow[];
  currentPlayerName: string;
}

function throwLabel(t: DartThrow): string {
  const prefix = t.multiplier === 2 ? 'D' : t.multiplier === 3 ? 'T' : '';
  const field = t.value === 25 ? 'Bull' : String(t.value);
  return `${prefix}${field}`;
}

export function CurrentThrows({ throws, currentPlayerName }: Props) {
  const slots = [0, 1, 2].map((i) => throws[i]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.playerName}>{currentPlayerName}</div>
      <div style={styles.throws}>
        {slots.map((t, i) => (
          <div key={i} style={{ ...styles.slot, ...(t ? styles.filled : {}) }}>
            {t ? throwLabel(t) : '—'}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    textAlign: 'center' as const,
  },
  playerName: {
    fontSize: '1.4rem',
    color: '#e94560',
    marginBottom: '12px',
    fontWeight: 'bold' as const,
  },
  throws: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  slot: {
    width: '90px',
    height: '90px',
    background: '#16213e',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    color: '#555',
    fontWeight: 'bold' as const,
  },
  filled: {
    color: '#eaeaea',
    background: '#0f3460',
  },
};
