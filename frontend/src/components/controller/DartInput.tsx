import { useState } from 'react';
import type { Multiplier } from '../../types/game';
import * as api from '../../api/client';

interface Props {
  sessionId: string;
  canUndo: boolean;
}

const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

export function DartInput({ sessionId, canUndo }: Props) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1);
  const [pending, setPending] = useState(false);

  async function handleThrow(value: number) {
    if (pending) return;
    setPending(true);
    await api.throwDart(sessionId, value, multiplier);
    setMultiplier(1);
    setPending(false);
  }

  function toggleMultiplier(m: 2 | 3) {
    setMultiplier((prev) => (prev === m ? 1 : m));
  }

  function Dots({ count }: { count: number }) {
    return (
      <div style={dotRow}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={dot} />
        ))}
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.toggleRow}>
        {([2, 3] as const).map((m) => (
          <button
            key={m}
            style={{ ...styles.toggleBtn, ...(multiplier === m ? styles.toggleActive : {}) }}
            onClick={() => toggleMultiplier(m)}
          >
            {m === 2 ? 'Double' : 'Triple'}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {NUMBERS.map((n) => (
          <button
            key={n}
            style={{ ...styles.numBtn, ...(pending ? styles.dimmed : {}) }}
            onClick={() => handleThrow(n)}
            disabled={pending}
          >
            <span style={styles.numText}>{n}</span>
            {multiplier > 1 && <Dots count={multiplier} />}
          </button>
        ))}

        <button
          style={{ ...styles.numBtn, ...(pending ? styles.dimmed : {}) }}
          onClick={() => handleThrow(0)}
          disabled={pending}
        >
          <span style={styles.numText}>0</span>
          {multiplier > 1 && <Dots count={multiplier} />}
        </button>

        <button
          style={{ ...styles.numBtn, ...(pending ? styles.dimmed : {}) }}
          onClick={() => handleThrow(25)}
          disabled={pending}
        >
          <span style={styles.numText}>25</span>
          {multiplier > 1 && <Dots count={multiplier} />}
        </button>

        <button
          style={{
            ...styles.numBtn,
            ...styles.undoBtn,
            gridColumn: 'span 2',
            ...(!canUndo ? styles.dimmed : {}),
          }}
          onClick={() => api.undoThrow(sessionId)}
          disabled={!canUndo}
        >
          <span style={styles.undoText}>zurück</span>
        </button>
      </div>
    </div>
  );
}

const dotRow: React.CSSProperties = {
  display: 'flex',
  gap: '3px',
  justifyContent: 'center',
  marginTop: '4px',
};

const dot: React.CSSProperties = {
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  background: '#4f86f7',
};

const styles = {
  wrapper: {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  toggleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  toggleBtn: {
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '600' as const,
    background: '#fff',
    color: '#8896a9',
    border: '1.5px solid #e2e8f5',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  toggleActive: {
    background: '#eef3ff',
    color: '#4f86f7',
    borderColor: '#4f86f7',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  numBtn: {
    padding: '14px 0',
    background: '#fff',
    border: '1.5px solid #e2e8f5',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '56px',
  },
  numText: {
    fontSize: '1.25rem',
    fontWeight: '600' as const,
    color: '#1e2d4a',
    lineHeight: 1,
  },
  undoBtn: {
    background: '#f5f7ff',
    borderColor: '#dde4f5',
  },
  undoText: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#8896a9',
  },
  dimmed: {
    opacity: 0.4,
  },
};
