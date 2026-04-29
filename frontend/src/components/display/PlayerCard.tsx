import type { Player, DartThrow } from "../../types/game";

interface Props {
  player: Player;
  isActive: boolean;
  throws: DartThrow[];
}

function throwLabel(t: DartThrow): string {
  const prefix = t.multiplier === 2 ? "D" : t.multiplier === 3 ? "T" : "";
  const field = t.value === 25 ? "Bull" : String(t.value);
  return `${prefix}${field}`;
}

function DartIcon() {
  return (
    <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
      <polygon
        points="9,0 13,9 5,9"
        fill="#4a5568
"
      />
      <rect x="8" y="9" width="2" height="14" rx="1" fill="#4a5568" />
      <rect x="6" y="22" width="6" height="2" rx="1" fill="#4a5568" />
      <rect x="7" y="24" width="4" height="2" rx="1" fill="#4a5568" />
    </svg>
  );
}

export function PlayerCard({ player, isActive, throws }: Props) {
  return (
    <div style={{ ...styles.card, ...(isActive ? styles.cardActive : {}) }}>
      <div style={styles.name}>{player.name}</div>
      <div style={{ ...styles.score, ...(isActive ? styles.scoreActive : {}) }}>
        {player.score}
      </div>
      <div
        style={{ ...styles.slots, visibility: isActive ? "visible" : "hidden" }}
      >
        {[0, 1, 2].map((i) => {
          const t = throws[i];
          return (
            <div
              key={i}
              style={{ ...styles.slot, ...(t ? styles.slotFilled : {}) }}
            >
              {t ? (
                <span style={styles.slotLabel}>{throwLabel(t)}</span>
              ) : (
                <DartIcon />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#719066ff",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center" as const,
    gap: "20px",
    textAlign: "center" as const,
  },
  cardActive: {
    background: "#103a00ff",
  },
  name: {
    fontSize: "1.8rem",
    color: "#d3e8cbff",
    letterSpacing: "0.03em",
  },
  score: {
    fontSize: "8rem",
    fontWeight: "bold" as const,
    color: "#aeaeaeff",
    lineHeight: 1,
    letterSpacing: "-3px",
  },
  scoreActive: {
    color: "#d3e8cbff",
  },
  slots: {
    display: "flex",
    gap: "16px",
    marginTop: "12px",
  },
  slot: {
    width: "96px",
    height: "68px",
    background: "#0d1b35",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #1e3a5f",
  },
  slotFilled: {
    background: "#525f70ff",
    border: "1px solid #36475cff",
  },
  slotLabel: {
    fontSize: "1.4rem",
    fontWeight: "700" as const,
    color: "#eaeaea",
  },
};
