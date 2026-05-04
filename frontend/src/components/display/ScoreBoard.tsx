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

const SIZES: Record<
  number,
  {
    circle: string;
    initials: string;
    name: string;
    itemGap: string;
    outerGap: string;
  }
> = {
  1: {
    circle: "w-80 h-80",
    initials: "text-8xl",
    name: "text-5xl",
    itemGap: "gap-6",
    outerGap: "gap-24",
  },
  2: {
    circle: "w-72 h-72",
    initials: "text-7xl",
    name: "text-4xl",
    itemGap: "gap-6",
    outerGap: "gap-20",
  },
  3: {
    circle: "w-56 h-56",
    initials: "text-6xl",
    name: "text-3xl",
    itemGap: "gap-5",
    outerGap: "gap-14",
  },
  4: {
    circle: "w-52 h-52",
    initials: "text-5xl",
    name: "text-2xl",
    itemGap: "gap-4",
    outerGap: "gap-8",
  },
};

export default function ScoreBoard({ players }: ScoreBoardProps) {
  const count = players.length;
  const sz = SIZES[count] ?? SIZES[4];

  const cards = players.map((p) => (
    <div key={p.id} className={`flex flex-col items-center ${sz.itemGap}`}>
      <div
        className={`${sz.circle} rounded-full bg-overlay flex items-center justify-center`}
      >
        <span className={`${sz.initials} font-bold text-primary select-none`}>
          {initials(p.name)}
        </span>
      </div>
      <span className={`${sz.name} text-primary font-medium text-7xl`}>
        {p.name}
      </span>
    </div>
  ));

  return (
    <div className="flex items-center justify-center h-full">
      <div
        className={`flex flex-row items-center justify-center ${sz.outerGap}`}
      >
        {cards}
      </div>
    </div>
  );
}
