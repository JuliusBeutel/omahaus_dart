import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGameState } from "../hooks/useGameState";
import QRCodeDisplay from "../components/display/QRCodeDisplay";
import ScoreBoard from "../components/display/ScoreBoard";
import PlayerCard from "../components/display/PlayerCard";
import TurnSummary from "../components/shared/TurnSummary";

interface OverlayState {
  total: number;
  isBust: boolean;
  isLeaving: boolean;
  isWashingMachine: boolean;
}

const OVERLAY_EXIT_START = 2000;
const OVERLAY_UNMOUNT = OVERLAY_EXIT_START + 550;

export default function DisplayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, notFound } = useGameState(id!);
  const prevHistoryLenRef = useRef(0);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const overlayTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (notFound) navigate("/", { replace: true });
  }, [notFound, navigate]);

  useEffect(() => {
    if (!state) return;
    if (state.turnHistory.length > prevHistoryLenRef.current) {
      overlayTimers.current.forEach(clearTimeout);
      overlayTimers.current = [];

      const lastTurn = state.turnHistory[state.turnHistory.length - 1];
      const total = lastTurn.throws.reduce((sum, t) => sum + t.points, 0);
      const allSingles = lastTurn.throws.every((t) => t.multiplier === 1);
      const throwValues = lastTurn.throws
        .map((t) => t.value)
        .sort((a, b) => a - b);
      const isWashingMachine =
        allSingles &&
        throwValues.length === 3 &&
        throwValues[0] === 1 &&
        throwValues[1] === 5 &&
        throwValues[2] === 20;
      setOverlay({
        total,
        isBust: lastTurn.wasBust,
        isLeaving: false,
        isWashingMachine,
      });

      overlayTimers.current.push(
        setTimeout(
          () =>
            setOverlay((prev) => (prev ? { ...prev, isLeaving: true } : null)),
          OVERLAY_EXIT_START,
        ),
      );
      overlayTimers.current.push(
        setTimeout(() => setOverlay(null), OVERLAY_UNMOUNT),
      );
    }
    prevHistoryLenRef.current = state.turnHistory.length;
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full bg-base">
        <span className="text-muted">Lade...</span>
      </div>
    );
  }

  if (state.status === "finished") {
    const winner = state.players.find((p) => p.id === state.winnerId);
    const totalDarts = winner?.dartsThrown ?? 0;
    const totalRounds = Math.ceil(totalDarts / 3);
    const avg = totalRounds > 0 ? Math.round(state.mode / totalRounds) : 0;

    return (
      <div className="flex items-center justify-center h-full bg-base p-6">
        <div className="animate-pop-in flex flex-col items-center justify-center w-full h-full bg-player-active rounded-3xl gap-6">
          <span className="text-primary/60 text-4xl font-medium tracking-widest uppercase">Gewinner</span>
          <span className="text-primary font-bold leading-none text-[clamp(6rem,18vw,18rem)] text-center px-8">
            {winner?.name}
          </span>
          <span className="text-primary/60 text-3xl">Ø {avg} Punkte/Runde</span>
        </div>
      </div>
    );
  }

  if (state.status === "setup") {
    if (state.players.length === 0) {
      return (
        <div className="h-full bg-base">
          <QRCodeDisplay sessionId={id!} />
        </div>
      );
    }
    return (
      <div className="h-full bg-base">
        <ScoreBoard players={state.players} mode={state.mode} />
      </div>
    );
  }

  const gridCols =
    state.players.length === 4
      ? "grid-cols-2 grid-rows-2"
      : state.players.length === 3
        ? "grid-cols-3"
        : state.players.length === 2
          ? "grid-cols-2"
          : "grid-cols-1";

  return (
    <div className="h-full bg-base">
      <div className={`grid h-full gap-2 p-2 ${gridCols}`}>
        {state.players.map((player, i) => {
          const isActive = i === state.currentPlayerIndex;
          let lastTurnThrows: (typeof state.turnHistory)[0]["throws"] = [];
          let lastTurnWasBust = false;
          if (!isActive) {
            for (let h = state.turnHistory.length - 1; h >= 0; h--) {
              const turn = state.turnHistory[h];
              if (turn.playerIndex === i && turn.throws.length > 0) {
                lastTurnThrows = turn.throws;
                lastTurnWasBust = turn.wasBust;
                break;
              }
            }
          }
          return (
            <PlayerCard
              key={player.id}
              player={player}
              isActive={isActive}
              currentThrows={isActive ? state.currentTurn.throws : []}
              lastTurnThrows={lastTurnThrows}
              lastTurnWasBust={lastTurnWasBust}
              mode={state.mode}
              playerCount={state.players.length}
            />
          );
        })}
      </div>

      {overlay && (
        <TurnSummary
          total={overlay.total}
          isBust={overlay.isBust}
          isLeaving={overlay.isLeaving}
          isWashingMachine={overlay.isWashingMachine}
        />
      )}
    </div>
  );
}
