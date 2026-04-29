import type { DartThrow, Multiplier } from "../../types/game";

interface Props {
  throws: DartThrow[];
  total: number;
}

function throwLabel(t: DartThrow): string {
  const prefix: Record<Multiplier, string> = { 1: "", 2: "D", 3: "T" };
  return `${prefix[t.multiplier]}${t.value}`;
}

export function TurnSummary({ throws, total }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base/90">
      <div className="flex flex-col items-center gap-6 animate-pop-in">
        <div className="flex gap-4">
          {throws.map((t, i) => (
            <span key={i} className="text-accent text-3xl font-semibold">
              {throwLabel(t)}
            </span>
          ))}
        </div>
        <p className="text-primary font-bold leading-none" style={{ fontSize: "clamp(4rem, 15vw, 10rem)" }}>
          {total}
        </p>
        <p className="text-muted text-3xl tracking-wide">Punkte</p>
      </div>
    </div>
  );
}
