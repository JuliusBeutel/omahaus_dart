import type { Player, DartThrow, GameMode } from "../../types/game";
import ThrowSlots from "../shared/ThrowSlots";

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  currentThrows: DartThrow[];
  mode: GameMode;
  playerCount: number;
}

const SIZES: Record<number, { padding: string; name: string; score: string; avg: string }> = {
  1: { padding: 'p-6', name: 'text-6xl', score: 'text-[clamp(6rem,16vw,14rem)]',  avg: 'text-xl' },
  2: { padding: 'p-6', name: 'text-5xl', score: 'text-[clamp(5rem,14vw,11rem)]',  avg: 'text-xl' },
  3: { padding: 'p-5', name: 'text-4xl', score: 'text-[clamp(4rem,12vw,9rem)]',   avg: 'text-lg' },
  4: { padding: 'p-4', name: 'text-3xl', score: 'text-[clamp(3rem,10vw,7rem)]',   avg: 'text-lg' },
};

export default function PlayerCard({
  player,
  isActive,
  currentThrows,
  mode,
  playerCount,
}: PlayerCardProps) {
  const rounds = Math.ceil(player.dartsThrown / 3);
  const avg = rounds > 0 ? Math.round((mode - player.score) / rounds) : 0;
  const sz = SIZES[playerCount] ?? SIZES[4];

  return (
    <div
      className={`flex flex-col items-center ${sz.padding} rounded-xl h-full ${
        isActive ? "bg-player-active" : "bg-player-inactive"
      }`}
    >
      <div className="flex-1" />

      <div className="flex flex-col items-center gap-1">
        <span
          className={`${sz.name} font-semibold truncate max-w-full ${isActive ? "text-primary" : "text-muted"}`}
        >
          {player.name}
        </span>
        <span
          className={`font-bold tabular-nums leading-none ${sz.score} ${isActive ? "text-primary" : "text-muted"}`}
        >
          {player.score}
        </span>
        <span className={`${sz.avg} ${isActive ? "text-primary/60" : "text-muted/60"}`}>
          Ø {avg}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ThrowSlots
          throws={isActive ? currentThrows : []}
          invisible={!isActive}
        />
      </div>
    </div>
  );
}
