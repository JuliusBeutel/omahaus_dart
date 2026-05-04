import type { Player } from "../../types/game";

interface ScoreBoardProps {
  players: Player[];
  mode: 301 | 501;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export default function ScoreBoard({ players }: ScoreBoardProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-row items-center justify-center gap-10 flex-wrap">
        {players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-overlay flex items-center justify-center">
              <span className="text-3xl font-bold text-primary select-none">
                {initials(p.name)}
              </span>
            </div>
            <span className="text-primary text-lg font-medium">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
