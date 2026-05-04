import type { Player, DartThrow } from '../../types/game';
import ThrowSlots from '../shared/ThrowSlots';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  currentThrows: DartThrow[];
}

export default function PlayerCard({ player, isActive, currentThrows }: PlayerCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-between p-4 rounded-xl h-full ${
        isActive
          ? 'bg-player-active text-primary'
          : 'bg-player-inactive text-muted'
      }`}
    >
      <span className={`text-lg font-semibold truncate max-w-full ${isActive ? 'text-primary' : 'text-muted'}`}>
        {player.name}
      </span>

      <span className={`text-6xl font-bold tabular-nums ${isActive ? 'text-primary' : 'text-muted'}`}>
        {player.score}
      </span>

      <ThrowSlots throws={isActive ? currentThrows : []} invisible={!isActive} />
    </div>
  );
}
