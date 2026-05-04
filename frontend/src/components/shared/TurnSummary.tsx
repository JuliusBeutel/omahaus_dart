interface TurnSummaryProps {
  total: number;
  isBust?: boolean;
  isLeaving?: boolean;
}

export default function TurnSummary({
  total,
  isBust = false,
  isLeaving = false,
}: TurnSummaryProps) {
  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-base/90 z-50 ${isLeaving ? 'animate-overlay-out' : 'animate-overlay-in'}`}>
      <div className="animate-pop-in flex flex-col items-center gap-6 bg-surface border border-accent rounded-2xl px-12 py-10">
        {isBust ? (
          <span className="text-5xl font-bold text-danger">Überworfen!</span>
        ) : (
          <>
            <span className="text-9xl font-bold text-primary">
              {total} Punkte
            </span>
          </>
        )}
      </div>
    </div>
  );
}
