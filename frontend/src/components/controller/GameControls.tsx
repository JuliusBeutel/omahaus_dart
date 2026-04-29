import * as api from '../../api/client';

interface Props {
  sessionId: string;
  canUndo: boolean;
}

export function GameControls({ sessionId, canUndo }: Props) {
  return (
    <div style={styles.row}>
      <button
        style={{ ...styles.btn, ...styles.undo, ...(!canUndo ? styles.disabled : {}) }}
        onClick={() => api.undoThrow(sessionId)}
        disabled={!canUndo}
      >
        ↩ Undo
      </button>
      <button
        style={{ ...styles.btn, ...styles.reset }}
        onClick={() => {
          if (confirm('Spiel wirklich zurücksetzen?')) api.resetGame(sessionId);
        }}
      >
        Reset
      </button>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    gap: '12px',
    padding: '0 16px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  btn: {
    flex: 1,
    padding: '14px',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  undo: { background: '#0f3460', color: '#eaeaea' },
  reset: { background: '#16213e', color: '#e94560', border: '2px solid #e94560' },
  disabled: { opacity: 0.3, cursor: 'not-allowed' },
};
