import type { Player } from '../../types/game';

interface Props {
  players: Player[];
}

export function ScoreBoard({ players }: Props) {
  if (players.length === 0) {
    return <p className="text-muted text-2xl">Warte auf Spieler...</p>;
  }

  return (
    <div className="flex gap-6 flex-wrap justify-center w-full">
      {players.map((player) => (
        <div
          key={player.id}
          className="flex-1 basis-44 max-w-60 bg-surface rounded-2xl p-6 text-center"
        >
          <p className="text-muted text-lg mb-2">{player.name}</p>
          <p className="text-primary text-5xl font-bold tracking-tight">{player.score}</p>
        </div>
      ))}
    </div>
  );
}
