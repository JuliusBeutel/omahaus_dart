import type { Player, DartThrow } from '../../types/game';
import { ThrowSlots } from '../shared/ThrowSlots';

interface Props {
  player: Player;
  isActive: boolean;
  throws: DartThrow[];
}

export function PlayerCard({ player, isActive, throws }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-10 ${
        isActive ? 'bg-player-active' : 'bg-player-inactive'
      }`}
    >
      <p className="text-primary text-2xl tracking-wide">{player.name}</p>
      <p className={`font-bold leading-none tracking-tight text-9xl ${isActive ? 'text-primary' : 'text-muted'}`}>
        {player.score}
      </p>
      <ThrowSlots throws={isActive ? throws : []} visible={true} />
    </div>
  );
}
