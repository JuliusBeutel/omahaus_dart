import type { Player } from '../../types/game';

interface ScoreBoardProps {
  players: Player[];
  mode: 301 | 501;
}

export default function ScoreBoard({ players, mode }: ScoreBoardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h2 className="text-2xl font-bold text-primary">{mode} — Setup</h2>
      <ul className="flex flex-col gap-3 w-full max-w-xs">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center gap-3 bg-surface border border-accent rounded-lg px-4 py-3"
          >
            <span className="text-muted text-sm w-5">{i + 1}.</span>
            <span className="text-primary font-medium">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
