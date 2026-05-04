import type { Player, DartThrow, GameMode } from "../../types/game";
import ThrowSlots from "../shared/ThrowSlots";

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  currentThrows: DartThrow[];
  mode: GameMode;
}

export default function PlayerCard({
  player,
  isActive,
  currentThrows,
  mode,
}: PlayerCardProps) {
  const rounds = Math.ceil(player.dartsThrown / 3);
  const avg = rounds > 0 ? Math.round((mode - player.score) / rounds) : 0;

  return (
    <div
      className={`flex flex-col items-center p-6 rounded-xl h-full ${
        isActive ? "bg-player-active" : "bg-player-inactive"
      }`}
    >
      {/* Equal top spacer — mirrors the ThrowSlots section below, keeping name+score+avg at true center */}
      <div className="flex-1" />

      <div className="flex flex-col items-center gap-1">
        <span
          className={`text-5xl font-semibold truncate max-w-full ${isActive ? "text-primary" : "text-muted"}`}
        >
          {player.name}
        </span>
        <span
          className={`font-bold tabular-nums leading-none text-[clamp(5rem,14vw,11rem)] ${isActive ? "text-primary" : "text-muted"}`}
        >
          {player.score}
        </span>
        <span className={`text-lg ${isActive ? "text-primary/60" : "text-muted/60"}`}>
          Ø {avg}
        </span>
      </div>

      {/* Equal bottom section — ThrowSlots centered within the remaining space */}
      <div className="flex-1 flex items-center justify-center">
        <ThrowSlots
          throws={isActive ? currentThrows : []}
          invisible={!isActive}
        />
      </div>
    </div>
  );
}
