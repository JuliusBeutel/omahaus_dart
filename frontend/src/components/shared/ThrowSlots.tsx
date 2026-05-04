import type { DartThrow } from "../../types/game";
import { formatThrowLabel } from "../../../lib/gameLogic";
import DartIcon from "./DartIcon";

interface ThrowSlotsProps {
  throws: DartThrow[];
  invisible?: boolean;
}

export default function ThrowSlots({
  throws,
  invisible = false,
}: ThrowSlotsProps) {
  const slots = [0, 1, 2];

  return (
    <div
      className={`flex gap-3 justify-center ${invisible ? "invisible" : ""}`}
    >
      {slots.map((i) => {
        const t = throws[i];
        return (
          <div
            key={i}
            className="flex items-center justify-center bg-overlay rounded-lg w-16 h-16"
          >
            {t ? (
              <span className="text-3xl  font-bold text-primary">
                {formatThrowLabel(t)}
              </span>
            ) : (
              <DartIcon className="w-9 h-9 text-muted" />
            )}
          </div>
        );
      })}
    </div>
  );
}
