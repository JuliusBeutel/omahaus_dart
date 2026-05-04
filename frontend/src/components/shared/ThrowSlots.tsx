import type { DartThrow } from "../../types/game";
import { formatThrowLabel } from "../../../lib/gameLogic";
import DartIcon from "./DartIcon";

interface ThrowSlotsProps {
  throws: DartThrow[];
  invisible?: boolean;
  slotClassName?: string;
  isBust?: boolean;
}

export default function ThrowSlots({
  throws,
  invisible = false,
  slotClassName = "bg-surface border border-overlay",
  isBust = false,
}: ThrowSlotsProps) {
  const slots = [0, 1, 2];

  return (
    <div
      className={`flex gap-3 justify-center ${invisible ? "invisible" : ""}`}
    >
      {slots.map((i) => {
        const t = throws[i];
        const isBustDart = isBust && t && i === throws.length - 1;
        return (
          <div
            key={i}
            className={`flex items-center justify-center ${slotClassName} rounded-lg w-16 h-16`}
          >
            {t ? (
              <span
                className={`text-3xl font-bold ${isBustDart ? "text-danger" : "text-primary"}`}
              >
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
