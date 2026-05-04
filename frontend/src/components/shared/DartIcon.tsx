export default function DartIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
    >
      {/*
        Horizontal dart (tip at right, flight at left), rotated 135°
        so the tip points lower-left and flight sits upper-right —
        matching the real dart orientation.
      */}
      <g transform="rotate(135, 50, 50)">
        {/* Full dart outline: needle → barrel → shaft → flight */}
        <polygon points="94,50 70,47 52,45 36,49 15,26 5,38 5,62 15,74 36,51 52,55 70,53" />
      </g>
    </svg>
  );
}
