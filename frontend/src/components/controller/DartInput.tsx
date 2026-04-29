import { useState } from 'react';
import type { Multiplier } from '../../types/game';
import * as api from '../../api/client';

interface Props {
  sessionId: string;
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function DartInput({ sessionId }: Props) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1);
  const [pending, setPending] = useState(false);

  async function handleThrow(value: number, overrideMultiplier?: Multiplier) {
    if (pending) return;
    const m = overrideMultiplier ?? multiplier;
    setPending(true);
    await api.throwDart(sessionId, value, m);
    setPending(false);
  }

  const multipliers: { label: string; value: Multiplier }[] = [
    { label: 'Single', value: 1 },
    { label: 'Double', value: 2 },
    { label: 'Triple', value: 3 },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.multiplierRow}>
        {multipliers.map((m) => (
          <button
            key={m.value}
            style={{ ...styles.multiplierBtn, ...(multiplier === m.value ? styles.multiplierActive : {}) }}
            onClick={() => setMultiplier(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {NUMBERS.map((n) => (
          <button
            key={n}
            style={styles.numBtn}
            onClick={() => handleThrow(n)}
            disabled={pending}
          >
            {n}
          </button>
        ))}
      </div>

      <div style={styles.bullRow}>
        <button
          style={{ ...styles.bullBtn }}
          onClick={() => handleThrow(25, 1)}
          disabled={pending}
        >
          Bull
          <span style={styles.bullSub}>25</span>
        </button>
        <button
          style={{ ...styles.bullBtn, ...styles.bullDouble }}
          onClick={() => handleThrow(25, 2)}
          disabled={pending}
        >
          Bull's Eye
          <span style={styles.bullSub}>50</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    padding: '16px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  multiplierRow: { display: 'flex', gap: '8px' },
  multiplierBtn: {
    flex: 1,
    padding: '12px',
    fontSize: '1rem',
    background: '#16213e',
    color: '#eaeaea',
    border: '2px solid transparent',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  multiplierActive: { borderColor: '#e94560', color: '#e94560' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  numBtn: {
    padding: '18px 0',
    fontSize: '1.3rem',
    fontWeight: 'bold' as const,
    background: '#0f3460',
    color: '#eaeaea',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'opacity 0.1s',
  },
  bullRow: { display: 'flex', gap: '8px' },
  bullBtn: {
    flex: 1,
    padding: '18px',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    background: '#0f3460',
    color: '#eaeaea',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  bullDouble: { background: '#16213e', border: '2px solid #0f3460' },
  bullSub: { fontSize: '0.85rem', color: '#aaa' },
};
